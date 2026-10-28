from enum import Enum
from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel, Field

T = TypeVar("T")


class UserRole(str, Enum):
    GUEST = "guest"
    CITIZEN = "citizen"
    VOLUNTEER = "volunteer"
    ORGANIZER = "organizer"
    MODERATOR = "moderator"
    ADMIN = "admin"


class ReportCategory(str, Enum):
    SANITATION = "sanitation"
    ROADS = "roads"
    WATER = "water"
    ELECTRICITY = "electricity"
    ACCESSIBILITY = "accessibility"
    PARKS = "parks"
    OTHER = "other"


class UrgencyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ReportStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REOPENED = "reopened"
    REJECTED = "rejected"


class ResolutionType(str, Enum):
    COMMUNITY_SOLUTION_REPORTED = "community_solution_reported"
    OFFICIALLY_RESOLVED = "officially_resolved"


class ModerationStatus(str, Enum):
    APPROVED = "approved"
    PENDING_REVIEW = "pending_review"
    HIDDEN = "hidden"
    FLAGGED = "flagged"


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None
    meta: Optional[dict] = None


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    has_more: bool
