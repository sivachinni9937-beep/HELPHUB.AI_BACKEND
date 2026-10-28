from typing import List, Dict, Optional
from pydantic import BaseModel, Field, field_validator
from app.schemas.common import ReportCategory, UrgencyLevel


class ReportStructureRequest(BaseModel):
    description: str = Field(..., min_length=10, max_length=5000, description="Raw unstructured problem description")
    preferred_language: Optional[str] = Field("en", pattern="^(en|hi|or)$")
    context_location: Optional[str] = Field(None, max_length=200)


class ReportStructureResponse(BaseModel):
    suggested_title: str = Field(..., max_length=150)
    suggested_category: ReportCategory
    suggested_urgency: UrgencyLevel
    urgency_reasoning: str = Field(..., max_length=300)
    summary: str = Field(..., max_length=500)
    detected_language: str = Field(..., pattern="^(en|hi|or|other)$")
    translations: Dict[str, str] = Field(default_factory=dict)
    recommended_next_steps: List[str] = Field(default_factory=list)
    is_advisory_only: bool = True
    model_identifier: str = "gemma4"


class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    target_language: str = Field(..., pattern="^(en|hi|or)$")
    source_language: Optional[str] = Field("auto")


class TranslationResponse(BaseModel):
    translated_text: str
    target_language: str
    source_language: str
    is_ai_draft: bool = True
    model_identifier: str = "gemma4"


class DiscussionSummaryRequest(BaseModel):
    report_title: str = Field(..., max_length=200)
    comments: List[str] = Field(..., min_length=1, max_length=100)


class DiscussionSummaryResponse(BaseModel):
    summary: str
    main_concerns: List[str]
    proposed_solutions: List[str]
    open_questions: List[str]
    comments_analyzed: int
    is_ai_generated: bool = True
    model_identifier: str = "gemma4"


class ComplaintLetterRequest(BaseModel):
    report_title: str = Field(..., max_length=200)
    problem_description: str = Field(..., max_length=2000)
    location: str = Field(..., max_length=250)
    recipient_authority: Optional[str] = Field("Municipal Corporation / Ward Office", max_length=150)
    language: str = Field("en", pattern="^(en|hi|or)$")
    tone: Optional[str] = Field("polite_formal", pattern="^(polite_formal|urgent_official|constructive)$")
    sender_name: Optional[str] = Field(None, max_length=100)


class ComplaintLetterResponse(BaseModel):
    draft_letter: str
    subject_line: str
    language: str
    recipient_authority: str
    is_draft: bool = True
    filing_disclaimer: str = "This is an AI-assisted draft for your personal review. It has NOT been submitted to any official authority. Verify all facts before sending."
    model_identifier: str = "gemma4"


class ImageAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    context_note: Optional[str] = Field(None, max_length=500)


class ImageAnalysisResponse(BaseModel):
    cautious_description: str
    visible_objects_or_conditions: List[str]
    potential_categories: List[ReportCategory]
    confidence_note: str
    uncertainty_disclaimer: str = "AI image analysis is advisory and cautious. It does not verify official violations or structural safety."
    is_supported: bool = True
    model_identifier: str = "gemma4"
