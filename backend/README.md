# HelpHub AI — FastAPI Backend Service

[![Live Backend](https://img.shields.io/badge/Render-Backend%20Live-brightgreen?logo=render)](https://helphub-ai-backend-1.onrender.com)
[![API Docs](https://img.shields.io/badge/Swagger-API%20Docs-blue?logo=swagger)](https://helphub-ai-backend-1.onrender.com/docs)
[![Health Status](https://img.shields.io/badge/Health%20Status-200%20OK-success)](https://helphub-ai-backend-1.onrender.com/api/health)

### 🌐 Live Production Deployment
- **Base API URL**: [https://helphub-ai-backend-1.onrender.com](https://helphub-ai-backend-1.onrender.com)
- **Interactive OpenAPI / Swagger Documentation**: [https://helphub-ai-backend-1.onrender.com/docs](https://helphub-ai-backend-1.onrender.com/docs)
- **Redoc Documentation**: [https://helphub-ai-backend-1.onrender.com/redoc](https://helphub-ai-backend-1.onrender.com/redoc)
- **System Health & Telemetry**: [https://helphub-ai-backend-1.onrender.com/api/health](https://helphub-ai-backend-1.onrender.com/api/health)

---

### Core API Routes

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Health status and AI model connectivity |
| `/api/reports` | `GET`, `POST` | List and submit community problem reports |
| `/api/reports/{id}` | `GET`, `PATCH` | Report details and status transitions |
| `/api/reports/{id}/follow` | `POST` | Follow updates on a specific report |
| `/api/comments` | `GET`, `POST` | Public civic discussion threads |
| `/api/volunteers` | `GET`, `POST` | Volunteer opportunity drives and signups |
| `/api/ai/structure-report` | `POST` | AI problem structuring, categorization, and urgency |
| `/api/ai/translate` | `POST` | Multilingual translation (EN, HI, OR) |
| `/api/ai/summarize-discussion` | `POST` | Summarize comments into key concerns and solutions |
| `/api/ai/generate-complaint-letter` | `POST` | Draft formal civic complaint letters |
| `/api/ai/analyze-image` | `POST` | Cautious visual condition assessment |

---

### Tech Stack

- **Framework**: FastAPI (Python 3.11+)
- **ASGI Server**: Uvicorn
- **Validation**: Pydantic v2 & Pydantic Settings
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **AI Models**: Google Gemma 4 (via local Ollama & Google AI Studio Cloud)
- **Deployment**: Render Web Service (`render.yaml` Blueprint & Dockerfile)
