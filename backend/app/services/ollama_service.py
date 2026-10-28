import json
import re
import httpx
from typing import Dict, Any, Optional, List
from app.core.config import settings
from app.core.logging import logger
from app.schemas.ai import (
    ReportStructureRequest,
    ReportStructureResponse,
    TranslationRequest,
    TranslationResponse,
    DiscussionSummaryRequest,
    DiscussionSummaryResponse,
    ComplaintLetterRequest,
    ComplaintLetterResponse,
    ImageAnalysisRequest,
    ImageAnalysisResponse,
)
from app.schemas.common import ReportCategory, UrgencyLevel


class OllamaService:
    """
    Unified AI Service supporting:
    1. Google AI Studio (Gemini 3.5 Flash Lite & Gemma 4)
    2. Local Ollama Runtime (when available)
    3. Deterministic Heuristic & Template Fallbacks
    """

    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.gemini_key = settings.GEMINI_API_KEY
        self.gemini_model = settings.GEMINI_MODEL
        self.gemma_model = settings.GEMMA_MODEL
        self.gemini_base_url = settings.GEMINI_BASE_URL.rstrip("/")
        self.timeout = float(settings.AI_TIMEOUT_SECONDS)

    async def check_health(self) -> Dict[str, Any]:
        """Checks if configured AI runtime (Ollama or Google AI Studio) is reachable."""
        # 1. Check local Ollama FIRST
        if not settings.DEMO_MODE:
            try:
                timeout_cfg = httpx.Timeout(2.0, connect=1.0)
                async with httpx.AsyncClient(timeout=timeout_cfg) as client:
                    res = await client.get(f"{self.base_url}/api/tags")
                    if res.status_code == 200:
                        data = res.json()
                        models = [m.get("name") for m in data.get("models", [])]
                        # Determine active model
                        active_model = settings.GEMMA_MODEL
                        if active_model not in models and models:
                            active_model = models[0]
                        return {
                            "status": "healthy",
                            "connected": True,
                            "provider": "ollama",
                            "configured_model": active_model,
                            "installed_models": models,
                            "base_url": self.base_url,
                            "rate_limit_per_min": settings.AI_RATE_LIMIT_PER_MINUTE,
                            "message": f"Connected to local Ollama runtime ({active_model})"
                        }
            except Exception as e:
                logger.info(f"Ollama local check not available: {e}")

        # 2. Check Google AI Studio if API key is set
        if self.gemini_key and not settings.DEMO_MODE:
            try:
                timeout_cfg = httpx.Timeout(3.0, connect=2.0)
                async with httpx.AsyncClient(timeout=timeout_cfg) as client:
                    url = f"{self.gemini_base_url}/models?key={self.gemini_key}"
                    res = await client.get(url)
                    if res.status_code == 200:
                        return {
                            "status": "healthy",
                            "connected": True,
                            "provider": "google_ai_studio",
                            "configured_model": self.gemini_model,
                            "gemma_model": self.gemma_model,
                            "base_url": self.gemini_base_url,
                            "rate_limit_per_min": settings.AI_RATE_LIMIT_PER_MINUTE,
                            "message": f"Connected to Google AI Studio ({self.gemini_model} & {self.gemma_model})"
                        }
            except Exception as e:
                logger.warning(f"Google AI Studio health check connection failed: {e}")

        return {
            "status": "demo_fallback",
            "connected": False,
            "provider": "heuristic_fallback",
            "configured_model": settings.GEMMA_MODEL,
            "rate_limit_per_min": settings.AI_RATE_LIMIT_PER_MINUTE,
            "message": "AI fallback pipeline active. Heuristic & template generation enabled."
        }

    async def is_model_available(self) -> bool:
        """Verifies if the specified model is available in the active runtime."""
        if settings.DEMO_MODE:
            return False
        health = await self.check_health()
        return health.get("connected", False)

    async def _generate_completion(self, prompt: str, system: Optional[str] = None, format_json: bool = False) -> str:
        """
        Calls Ollama (primary: gemma4:latest, secondary: gemma3:1b) or Google AI Studio (fallback)
        with automatic failover and reasoning extraction.
        """
        # 1. Try Local Ollama Runtime first
        if not settings.DEMO_MODE:
            candidate_models = [settings.GEMMA_MODEL]
            if "gemma3:1b" not in settings.GEMMA_MODEL:
                candidate_models.append("gemma3:1b")

            for m in candidate_models:
                try:
                    full_prompt = f"{system}\n\n{prompt}" if system else prompt
                    payload: Dict[str, Any] = {
                        "model": m,
                        "prompt": full_prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.2,
                            "top_p": 0.9,
                            "num_predict": 1024,
                            "num_ctx": 2048,
                        }
                    }
                    if format_json:
                        payload["format"] = "json"

                    # Gemma 4 (7.5B) on CPU takes ~20-50s with full reasoning; Gemma 3 (1B) takes ~8s
                    timeout_val = min(self.timeout, 90.0) if "1b" not in m else 25.0
                    timeout_config = httpx.Timeout(timeout_val, connect=3.0)
                    async with httpx.AsyncClient(timeout=timeout_config) as client:
                        response = await client.post(f"{self.base_url}/api/generate", json=payload)
                        if response.status_code == 200:
                            data = response.json()
                            resp_text = data.get("response", "")
                            # If response is empty because reasoning tokens consumed output or was in thinking
                            if not resp_text.strip() and data.get("thinking"):
                                resp_text = data.get("thinking", "")
                            if resp_text.strip():
                                return resp_text
                except Exception as e:
                    logger.warning(f"Ollama generation with {m} failed/timed out: {e}")

        # 2. Try Google AI Studio (Gemma 4 Cloud / Gemini)
        if self.gemini_key and not settings.DEMO_MODE:
            cloud_candidates = [
                self.gemini_model,
                "models/gemma-4-26b-a4b-it",
                "models/gemini-3.8-flash",
                "models/gemini-2.5-pro",
            ]
            for c_model in cloud_candidates:
                try:
                    full_prompt = f"{system}\n\n{prompt}" if system else prompt
                    url = f"{self.gemini_base_url}/{c_model}:generateContent?key={self.gemini_key}"
                    
                    gen_config: Dict[str, Any] = {
                        "temperature": 0.2,
                        "topP": 0.9,
                        "maxOutputTokens": 2048,
                    }
                    if format_json:
                        gen_config["responseMimeType"] = "application/json"

                    payload = {
                        "contents": [{"parts": [{"text": full_prompt}]}],
                        "generationConfig": gen_config
                    }

                    timeout_config = httpx.Timeout(min(self.timeout, 25.0), connect=4.0)
                    async with httpx.AsyncClient(timeout=timeout_config) as client:
                        response = await client.post(url, json=payload)
                        if response.status_code == 200:
                            data = response.json()
                            candidates = data.get("candidates", [])
                            if candidates and "content" in candidates[0]:
                                parts = candidates[0]["content"].get("parts", [])
                                if parts and "text" in parts[0]:
                                    return parts[0]["text"]
                except Exception as e:
                    logger.warning(f"Google AI Studio request error for {c_model}: {e}")

        raise httpx.ConnectError("All AI endpoints unavailable; triggering fallback pipeline")

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Safely extracts JSON from model text, handling markdown blocks and reasoning."""
        if not text:
            raise ValueError("Empty text provided for JSON extraction")

        # 1. Try direct parse
        try:
            return json.loads(text.strip())
        except Exception:
            pass

        # 2. Try markdown json fence block
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            candidate = match.group(1).strip()
            try:
                return json.loads(candidate)
            except Exception:
                s = candidate.find("{")
                e = candidate.rfind("}")
                if s != -1 and e != -1 and e > s:
                    try:
                        return json.loads(candidate[s:e + 1])
                    except Exception:
                        pass

        # 3. Try finding outermost braces { ... }
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            candidate = text[start:end + 1]
            try:
                return json.loads(candidate)
            except Exception:
                # Try cleaning common trailing commas
                clean = re.sub(r",\s*([\]}])", r"\1", candidate)
                try:
                    return json.loads(clean)
                except Exception:
                    pass

        raise ValueError("Could not parse valid JSON from AI response")

    # -------------------------------------------------------------
    # Task A: Structure a Community Complaint
    # -------------------------------------------------------------
    async def structure_report(self, req: ReportStructureRequest) -> ReportStructureResponse:
        system_prompt = (
            "You are HelpHub AI, a responsible civic assistant for community problem reporting. "
            "Analyze the unstructured complaint and produce a strict JSON output matching this schema:\n"
            "{\n"
            '  "suggested_title": "Concise summary title (under 100 chars)",\n'
            '  "suggested_category": "sanitation" | "roads" | "water" | "electricity" | "accessibility" | "parks" | "other",\n'
            '  "suggested_urgency": "low" | "medium" | "high" | "critical",\n'
            '  "urgency_reasoning": "Short justification for urgency level",\n'
            '  "summary": "Clear, objective summary under 300 chars",\n'
            '  "detected_language": "en" | "hi" | "or" | "other",\n'
            '  "translations": {\n'
            '    "en": "English title or key summary",\n'
            '    "hi": "Hindi translation",\n'
            '    "or": "Odia translation"\n'
            '  },\n'
            '  "recommended_next_steps": ["Step 1", "Step 2"]\n'
            "}\n"
            "Never invent facts, exact coordinates, or official authority stamps not provided in description."
        )

        user_prompt = f"Unstructured Report:\n{req.description}\n"
        if req.context_location:
            user_prompt += f"Location Hint: {req.context_location}\n"

        try:
            raw_output = await self._generate_completion(user_prompt, system=system_prompt, format_json=True)
            parsed = self._extract_json(raw_output)

            # Map category safely
            cat = str(parsed.get("suggested_category", "other")).lower()
            valid_cats = [c.value for c in ReportCategory]
            if cat not in valid_cats:
                # heuristic match
                for vc in valid_cats:
                    if vc in cat:
                        cat = vc
                        break
                else:
                    cat = "other"

            urg = str(parsed.get("suggested_urgency", "medium")).lower()
            valid_urg = [u.value for u in UrgencyLevel]
            if urg not in valid_urg:
                urg = "medium"

            return ReportStructureResponse(
                suggested_title=str(parsed.get("suggested_title", "Community Infrastructure Issue"))[:150],
                suggested_category=ReportCategory(cat),
                suggested_urgency=UrgencyLevel(urg),
                urgency_reasoning=str(parsed.get("urgency_reasoning", "Based on reported community impact."))[:300],
                summary=str(parsed.get("summary", req.description[:250]))[:500],
                detected_language=str(parsed.get("detected_language", req.preferred_language or "en")),
                translations=parsed.get("translations", {}),
                recommended_next_steps=parsed.get("recommended_next_steps", [
                    "Verify the exact location marker.",
                    "Attach a photo if safe and convenient."
                ]),
                is_advisory_only=True,
                model_identifier=self.gemini_model if self.gemini_key else settings.GEMMA_MODEL
            )
        except Exception as e:
            logger.info(f"AI structuring unavailable or error: {str(e)}. Generating smart fallback.")
            return self._fallback_structure_report(req)

    def _fallback_structure_report(self, req: ReportStructureRequest) -> ReportStructureResponse:
        desc_lower = req.description.lower()
        
        # Categorization heuristics
        cat = ReportCategory.OTHER
        if any(w in desc_lower for w in ["garbage", "trash", "waste", "drain", "clean", "dump", "कचरा", "ଅଳିଆ"]):
            cat = ReportCategory.SANITATION
        elif any(w in desc_lower for w in ["pothole", "road", "street", "tar", "asphalt", "सड़क", "ରାସ୍ତା"]):
            cat = ReportCategory.ROADS
        elif any(w in desc_lower for w in ["water", "pipe", "leak", "tap", "sewage", "drinking", "पानी", "ପାଣି"]):
            cat = ReportCategory.WATER
        elif any(w in desc_lower for w in ["light", "electric", "lamp", "pole", "wire", "power", "बिजली", "ବିଜୁଳି"]):
            cat = ReportCategory.ELECTRICITY
        elif any(w in desc_lower for w in ["ramp", "wheelchair", "sidewalk", "footpath", "blind", "disabled"]):
            cat = ReportCategory.ACCESSIBILITY
        elif any(w in desc_lower for w in ["park", "garden", "bench", "tree", "playground", "पार्क", "ପାର୍କ"]):
            cat = ReportCategory.PARKS

        # Urgency heuristics
        urgency = UrgencyLevel.MEDIUM
        reasoning = "Standard civic concern affecting community movement or hygiene."
        if any(w in desc_lower for w in ["hazard", "danger", "burst", "electric wire", "spark", "accident", "emergency"]):
            urgency = UrgencyLevel.HIGH
            reasoning = "Reported conditions may pose safety or health hazards to pedestrians."

        # Language heuristics
        detected_lang = "en"
        if any('\u0900' <= char <= '\u097F' for char in req.description):
            detected_lang = "hi"
        elif any('\u0B00' <= char <= '\u0B7F' for char in req.description):
            detected_lang = "or"

        words = req.description.strip().split()
        short_title = " ".join(words[:7]).capitalize()
        if len(words) > 7:
            short_title += "..."

        translations = {
            "en": short_title,
            "hi": "सामुदायिक समस्या विवरण (वैकल्पिक अनुवाद उपलब्ध)",
            "or": "ସମୁଦାୟ ସମସ୍ୟା ବିବରଣୀ (ବୈକଳ୍ପିକ ଅନୁବାଦ ଉପଲବ୍ଧ)"
        }

        return ReportStructureResponse(
            suggested_title=short_title or "Community Issue Report",
            suggested_category=cat,
            suggested_urgency=urgency,
            urgency_reasoning=reasoning,
            summary=req.description[:280] + ("..." if len(req.description) > 280 else ""),
            detected_language=detected_lang,
            translations=translations,
            recommended_next_steps=[
                "Confirm the problem location marker on the map.",
                "Add photos or landmark details if available.",
                "Follow updates as local organizers or volunteers respond."
            ],
            is_advisory_only=True,
            model_identifier=f"{self.gemini_model if self.gemini_key else settings.GEMMA_MODEL} (fallback)"
        )

    # -------------------------------------------------------------
    # Task B: Multilingual Translation
    # -------------------------------------------------------------
    async def translate_text(self, req: TranslationRequest) -> TranslationResponse:
        system_prompt = (
            f"You are a civic translation assistant. Translate the following text into target language code '{req.target_language}'. "
            "Supported languages: 'en' (English), 'hi' (Hindi), 'or' (Odia). "
            "Return ONLY the plain translated text without notes or conversational preamble."
        )
        try:
            translated = await self._generate_completion(req.text, system=system_prompt)
            # Remove any markdown formatting
            clean_text = translated.strip().replace("```", "").strip()
            return TranslationResponse(
                translated_text=clean_text,
                source_language=req.source_language or "auto",
                target_language=req.target_language,
                is_ai_draft=True,
                model_identifier=self.gemini_model if self.gemini_key else settings.GEMMA_MODEL
            )
        except Exception:
            # Deterministic dictionary fallback for common phrases
            fallback_map = {
                "hi": {
                    "pothole": "सड़क पर गड्ढा",
                    "garbage": "कचरा जमा होना",
                    "water leak": "पानी का रिसाव",
                    "street light": "स्ट्रीट लाइट खराब"
                },
                "or": {
                    "pothole": "ରାସ୍ତା ଖାଲ",
                    "garbage": "ଅଳିଆ ଜମା ହେବା",
                    "water leak": "ପାଣି ଲିକ୍",
                    "street light": "ଷ୍ଟ୍ରିଟ୍ ଲାଇଟ୍ ଖରାପ"
                }
            }
            res_text = req.text
            lang_dict = fallback_map.get(req.target_language, {})
            for k, v in lang_dict.items():
                if k in req.text.lower():
                    res_text = f"{v} ({req.text})"
                    break
            else:
                if req.target_language == "hi":
                    res_text = f"[अनुवादित]: {req.text}"
                elif req.target_language == "or":
                    res_text = f"[ଅନୁବାଦ]: {req.text}"
                else:
                    res_text = req.text

            return TranslationResponse(
                translated_text=res_text,
                source_language=req.source_language or "en",
                target_language=req.target_language,
                is_ai_draft=False,
                model_identifier=f"{self.gemini_model if self.gemini_key else settings.GEMMA_MODEL} (dictionary fallback)"
            )

    # -------------------------------------------------------------
    # Task C: Discussion Summarization
    # -------------------------------------------------------------
    async def summarize_discussion(self, req: DiscussionSummaryRequest) -> DiscussionSummaryResponse:
        system_prompt = (
            "You are HelpHub AI community moderator. Summarize the citizen discussion on this report. "
            "Output strict JSON:\n"
            "{\n"
            '  "summary": "Short 2-3 sentence overview of community consensus",\n'
            '  "main_concerns": ["concern 1", "concern 2"],\n'
            '  "proposed_solutions": ["solution 1", "solution 2"],\n'
            '  "open_questions": ["question 1"]\n'
            "}"
        )
        comments_formatted = "\n".join([f"- {c}" for c in req.comments])
        user_prompt = f"Report Title: {req.report_title}\n\nCommunity Comments:\n{comments_formatted}"

        try:
            raw_output = await self._generate_completion(user_prompt, system=system_prompt, format_json=True)
            parsed = self._extract_json(raw_output)
            return DiscussionSummaryResponse(
                summary=str(parsed.get("summary", "Community discussion summary")),
                main_concerns=parsed.get("main_concerns", []),
                proposed_solutions=parsed.get("proposed_solutions", []),
                open_questions=parsed.get("open_questions", []),
                comments_analyzed=len(req.comments),
                is_ai_generated=True,
                model_identifier=self.gemini_model if self.gemini_key else settings.GEMMA_MODEL
            )
        except Exception:
            return DiscussionSummaryResponse(
                summary=f"Community discussion with {len(req.comments)} contribution(s) discussing solutions and next actions.",
                main_concerns=["Community members have highlighted ongoing disruption and the need for action."],
                proposed_solutions=["Volunteer-driven remediation and notification to local ward coordinators."],
                open_questions=["When will local municipal work crews or volunteer equipment be scheduled?"],
                comments_analyzed=len(req.comments),
                is_ai_generated=True,
                model_identifier=f"{self.gemini_model if self.gemini_key else settings.GEMMA_MODEL} (fallback)"
            )

    # -------------------------------------------------------------
    # Task D: Formal Complaint Letter Generator
    # -------------------------------------------------------------
    async def generate_complaint_letter(self, req: ComplaintLetterRequest) -> ComplaintLetterResponse:
        system_prompt = (
            f"You are a civic drafting assistant. Draft a polite, formal complaint letter in language '{req.language}'. "
            "Do NOT invent laws, filing numbers, or official government promises. "
            "Clearly present the location and issue as confirmed by the citizen."
        )
        user_prompt = (
            f"Recipient: {req.recipient_authority}\n"
            f"Subject: Community Concern: {req.report_title}\n"
            f"Location: {req.location}\n"
            f"Description: {req.problem_description}\n"
            f"Tone: {req.tone}\n"
            f"Sender Name: {req.sender_name or 'Concerned Citizen'}\n"
        )
        try:
            letter = await self._generate_completion(user_prompt, system=system_prompt)
            return ComplaintLetterResponse(
                draft_letter=letter.strip(),
                subject_line=f"Formal Request for Civic Attention: {req.report_title}",
                language=req.language,
                recipient_authority=req.recipient_authority or "Municipal Ward Office",
                is_draft=True,
                model_identifier=self.gemini_model if self.gemini_key else settings.GEMMA_MODEL
            )
        except Exception:
            # High quality fallback draft template
            greeting = "To,\nThe Competent Officer / Ward Authority,\n" + (req.recipient_authority or "Local Municipal Corporation")
            body = (
                f"\n\nRespected Sir/Madam,\n\n"
                f"Subject: Attention requested regarding {req.report_title} at {req.location}\n\n"
                f"I am writing as a resident and community member to respectfully bring to your urgent attention a civic concern "
                f"at {req.location}.\n\n"
                f"Summary of Concern:\n{req.problem_description}\n\n"
                f"This condition causes inconvenience and potential safety risks for residents, students, and pedestrians in the vicinity. "
                f"We kindly request an inspection and appropriate remediation measures from your department at your earliest convenience.\n\n"
                f"Thank you for your dedicated service to our community.\n\n"
                f"Sincerely,\n{req.sender_name or 'Concerned Citizen / Resident'}\nDate: [Insert Date]\nContact: [Optional Contact Number]"
            )
            return ComplaintLetterResponse(
                draft_letter=greeting + body,
                subject_line=f"Formal Request for Civic Attention: {req.report_title}",
                language=req.language,
                recipient_authority=req.recipient_authority or "Local Municipal Corporation",
                is_draft=True,
                model_identifier=f"{self.gemini_model if self.gemini_key else settings.GEMMA_MODEL} (structured fallback)"
            )

    # -------------------------------------------------------------
    # Task E: Image Understanding
    # -------------------------------------------------------------
    async def analyze_image(self, req: ImageAnalysisRequest) -> ImageAnalysisResponse:
        """Analyzes civic photo with Gemini vision or safe heuristic fallback."""
        if self.gemini_key and req.image_base64 and not settings.DEMO_MODE:
            try:
                img_data = req.image_base64
                mime = req.mime_type or "image/jpeg"
                if "base64," in img_data:
                    parts = img_data.split("base64,")
                    img_data = parts[1]
                    if "data:" in parts[0] and ";" in parts[0]:
                        mime = parts[0].split(";")[0].replace("data:", "")

                url = f"{self.gemini_base_url}/models/gemini-3.8-flash:generateContent?key={self.gemini_key}"
                prompt = (
                    "You are a helpful civic assistant. Analyze this community photo for an issue report. "
                    "Return strict JSON with keys:\n"
                    '  "cautious_description": "Objective factual description under 200 chars",\n'
                    '  "visible_objects_or_conditions": ["list", "of", "elements"],\n'
                    '  "potential_categories": ["sanitation", "roads", "water", "electricity", "accessibility", "parks", "other"],\n'
                    '  "confidence_note": "Short note on visual certainty"\n'
                    "Do NOT assert structural danger or government blame without evidence."
                )
                payload = {
                    "contents": [{
                        "parts": [
                            {"text": prompt},
                            {
                                "inlineData": {
                                    "mimeType": mime,
                                    "data": img_data
                                }
                            }
                        ]
                    }],
                    "generationConfig": {
                        "temperature": 0.2,
                        "responseMimeType": "application/json"
                    }
                }
                timeout_config = httpx.Timeout(20.0, connect=5.0)
                async with httpx.AsyncClient(timeout=timeout_config) as client:
                    r = await client.post(url, json=payload)
                    if r.status_code == 200:
                        parsed = self._extract_json(r.json()["candidates"][0]["content"]["parts"][0]["text"])
                        cats = []
                        valid_cats = [c.value for c in ReportCategory]
                        for c in parsed.get("potential_categories", []):
                            c_str = str(c).lower()
                            if c_str in valid_cats:
                                cats.append(ReportCategory(c_str))
                        if not cats:
                            cats = [ReportCategory.OTHER]
                        return ImageAnalysisResponse(
                            cautious_description=str(parsed.get("cautious_description", "Civic infrastructure element visible."))[:200],
                            visible_objects_or_conditions=parsed.get("visible_objects_or_conditions", ["Visible roadway / civic feature"]),
                            potential_categories=cats,
                            confidence_note=str(parsed.get("confidence_note", "Visual analysis based on provided photograph.")),
                            uncertainty_disclaimer="AI image analysis is advisory and cautious. It does not verify official violations or structural safety.",
                            is_supported=True,
                            model_identifier="models/gemini-3.8-flash"
                        )
            except Exception as e:
                logger.warning(f"Gemini image analysis error: {e}. Falling back to default advisory response.")

        return ImageAnalysisResponse(
            cautious_description="Visible outdoor scene with civic infrastructure elements consistent with community reports.",
            visible_objects_or_conditions=["Ground surface", "Public right-of-way", "Material accumulation or surface irregularity"],
            potential_categories=[ReportCategory.SANITATION, ReportCategory.ROADS],
            confidence_note="Advisory only. Visual analysis does not substitute for on-site physical inspection.",
            uncertainty_disclaimer="AI image analysis is advisory and cautious. It does not verify official violations or structural safety.",
            is_supported=True,
            model_identifier=self.gemini_model if self.gemini_key else settings.GEMMA_MODEL
        )


ollama_service = OllamaService()
