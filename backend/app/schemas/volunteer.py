from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class VolunteerOpportunityCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=150)
    description: str = Field(..., min_length=20, max_length=3000)
    report_id: Optional[str] = None
    location: str = Field(..., min_length=3, max_length=200)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    start_at: datetime
    end_at: datetime
    capacity: int = Field(10, ge=1, le=500)
    accessibility_notes: Optional[str] = Field(None, max_length=500)
    skills_needed: List[str] = Field(default_factory=list)


class VolunteerOpportunityUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=150)
    description: Optional[str] = Field(None, min_length=20, max_length=3000)
    location: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    capacity: Optional[int] = Field(None, ge=1, le=500)
    status: Optional[str] = Field(None, pattern="^(open|in_progress|completed|cancelled)$")
    accessibility_notes: Optional[str] = None
    skills_needed: Optional[List[str]] = None


class VolunteerSignupRequest(BaseModel):
    notes: Optional[str] = Field(None, max_length=500)


class VolunteerParticipant(BaseModel):
    id: str
    display_name: str
    avatar_path: Optional[str] = None
    role: str
    participation_status: str
    signed_up_at: datetime


class VolunteerOpportunityResponse(BaseModel):
    id: str
    organizer_id: str
    organizer_name: str
    organization_name: Optional[str] = None
    report_id: Optional[str] = None
    title: str
    description: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_at: datetime
    end_at: datetime
    capacity: int
    current_signups_count: int
    is_signed_up_by_user: bool = False
    status: str
    accessibility_notes: Optional[str] = None
    skills_needed: List[str] = Field(default_factory=list)
    created_at: datetime
    participants: Optional[List[VolunteerParticipant]] = None

