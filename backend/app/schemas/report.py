from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from app.schemas.common import ReportCategory, UrgencyLevel, ReportStatus, ResolutionType


class ReportCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=150)
    description: str = Field(..., min_length=10, max_length=5000)
    category: ReportCategory
    user_confirmed_urgency: UrgencyLevel = UrgencyLevel.MEDIUM
    approximate_public_location: str = Field(..., min_length=3, max_length=200)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    preferred_language: str = Field("en", pattern="^(en|hi|or)$")
    ai_structured: bool = False
    translations: Optional[Dict[str, str]] = Field(default_factory=dict)
    image_urls: Optional[List[str]] = Field(default_factory=list)


class ReportUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=150)
    current_description: Optional[str] = Field(None, min_length=10, max_length=5000)
    category: Optional[ReportCategory] = None
    user_confirmed_urgency: Optional[UrgencyLevel] = None


class ReportStatusUpdate(BaseModel):
    new_status: ReportStatus
    reason: str = Field(..., min_length=5, max_length=500)
    resolution_type: Optional[ResolutionType] = None


class StatusHistoryItem(BaseModel):
    id: str
    actor_id: str
    actor_name: str
    actor_role: str
    previous_status: ReportStatus
    new_status: ReportStatus
    reason: Optional[str] = None
    created_at: datetime


class ReportAuthor(BaseModel):
    id: str
    display_name: str
    role: str
    avatar_path: Optional[str] = None


class ReportResponse(BaseModel):
    id: str
    creator: ReportAuthor
    title: str
    original_description: str
    current_description: str
    category: ReportCategory
    user_confirmed_urgency: UrgencyLevel
    status: ReportStatus
    resolution_type: Optional[ResolutionType] = None
    approximate_public_location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    preferred_language: str
    ai_structured: bool
    translations: Dict[str, str] = Field(default_factory=dict)
    images: List[str] = Field(default_factory=list)
    follows_count: int = 0
    comments_count: int = 0
    is_followed_by_user: bool = False
    status_history: List[StatusHistoryItem] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None


class ReportFilterParams(BaseModel):
    category: Optional[ReportCategory] = None
    status: Optional[ReportStatus] = None
    urgency: Optional[UrgencyLevel] = None
    search: Optional[str] = None
    language: Optional[str] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=50)

