from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.common import ModerationStatus


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=2, max_length=1500)
    parent_comment_id: Optional[str] = None


class CommentAuthor(BaseModel):
    id: str
    display_name: str
    role: str
    avatar_path: Optional[str] = None


class CommentResponse(BaseModel):
    id: str
    report_id: str
    author: CommentAuthor
    parent_comment_id: Optional[str] = None
    content: str
    moderation_status: str = "approved"
    created_at: datetime
    updated_at: datetime

