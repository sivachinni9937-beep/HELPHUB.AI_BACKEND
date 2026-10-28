import pytest
from app.services.ollama_service import ollama_service
from app.schemas.ai import (
    ReportStructureRequest,
    TranslationRequest,
    DiscussionSummaryRequest,
    ComplaintLetterRequest
)
from app.schemas.common import ReportCategory

@pytest.mark.asyncio
async def test_structure_report_sanitation_heuristic():
    req = ReportStructureRequest(
        description="Huge pile of rotten garbage and trash dumped next to the primary school gate causing bad odor.",
        preferred_language="en"
    )
    res = await ollama_service.structure_report(req)
    assert res.suggested_category == ReportCategory.SANITATION
    assert len(res.suggested_title) > 0
    assert "en" in res.translations
    assert res.is_advisory_only is True

@pytest.mark.asyncio
async def test_structure_report_roads_heuristic():
    req = ReportStructureRequest(
        description="Dangerous large pothole on main road causing bikes to slip at night.",
        preferred_language="en"
    )
    res = await ollama_service.structure_report(req)
    assert res.suggested_category == ReportCategory.ROADS

@pytest.mark.asyncio
async def test_multilingual_translation_request():
    req = TranslationRequest(
        text="The streetlight near the crossing is broken.",
        target_language="hi"
    )
    res = await ollama_service.translate_text(req)
    assert res.target_language == "hi"
    assert len(res.translated_text) > 0

@pytest.mark.asyncio
async def test_discussion_summary():
    req = DiscussionSummaryRequest(
        report_title="Broken Water Pipe",
        comments=[
            "Water has been overflowing into our shops for 2 days.",
            "I called the municipal helpline, they gave reference #492.",
            "Local volunteers can put sandbags temporarily until the crew arrives."
        ]
    )
    res = await ollama_service.summarize_discussion(req)
    assert len(res.summary) > 0
    assert res.comments_analyzed == 3
    assert res.is_ai_generated is True

@pytest.mark.asyncio
async def test_complaint_letter_generation():
    req = ComplaintLetterRequest(
        report_title="Overflowing drainage near market",
        problem_description="Stagnant drainage water is blocking customer access to shops.",
        location="Unit 4 Market, Bhubaneswar",
        language="en",
        recipient_authority="Ward Sanitary Inspector",
        sender_name="Local Residents Committee"
    )
    res = await ollama_service.generate_complaint_letter(req)
    assert res.is_draft is True
    assert "Unit 4 Market" in res.draft_letter
    assert "Ward Sanitary Inspector" in res.draft_letter
    assert "NOT been submitted" in res.filing_disclaimer

@pytest.mark.asyncio
async def test_ollama_mocked_valid_json_response(monkeypatch):
    mock_json = """
    {
      "suggested_title": "Damaged Pothole on Market Road",
      "suggested_category": "roads",
      "suggested_urgency": "high",
      "urgency_reasoning": "Large hole causing vehicular damage and risk to two-wheelers.",
      "summary": "Deep pothole causing hazards near Market Road.",
      "detected_language": "en",
      "translations": {
        "en": "Damaged Pothole on Market Road",
        "hi": "मार्केट रोड पर खतरनाक गड्ढा",
        "or": "ମାର୍କେଟ ରୋଡରେ ବିପଦପୂର୍ଣ୍ଣ ଖାଲ"
      },
      "recommended_next_steps": ["Place warning cone", "Notify ward engineer"]
    }
    """
    async def mock_gen(*args, **kwargs):
        return mock_json

    monkeypatch.setattr(ollama_service, "_generate_completion", mock_gen)
    req = ReportStructureRequest(description="Deep pothole on Market Road near crossing.", preferred_language="en")
    res = await ollama_service.structure_report(req)
    assert res.suggested_category == ReportCategory.ROADS
    assert res.suggested_urgency.value == "high"
    assert "Market Road" in res.suggested_title
    assert "hi" in res.translations

@pytest.mark.asyncio
async def test_ollama_invalid_json_fallback(monkeypatch):
    async def mock_bad_json(*args, **kwargs):
        return "This is not json at all! System error 500."

    monkeypatch.setattr(ollama_service, "_generate_completion", mock_bad_json)
    req = ReportStructureRequest(description="Garbage piling up near school gate.", preferred_language="en")
    res = await ollama_service.structure_report(req)
    # Must safely fall back to heuristics without crashing
    assert res.suggested_category == ReportCategory.SANITATION
    assert res.is_advisory_only is True

@pytest.mark.asyncio
async def test_ollama_timeout_handling(monkeypatch):
    async def mock_timeout(*args, **kwargs):
        import httpx
        raise httpx.TimeoutException("Ollama request timed out after 60s")

    monkeypatch.setattr(ollama_service, "_generate_completion", mock_timeout)
    req = ReportStructureRequest(description="Water leaking from public pipe.", preferred_language="en")
    res = await ollama_service.structure_report(req)
    assert res.suggested_category == ReportCategory.WATER
