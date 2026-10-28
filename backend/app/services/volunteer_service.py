import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any, Tuple
from fastapi import HTTPException, status
from app.core.logging import logger
from app.core.security import AuthenticatedUser
from app.schemas.volunteer import (
    VolunteerOpportunityCreate,
    VolunteerOpportunityUpdate,
    VolunteerSignupRequest,
    VolunteerOpportunityResponse,
    VolunteerParticipant,
)


class VolunteerService:
    def __init__(self):
        self.opportunities: Dict[str, Dict[str, Any]] = {}
        self.signups: Dict[str, Dict[str, Dict[str, Any]]] = {}  # opp_id -> {user_id -> signup_info}
        self._init_demo_store()

    def _init_demo_store(self):
        now = datetime.now(timezone.utc)
        opp1_id = "40000000-0000-0000-0000-000000000001"
        self.opportunities[opp1_id] = {
            "id": opp1_id,
            "organizer_id": "00000000-0000-0000-0000-000000000003",
            "organizer_name": "Dr. Rajesh Das",
            "organization_name": "Odisha Urban Care Foundation",
            "report_id": "20000000-0000-0000-0000-000000000001",
            "title": "Patia Bus Stop Clean-Up & Segregation Drive",
            "description": "Join local residents and university volunteers to clear accumulated waste, segregate plastics for recycling, and plant saplings.",
            "location": "Patia Square, Bhubaneswar",
            "latitude": 20.3533,
            "longitude": 85.8195,
            "start_at": now + timedelta(days=3),
            "end_at": now + timedelta(days=3, hours=3),
            "capacity": 25,
            "status": "open",
            "accessibility_notes": "Ground is mostly level; sitting benches available for resting. Gloves and refreshments provided.",
            "skills_needed": ["waste segregation", "teamwork", "gardening"],
            "created_at": now - timedelta(days=2),
        }
        self.signups[opp1_id] = {
            "00000000-0000-0000-0000-000000000002": {
                "id": "50000000-0000-0000-0000-000000000001",
                "user_id": "00000000-0000-0000-0000-000000000002",
                "display_name": "Priya Patel",
                "role": "volunteer",
                "participation_status": "registered",
                "notes": "Excited to help with plastics sorting.",
                "signed_up_at": now - timedelta(days=1),
            }
        }

        opp2_id = "40000000-0000-0000-0000-000000000002"
        self.opportunities[opp2_id] = {
            "id": opp2_id,
            "organizer_id": "00000000-0000-0000-0000-000000000003",
            "organizer_name": "Dr. Rajesh Das",
            "organization_name": "Odisha Urban Care Foundation",
            "report_id": "20000000-0000-0000-0000-000000000003",
            "title": "Dispensary Ramp Safety Assessment & Painting",
            "description": "Survey accessibility ramps in Old Town healthcare centers and apply high-contrast non-slip safety paint along edges.",
            "location": "Old Town Health Center, Bhubaneswar",
            "latitude": 20.2458,
            "longitude": 85.8234,
            "start_at": now + timedelta(days=7),
            "end_at": now + timedelta(days=7, hours=4),
            "capacity": 10,
            "status": "open",
            "accessibility_notes": "Wheelchair accessible facility; indoor and shaded outdoor work available.",
            "skills_needed": ["measuring", "painting", "accessibility audit"],
            "created_at": now - timedelta(days=1),
        }
        self.signups[opp2_id] = {}

    def get_opportunities(
        self,
        current_user: Optional[AuthenticatedUser] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[VolunteerOpportunityResponse]:
        items = list(self.opportunities.values())

        if status_filter:
            items = [o for o in items if o["status"] == status_filter]
        if search:
            s = search.lower()
            items = [o for o in items if s in o["title"].lower() or s in o["location"].lower() or s in o["description"].lower()]

        items.sort(key=lambda x: x["start_at"])

        results = []
        user_id = current_user.id if current_user else None
        is_admin_or_org = current_user and current_user.role in ["organizer", "admin"]

        for o in items:
            opp_id = o["id"]
            opp_signups = self.signups.get(opp_id, {})
            active_signups = [s for s in opp_signups.values() if s["participation_status"] == "registered"]
            is_signed_up = user_id in opp_signups and opp_signups[user_id]["participation_status"] == "registered"

            # Participant visibility: organizer or admin can see participant list
            participants = None
            if is_admin_or_org or (current_user and o["organizer_id"] == current_user.id):
                participants = [
                    VolunteerParticipant(
                        id=s["user_id"],
                        display_name=s["display_name"],
                        role=s["role"],
                        participation_status=s["participation_status"],
                        signed_up_at=s["signed_up_at"]
                    )
                    for s in opp_signups.values()
                ]

            results.append(
                VolunteerOpportunityResponse(
                    id=o["id"],
                    organizer_id=o["organizer_id"],
                    organizer_name=o["organizer_name"],
                    organization_name=o.get("organization_name"),
                    report_id=o.get("report_id"),
                    title=o["title"],
                    description=o["description"],
                    location=o["location"],
                    latitude=o.get("latitude"),
                    longitude=o.get("longitude"),
                    start_at=o["start_at"],
                    end_at=o["end_at"],
                    capacity=o["capacity"],
                    current_signups_count=len(active_signups),
                    is_signed_up_by_user=is_signed_up,
                    status=o["status"],
                    accessibility_notes=o.get("accessibility_notes"),
                    skills_needed=o.get("skills_needed", []),
                    created_at=o["created_at"],
                    participants=participants,
                )
            )

        return results

    def get_opportunity_by_id(self, opportunity_id: str, current_user: Optional[AuthenticatedUser] = None) -> VolunteerOpportunityResponse:
        o = self.opportunities.get(opportunity_id)
        if not o:
            raise HTTPException(status_code=404, detail="Volunteer opportunity not found")

        opp_signups = self.signups.get(opportunity_id, {})
        active_signups = [s for s in opp_signups.values() if s["participation_status"] == "registered"]
        user_id = current_user.id if current_user else None
        is_signed_up = user_id in opp_signups and opp_signups[user_id]["participation_status"] == "registered"

        is_admin_or_org = current_user and (current_user.role in ["organizer", "admin"] or o["organizer_id"] == current_user.id)
        participants = None
        if is_admin_or_org:
            participants = [
                VolunteerParticipant(
                    id=s["user_id"],
                    display_name=s["display_name"],
                    role=s["role"],
                    participation_status=s["participation_status"],
                    signed_up_at=s["signed_up_at"]
                )
                for s in opp_signups.values()
            ]

        return VolunteerOpportunityResponse(
            id=o["id"],
            organizer_id=o["organizer_id"],
            organizer_name=o["organizer_name"],
            organization_name=o.get("organization_name"),
            report_id=o.get("report_id"),
            title=o["title"],
            description=o["description"],
            location=o["location"],
            latitude=o.get("latitude"),
            longitude=o.get("longitude"),
            start_at=o["start_at"],
            end_at=o["end_at"],
            capacity=o["capacity"],
            current_signups_count=len(active_signups),
            is_signed_up_by_user=is_signed_up,
            status=o["status"],
            accessibility_notes=o.get("accessibility_notes"),
            skills_needed=o.get("skills_needed", []),
            created_at=o["created_at"],
            participants=participants,
        )

    def create_opportunity(self, data: VolunteerOpportunityCreate, user: AuthenticatedUser) -> VolunteerOpportunityResponse:
        now = datetime.now(timezone.utc)
        opp_id = str(uuid.uuid4())

        entry = {
            "id": opp_id,
            "organizer_id": user.id,
            "organizer_name": user.display_name,
            "organization_name": "Community Organizer" if user.role == "organizer" else "Civic Admin",
            "report_id": data.report_id,
            "title": data.title,
            "description": data.description,
            "location": data.location,
            "latitude": data.latitude,
            "longitude": data.longitude,
            "start_at": data.start_at,
            "end_at": data.end_at,
            "capacity": data.capacity,
            "status": "open",
            "accessibility_notes": data.accessibility_notes,
            "skills_needed": data.skills_needed,
            "created_at": now,
        }

        self.opportunities[opp_id] = entry
        self.signups[opp_id] = {}

        logger.info(f"Volunteer opportunity created: {opp_id} by {user.id}")
        return self.get_opportunity_by_id(opp_id, current_user=user)

    def signup(self, opportunity_id: str, req: VolunteerSignupRequest, user: AuthenticatedUser) -> Dict[str, Any]:
        o = self.opportunities.get(opportunity_id)
        if not o:
            raise HTTPException(status_code=404, detail="Volunteer opportunity not found")

        if o["status"] != "open":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This opportunity is currently {o['status']} and not accepting new registrations."
            )

        opp_signups = self.signups.setdefault(opportunity_id, {})
        
        # Check duplicate active signup
        if user.id in opp_signups and opp_signups[user.id]["participation_status"] == "registered":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are already registered for this volunteer opportunity."
            )

        # Check capacity
        active_count = len([s for s in opp_signups.values() if s["participation_status"] == "registered"])
        if active_count >= o["capacity"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration capacity of {o['capacity']} has been reached for this activity."
            )

        now = datetime.now(timezone.utc)
        opp_signups[user.id] = {
            "id": str(uuid.uuid4()),
            "user_id": user.id,
            "display_name": user.display_name,
            "role": user.role,
            "participation_status": "registered",
            "notes": req.notes,
            "signed_up_at": now,
        }

        logger.info(f"User {user.id} registered for opportunity {opportunity_id}")
        return {
            "success": True,
            "message": "Successfully registered for volunteer opportunity.",
            "opportunity_id": opportunity_id,
            "current_signups_count": active_count + 1
        }

    def withdraw(self, opportunity_id: str, user: AuthenticatedUser) -> Dict[str, Any]:
        opp_signups = self.signups.get(opportunity_id, {})
        if user.id not in opp_signups or opp_signups[user.id]["participation_status"] != "registered":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You do not have an active registration for this opportunity."
            )

        opp_signups[user.id]["participation_status"] = "withdrawn"
        active_count = len([s for s in opp_signups.values() if s["participation_status"] == "registered"])

        logger.info(f"User {user.id} withdrew from opportunity {opportunity_id}")
        return {
            "success": True,
            "message": "Participation withdrawn successfully.",
            "opportunity_id": opportunity_id,
            "current_signups_count": active_count
        }


volunteer_service = VolunteerService()

