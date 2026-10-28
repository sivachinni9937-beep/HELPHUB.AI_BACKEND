from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.core.security import get_current_user, get_optional_user, require_organizer_or_admin, AuthenticatedUser
from app.schemas.volunteer import (
    VolunteerOpportunityCreate,
    VolunteerOpportunityResponse,
    VolunteerSignupRequest,
)
from app.services.volunteer_service import volunteer_service

router = APIRouter(prefix="/volunteer-opportunities", tags=["Volunteer Opportunities"])


@router.get("", response_model=List[VolunteerOpportunityResponse])
async def list_opportunities(
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_user)
):
    """Browses active volunteer drives and community remediation events."""
    return volunteer_service.get_opportunities(current_user=current_user, status_filter=status, search=search)


@router.post("", response_model=VolunteerOpportunityResponse, status_code=status.HTTP_201_CREATED)
async def create_opportunity(
    data: VolunteerOpportunityCreate,
    user: AuthenticatedUser = Depends(require_organizer_or_admin)
):
    """Creates a new organized volunteer drive. Restricted to organizers and administrators."""
    return volunteer_service.create_opportunity(data, user)


@router.get("/{opportunity_id}", response_model=VolunteerOpportunityResponse)
async def get_opportunity_detail(
    opportunity_id: str,
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_user)
):
    """Returns detailed information and schedules for a volunteer opportunity."""
    return volunteer_service.get_opportunity_by_id(opportunity_id, current_user=current_user)


@router.post("/{opportunity_id}/signup")
async def signup_for_opportunity(
    opportunity_id: str,
    req: VolunteerSignupRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Enrolls the authenticated user for an open volunteer opportunity."""
    return volunteer_service.signup(opportunity_id, req, user)


@router.post("/{opportunity_id}/withdraw")
async def withdraw_from_opportunity(
    opportunity_id: str,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Withdraws an existing registration and frees up volunteer capacity."""
    return volunteer_service.withdraw(opportunity_id, user)

