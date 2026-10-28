from typing import List
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from app.core.security import get_current_user, get_optional_user, AuthenticatedUser
from app.schemas.comment import CommentCreate, CommentResponse
from app.services.moderation_service import moderation_service

router = APIRouter(tags=["Community Discussions & Moderation"])


class AbuseReportCreate(BaseModel):
    target_type: str = Field(..., pattern="^(report|comment|opportunity|user)$")
    target_id: str
    reason: str = Field(..., min_length=5, max_length=500)


@router.get("/reports/{report_id}/comments", response_model=List[CommentResponse])
async def list_report_comments(
    report_id: str,
    current_user: AuthenticatedUser = Depends(get_optional_user)
):
    """Fetches non-hidden comments for a given report."""
    return moderation_service.get_comments_for_report(report_id, current_user=current_user)


@router.post("/reports/{report_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    report_id: str,
    data: CommentCreate,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Adds a constructive community comment to a report."""
    return moderation_service.add_comment(report_id, data, user)


@router.post("/abuse-reports", status_code=status.HTTP_201_CREATED)
async def submit_abuse_report(
    data: AbuseReportCreate,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Reports inappropriate or abusive content to community moderators."""
    return moderation_service.report_abuse(data.target_type, data.target_id, data.reason, user)

