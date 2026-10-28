from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from app.core.security import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/notifications", tags=["In-App Notifications"])

# In-memory notifications for demo mode
DEMO_NOTIFICATIONS: List[Dict[str, Any]] = [
    {
        "id": "notif-1",
        "recipient_id": "00000000-0000-0000-0000-000000000001",
        "notification_type": "status_change",
        "title": "Report Status: In Progress",
        "message": "Your report 'Garbage accumulation near Patia College Bus Stop' was updated to In Progress.",
        "related_entity_type": "report",
        "related_entity_id": "20000000-0000-0000-0000-000000000001",
        "read_at": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "notif-2",
        "recipient_id": "00000000-0000-0000-0000-000000000001",
        "notification_type": "volunteer_opportunity",
        "title": "New Volunteer Drive Nearby",
        "message": "Odisha Urban Care Foundation launched a clean-up drive near Patia Square.",
        "related_entity_type": "opportunity",
        "related_entity_id": "40000000-0000-0000-0000-000000000001",
        "read_at": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]


@router.get("")
async def get_notifications(user: AuthenticatedUser = Depends(get_current_user)):
    """Returns in-app notifications visible strictly to the authenticated recipient."""
    return [n for n in DEMO_NOTIFICATIONS if n["recipient_id"] == user.id]


@router.patch("/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    """Marks a notification as read."""
    for n in DEMO_NOTIFICATIONS:
        if n["id"] == notification_id and n["recipient_id"] == user.id:
            n["read_at"] = datetime.now(timezone.utc).isoformat()
            return {"success": True, "read_at": n["read_at"]}
    return {"success": True}

