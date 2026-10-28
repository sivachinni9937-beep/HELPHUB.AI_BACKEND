from fastapi import APIRouter, Depends, Request
from app.core.rate_limit import ai_rate_limiter
from app.core.security import get_optional_user, AuthenticatedUser
from app.services.ollama_service import ollama_service
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

router = APIRouter(prefix="/ai", tags=["AI Assistance (Gemma)"])


def rate_limit_check(request: Request, user: AuthenticatedUser = Depends(get_optional_user)):
    # Rate limit by user id or client IP
    client_id = user.id if user else (request.client.host if request.client else "unknown_client")
    ai_rate_limiter.check(client_id)


@router.post("/structure-report", response_model=ReportStructureResponse, dependencies=[Depends(rate_limit_check)])
async def structure_report(req: ReportStructureRequest):
    """
    Task A: Analyzes raw problem description, proposes category, advisory urgency,
    summary, multilingual translations (EN, HI, OR), and actionable next steps.
    """
    return await ollama_service.structure_report(req)


@router.post("/translate", response_model=TranslationResponse, dependencies=[Depends(rate_limit_check)])
async def translate_text(req: TranslationRequest):
    """
    Task B: Accurately translates community descriptions across English, Hindi, and Odia.
    """
    return await ollama_service.translate_text(req)


@router.post("/summarize-discussion", response_model=DiscussionSummaryResponse, dependencies=[Depends(rate_limit_check)])
async def summarize_discussion(req: DiscussionSummaryRequest):
    """
    Task C: Summarizes community discussions into main concerns, proposed solutions,
    and open questions without hallucinating consensus.
    """
    return await ollama_service.summarize_discussion(req)


@router.post("/generate-complaint-letter", response_model=ComplaintLetterResponse, dependencies=[Depends(rate_limit_check)])
async def generate_complaint_letter(req: ComplaintLetterRequest):
    """
    Task D: Drafts a polite, formal civic complaint letter for the citizen's personal review and filing.
    Never falsely claims the letter has been officially filed.
    """
    return await ollama_service.generate_complaint_letter(req)


@router.post("/analyze-image", response_model=ImageAnalysisResponse, dependencies=[Depends(rate_limit_check)])
async def analyze_image(req: ImageAnalysisRequest):
    """
    Task E: Cautious visual condition assessment for uploaded community issue photos.
    """
    return await ollama_service.analyze_image(req)

