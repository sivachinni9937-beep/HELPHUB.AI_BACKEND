import pytest
import httpx
from fastapi.testclient import TestClient
from app.main import app
from app.services.ollama_service import ollama_service

@pytest.fixture(autouse=True)
def mock_ollama_offline_by_default(monkeypatch):
    """
    Ensures deterministic, fast tests without network socket delays
    by setting Ollama offline by default for test suite.
    """
    async def mock_health():
        return {
            "status": "offline",
            "connected": False,
            "configured_model": "gemma4",
            "message": "Mocked test offline environment"
        }
    
    async def mock_available():
        return False

    async def mock_generate(*args, **kwargs):
        raise httpx.ConnectError("Mocked test offline environment")

    monkeypatch.setattr(ollama_service, "check_health", mock_health)
    monkeypatch.setattr(ollama_service, "is_model_available", mock_available)
    monkeypatch.setattr(ollama_service, "_generate_completion", mock_generate)

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def citizen_auth_headers():
    return {"Authorization": "Bearer citizen-token"}

@pytest.fixture
def volunteer_auth_headers():
    return {"Authorization": "Bearer volunteer-token"}

@pytest.fixture
def organizer_auth_headers():
    return {"Authorization": "Bearer organizer-token"}

@pytest.fixture
def moderator_auth_headers():
    return {"Authorization": "Bearer moderator-token"}

@pytest.fixture
def admin_auth_headers():
    return {"Authorization": "Bearer admin-token"}
