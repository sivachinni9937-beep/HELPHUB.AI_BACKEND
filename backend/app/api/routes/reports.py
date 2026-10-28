from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.security import get_current_user, get_optional_user, AuthenticatedUser
from app.schemas.common import PaginatedResponse, ReportCategory, UrgencyLevel, ReportStatus
from app.schemas.report import (
    ReportCreate,
    ReportUpdate,
    ReportStatusUpdate,
    ReportResponse,
    ReportFilterParams,
)
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Community Reports"])


@router.get("", response_model=PaginatedResponse[ReportResponse])
async def list_reports(
    category: Optional[str] = None,
    status: Optional[str] = None,
    urgency: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_user)
):
    """
    Paginated list of community reports with multi-criteria filtering and search.
    Publicly accessible to guests and registered community members.
    """
    valid_category = None
    if category and category.strip().lower() not in ("all", "none", ""):
        try:
            valid_category = ReportCategory(category.strip().lower())
        except ValueError:
            pass

    valid_status = None
    if status and status.strip().lower() not in ("all", "none", ""):
        try:
            valid_status = ReportStatus(status.strip().lower())
        except ValueError:
            pass

    valid_urgency = None
    if urgency and urgency.strip().lower() not in ("all", "none", ""):
        try:
            valid_urgency = UrgencyLevel(urgency.strip().lower())
        except ValueError:
            pass

    filters = ReportFilterParams(
        category=valid_category,
        status=valid_status,
        urgency=valid_urgency,
        search=search,
        page=page,
        page_size=page_size
    )
    items, total = report_service.get_reports(filters, current_user=current_user)
    has_more = (page * page_size) < total

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        has_more=has_more
    )


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    data: ReportCreate,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Submits a new community problem report.
    Identity is strictly derived from authenticated token.
    AI assistance is optional and not required to create reports.
    """
    return report_service.create_report(data, user)


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report_detail(
    report_id: str,
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_user)
):
    """Retrieves full details of a community report, including status history and follow states."""
    return report_service.get_report_by_id(report_id, current_user=current_user)


@router.patch("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: str,
    data: ReportUpdate,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Updates an existing report.
    Permitted only for the original creator while the report remains in 'Open' status,
    or moderators/administrators.
    """
    return report_service.update_report(report_id, data, user)


@router.patch("/{report_id}/status", response_model=ReportResponse)
async def update_report_status(
    report_id: str,
    data: ReportStatusUpdate,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Transitions report status according to the community state machine.
    Appends an audited record with actor, timestamp, and explanation.
    """
    return report_service.update_report_status(report_id, data, user)


@router.post("/{report_id}/follow")
async def toggle_follow(
    report_id: str,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Toggles following status for the authenticated user to receive updates."""
    return report_service.toggle_follow(report_id, user)

