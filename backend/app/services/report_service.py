import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, Tuple
from fastapi import HTTPException, status
from app.core.config import settings
from app.core.logging import logger
from app.core.security import AuthenticatedUser
from app.schemas.common import ReportCategory, UrgencyLevel, ReportStatus, ResolutionType
from app.schemas.report import (
    ReportCreate,
    ReportUpdate,
    ReportStatusUpdate,
    ReportResponse,
    ReportAuthor,
    StatusHistoryItem,
    ReportFilterParams,
)

# Valid state machine transitions
ALLOWED_STATUS_TRANSITIONS = {
    ReportStatus.OPEN: [ReportStatus.IN_PROGRESS, ReportStatus.REJECTED],
    ReportStatus.IN_PROGRESS: [ReportStatus.RESOLVED, ReportStatus.OPEN, ReportStatus.REJECTED],
    ReportStatus.RESOLVED: [ReportStatus.REOPENED],
    ReportStatus.REOPENED: [ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED],
    ReportStatus.REJECTED: [ReportStatus.OPEN],
}


class ReportService:
    def __init__(self):
        # In-memory store for demo mode & local testing
        self.reports: Dict[str, Dict[str, Any]] = {}
        self.follows: Dict[str, set] = {}  # report_id -> set of user_ids
        self._init_demo_store()

    def _init_demo_store(self):
        """Populates demo reports matching the database seed."""
        now = datetime.now(timezone.utc)
        
        rep1_id = "20000000-0000-0000-0000-000000000001"
        self.reports[rep1_id] = {
            "id": rep1_id,
            "creator": {
                "id": "00000000-0000-0000-0000-000000000001",
                "display_name": "Aarav Sharma",
                "role": "citizen",
                "avatar_path": None,
            },
            "title": "Garbage accumulation near Patia College Bus Stop",
            "original_description": "Heavy waste dump piling up for 5 days near the student waiting shed, blocking sidewalk access and attracting stray animals.",
            "current_description": "Heavy waste dump piling up for 5 days near the student waiting shed, blocking sidewalk access and attracting stray animals.",
            "category": ReportCategory.SANITATION,
            "user_confirmed_urgency": UrgencyLevel.HIGH,
            "status": ReportStatus.IN_PROGRESS,
            "resolution_type": None,
            "approximate_public_location": "Patia Square near College Gate, Bhubaneswar",
            "latitude": 20.3533,
            "longitude": 85.8195,
            "preferred_language": "en",
            "ai_structured": True,
            "translations": {
                "en": "Garbage accumulation near Patia College Bus Stop",
                "hi": "पाटिया कॉलेज बस स्टॉप के पास कचरे का ढेर",
                "or": "ପଟିଆ କଲେଜ ବସ୍ ଷ୍ଟପ୍ ନିକଟରେ ଅଳିଆ ଆବର୍ଜନା ଜମା ହୋଇଛି"
            },
            "images": ["https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80"],
            "status_history": [
                {
                    "id": "hist-1",
                    "actor_id": "00000000-0000-0000-0000-000000000003",
                    "actor_name": "Dr. Rajesh Das",
                    "actor_role": "organizer",
                    "previous_status": ReportStatus.OPEN,
                    "new_status": ReportStatus.IN_PROGRESS,
                    "reason": "Odisha Urban Care Foundation coordinated a volunteer clean-up drive and notified local ward sanitary inspector.",
                    "created_at": now
                }
            ],
            "created_at": now,
            "updated_at": now,
            "resolved_at": None,
        }
        self.follows[rep1_id] = {"00000000-0000-0000-0000-000000000001", "00000000-0000-0000-0000-000000000002"}

        rep2_id = "20000000-0000-0000-0000-000000000002"
        self.reports[rep2_id] = {
            "id": rep2_id,
            "creator": {
                "id": "00000000-0000-0000-0000-000000000002",
                "display_name": "Priya Patel",
                "role": "volunteer",
                "avatar_path": None,
            },
            "title": "Broken Streetlights causing hazards in Saheed Nagar 4th Lane",
            "original_description": "Three consecutive pole lamps are non-functional for past two weeks making the junction dangerous for night commuters and pedestrians.",
            "current_description": "Three consecutive pole lamps are non-functional for past two weeks making the junction dangerous for night commuters and pedestrians.",
            "category": ReportCategory.ELECTRICITY,
            "user_confirmed_urgency": UrgencyLevel.MEDIUM,
            "status": ReportStatus.OPEN,
            "resolution_type": None,
            "approximate_public_location": "4th Lane Crossing, Saheed Nagar, Bhubaneswar",
            "latitude": 20.2917,
            "longitude": 85.8456,
            "preferred_language": "en",
            "ai_structured": True,
            "translations": {
                "en": "Broken Streetlights in Saheed Nagar",
                "hi": "शहीद नगर में खराब स्ट्रीट लाइटें",
                "or": "ସହିଦ ନଗରରେ ଷ୍ଟ୍ରିଟ୍ ଲାଇଟ୍ ଖରାପ ଅଛି"
            },
            "images": ["https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80"],
            "status_history": [],
            "created_at": now,
            "updated_at": now,
            "resolved_at": None,
        }
        self.follows[rep2_id] = {"00000000-0000-0000-0000-000000000002"}

        rep3_id = "20000000-0000-0000-0000-000000000003"
        self.reports[rep3_id] = {
            "id": rep3_id,
            "creator": {
                "id": "00000000-0000-0000-0000-000000000001",
                "display_name": "Aarav Sharma",
                "role": "citizen",
                "avatar_path": None,
            },
            "title": "Public drinking water pipe burst flooding road near Unit-2 Market",
            "original_description": "Potable water pipeline rupture wasting hundreds of liters per hour and creating deep slush on commercial road.",
            "current_description": "Potable water pipeline rupture wasting hundreds of liters per hour and creating deep slush on commercial road.",
            "category": ReportCategory.WATER,
            "user_confirmed_urgency": UrgencyLevel.CRITICAL,
            "status": ReportStatus.RESOLVED,
            "resolution_type": ResolutionType.COMMUNITY_SOLUTION_REPORTED,
            "approximate_public_location": "Unit-2 Market Road, Bhubaneswar",
            "latitude": 20.2681,
            "longitude": 85.8369,
            "preferred_language": "en",
            "ai_structured": True,
            "translations": {
                "en": "Drinking water pipe burst near Unit-2",
                "hi": "यूनिट-2 के पास पानी की पाइपलाइन फटी",
                "or": "ୟୁନିଟ୍-୨ ନିକଟରେ ଜଳ ପାଇପ୍ ଫାଟିଯାଇଛି"
            },
            "images": ["https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80"],
            "status_history": [
                {
                    "id": "hist-2",
                    "actor_id": "00000000-0000-0000-0000-000000000004",
                    "actor_name": "Anita Rao",
                    "actor_role": "moderator",
                    "previous_status": ReportStatus.IN_PROGRESS,
                    "new_status": ReportStatus.RESOLVED,
                    "reason": "Water board emergency repair crew replaced the ruptured valve; street cleared by local shopkeepers association.",
                    "created_at": now
                }
            ],
            "created_at": now,
            "updated_at": now,
            "resolved_at": now,
        }
        self.follows[rep3_id] = set()

    def get_reports(
        self,
        filters: ReportFilterParams,
        current_user: Optional[AuthenticatedUser] = None
    ) -> Tuple[List[ReportResponse], int]:
        all_items = list(self.reports.values())

        # Filtering
        if filters.category:
            all_items = [r for r in all_items if r["category"] == filters.category]
        if filters.status:
            all_items = [r for r in all_items if r["status"] == filters.status]
        if filters.urgency:
            all_items = [r for r in all_items if r["user_confirmed_urgency"] == filters.urgency]
        if filters.search:
            s = filters.search.lower()
            all_items = [
                r for r in all_items 
                if s in r["title"].lower() or s in r["current_description"].lower() or s in r["approximate_public_location"].lower()
            ]

        # Sorting: newest first
        all_items.sort(key=lambda x: x["created_at"], reverse=True)

        total = len(all_items)
        start = (filters.page - 1) * filters.page_size
        end = start + filters.page_size
        paged = all_items[start:end]

        results = []
        user_id = current_user.id if current_user else None

        for item in paged:
            rep_id = item["id"]
            is_followed = user_id in self.follows.get(rep_id, set()) if user_id else False
            results.append(
                ReportResponse(
                    id=item["id"],
                    creator=ReportAuthor(**item["creator"]),
                    title=item["title"],
                    original_description=item["original_description"],
                    current_description=item["current_description"],
                    category=item["category"],
                    user_confirmed_urgency=item["user_confirmed_urgency"],
                    status=item["status"],
                    resolution_type=item.get("resolution_type"),
                    approximate_public_location=item["approximate_public_location"],
                    latitude=item.get("latitude"),
                    longitude=item.get("longitude"),
                    preferred_language=item["preferred_language"],
                    ai_structured=item["ai_structured"],
                    translations=item.get("translations", {}),
                    images=item.get("images", []),
                    follows_count=len(self.follows.get(rep_id, set())),
                    comments_count=2 if rep_id == "20000000-0000-0000-0000-000000000001" else 0,
                    is_followed_by_user=is_followed,
                    status_history=[StatusHistoryItem(**h) for h in item.get("status_history", [])],
                    created_at=item["created_at"],
                    updated_at=item["updated_at"],
                    resolved_at=item.get("resolved_at"),
                )
            )

        return results, total

    def get_report_by_id(self, report_id: str, current_user: Optional[AuthenticatedUser] = None) -> ReportResponse:
        item = self.reports.get(report_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report with id '{report_id}' was not found."
            )
        
        user_id = current_user.id if current_user else None
        is_followed = user_id in self.follows.get(report_id, set()) if user_id else False

        return ReportResponse(
            id=item["id"],
            creator=ReportAuthor(**item["creator"]),
            title=item["title"],
            original_description=item["original_description"],
            current_description=item["current_description"],
            category=item["category"],
            user_confirmed_urgency=item["user_confirmed_urgency"],
            status=item["status"],
            resolution_type=item.get("resolution_type"),
            approximate_public_location=item["approximate_public_location"],
            latitude=item.get("latitude"),
            longitude=item.get("longitude"),
            preferred_language=item["preferred_language"],
            ai_structured=item["ai_structured"],
            translations=item.get("translations", {}),
            images=item.get("images", []),
            follows_count=len(self.follows.get(report_id, set())),
            comments_count=2 if report_id == "20000000-0000-0000-0000-000000000001" else 0,
            is_followed_by_user=is_followed,
            status_history=[StatusHistoryItem(**h) for h in item.get("status_history", [])],
            created_at=item["created_at"],
            updated_at=item["updated_at"],
            resolved_at=item.get("resolved_at"),
        )

    def create_report(self, data: ReportCreate, user: AuthenticatedUser) -> ReportResponse:
        now = datetime.now(timezone.utc)
        report_id = str(uuid.uuid4())

        entry = {
            "id": report_id,
            "creator": {
                "id": user.id,
                "display_name": user.display_name,
                "role": user.role,
                "avatar_path": None,
            },
            "title": data.title,
            "original_description": data.description,
            "current_description": data.description,
            "category": data.category,
            "user_confirmed_urgency": data.user_confirmed_urgency,
            "status": ReportStatus.OPEN,
            "resolution_type": None,
            "approximate_public_location": data.approximate_public_location,
            "latitude": data.latitude,
            "longitude": data.longitude,
            "preferred_language": data.preferred_language,
            "ai_structured": data.ai_structured,
            "translations": data.translations or {},
            "images": data.image_urls or [],
            "status_history": [],
            "created_at": now,
            "updated_at": now,
            "resolved_at": None,
        }

        self.reports[report_id] = entry
        self.follows[report_id] = {user.id}  # Auto-follow own report

        logger.info(f"Report created: {report_id} by user {user.id}")
        return self.get_report_by_id(report_id, current_user=user)

    def update_report(self, report_id: str, data: ReportUpdate, user: AuthenticatedUser) -> ReportResponse:
        item = self.reports.get(report_id)
        if not item:
            raise HTTPException(status_code=404, detail="Report not found")

        # Authorization: Creator can edit only while OPEN, or Moderator/Admin
        is_creator = item["creator"]["id"] == user.id
        is_mod = user.role in ["moderator", "admin"]

        if not is_creator and not is_mod:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to edit this report."
            )

        if is_creator and item["status"] != ReportStatus.OPEN and not is_mod:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reports can only be edited by their creator while in 'Open' status."
            )

        if data.title is not None:
            item["title"] = data.title
        if data.current_description is not None:
            item["current_description"] = data.current_description
        if data.category is not None:
            item["category"] = data.category
        if data.user_confirmed_urgency is not None:
            item["user_confirmed_urgency"] = data.user_confirmed_urgency

        item["updated_at"] = datetime.now(timezone.utc)
        return self.get_report_by_id(report_id, current_user=user)

    def update_report_status(
        self,
        report_id: str,
        data: ReportStatusUpdate,
        user: AuthenticatedUser
    ) -> ReportResponse:
        item = self.reports.get(report_id)
        if not item:
            raise HTTPException(status_code=404, detail="Report not found")

        current_status = item["status"]
        target_status = data.new_status

        # Validate legal transition
        allowed = ALLOWED_STATUS_TRANSITIONS.get(current_status, [])
        if target_status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Illegal transition from '{current_status.value}' to '{target_status.value}'."
            )

        # Role enforcement for resolution
        is_creator = item["creator"]["id"] == user.id
        is_privileged = user.role in ["organizer", "moderator", "admin"]

        # Ordinary citizens cannot mark any report officially resolved merely by changing status!
        if target_status == ReportStatus.RESOLVED and not is_privileged:
            # Citizen can report community solution, but cannot officially resolve
            if data.resolution_type == ResolutionType.OFFICIALLY_RESOLVED:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Official resolution requires verification by an authorized organizer, moderator, or administrator."
                )

        now = datetime.now(timezone.utc)
        history_entry = {
            "id": str(uuid.uuid4()),
            "actor_id": user.id,
            "actor_name": user.display_name,
            "actor_role": user.role,
            "previous_status": current_status,
            "new_status": target_status,
            "reason": data.reason,
            "created_at": now
        }

        item["status"] = target_status
        item["resolution_type"] = data.resolution_type
        item["updated_at"] = now
        if target_status == ReportStatus.RESOLVED:
            item["resolved_at"] = now
        elif target_status in [ReportStatus.OPEN, ReportStatus.IN_PROGRESS, ReportStatus.REOPENED]:
            item["resolved_at"] = None

        item.setdefault("status_history", []).append(history_entry)

        logger.info(f"Report {report_id} status transitioned: {current_status} -> {target_status} by {user.id} ({user.role})")
        return self.get_report_by_id(report_id, current_user=user)

    def toggle_follow(self, report_id: str, user: AuthenticatedUser) -> Dict[str, Any]:
        if report_id not in self.reports:
            raise HTTPException(status_code=404, detail="Report not found")

        if report_id not in self.follows:
            self.follows[report_id] = set()

        if user.id in self.follows[report_id]:
            self.follows[report_id].remove(user.id)
            is_followed = False
        else:
            self.follows[report_id].add(user.id)
            is_followed = True

        return {
            "report_id": report_id,
            "is_followed": is_followed,
            "total_follows": len(self.follows[report_id])
        }


report_service = ReportService()

