import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.logging import logger, request_id_ctx
from app.services.ollama_service import ollama_service
from app.api.routes import health, ai, reports, comments, volunteers, notifications, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup verification
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")
    ollama_info = await ollama_service.check_health()
    if ollama_info.get("connected"):
        logger.info(f"Ollama connected at {settings.OLLAMA_BASE_URL}. Configured Model: {settings.GEMMA_MODEL}")
    else:
        logger.info(f"Ollama offline ({settings.OLLAMA_BASE_URL}). Safe fallback heuristic pipeline active.")
    yield
    logger.info("Shutting down HelpHub AI backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API service for HelpHub AI — Civic Problem Solver with Gemma 4 assistance.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Request ID & Logging Middleware
@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    token = request_id_ctx.set(req_id)
    try:
        response = await call_next(request)
        response.headers["X-Request-ID"] = req_id
        return response
    finally:
        request_id_ctx.reset(token)


# CORS Middleware
origins = settings.FRONTEND_ORIGINS if isinstance(settings.FRONTEND_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Validation Error Handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = ".".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        errors.append({
            "field": field,
            "message": err.get("msg", "Invalid value"),
            "type": err.get("type", "value_error")
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation failed",
            "details": errors
        }
    )

# Include API Routers
app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(ai.router, prefix=settings.API_V1_PREFIX)
app.include_router(reports.router, prefix=settings.API_V1_PREFIX)
app.include_router(comments.router, prefix=settings.API_V1_PREFIX)
app.include_router(volunteers.router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications.router, prefix=settings.API_V1_PREFIX)
app.include_router(admin.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": "Report a problem. Find a solution. Build a better community.",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health"
    }

