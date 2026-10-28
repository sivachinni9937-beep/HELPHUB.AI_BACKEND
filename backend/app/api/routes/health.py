from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings
from app.services.ollama_service import ollama_service

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def get_health():
    """
    Health and readiness check for HelpHub AI platform.
    Verifies API status, configured Ollama model runtime, and environment modes.
    """
    ollama_status = await ollama_service.check_health()
    model_installed = await ollama_service.is_model_available() if ollama_status.get("connected") else False

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "demo_mode": settings.DEMO_MODE,
        "ai_runtime": {
            "status": ollama_status.get("status"),
            "connected": ollama_status.get("connected"),
            "configured_model": settings.GEMMA_MODEL,
            "model_installed": model_installed,
            "base_url": settings.OLLAMA_BASE_URL,
            "rate_limit_per_min": settings.AI_RATE_LIMIT_PER_MINUTE
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

