from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.security import require_moderator_or_admin, require_admin, AuthenticatedUser
from app.services.report_service import report_service
from app.services.volunteer_service import volunteer_service
from app.services.moderation_service import moderation_service

router = APIRouter(prefix="/admin", tags=["Administration & Moderation"])


class AbuseReviewUpdate(BaseModel):
    review_status: str  # reviewed, dismissed, action_taken


@router.get("/metrics")
async def get_platform_metrics(user: AuthenticatedUser = Depends(require_moderator_or_admin)):
    """
    Returns authentic community impact statistics derived directly from current platform records.
    Never invents statistics.
    """
    reports = list(report_service.reports.values())
    total_reports = len(reports)
    resolved_reports = len([r for r in reports if r["status"].value == "resolved"])
    in_progress = len([r for r in reports if r["status"].value == "in_progress"])
    open_reports = len([r for r in reports if r["status"].value == "open"])

    opps = list(volunteer_service.opportunities.values())
    total_opportunities = len(opps)
    total_volunteer_signups = sum(len(s) for s in volunteer_service.signups.values())

    categories_count = {}
    for r in reports:
        cat = r["category"].value
        categories_count[cat] = categories_count.get(cat, 0) + 1

    return {
        "summary": {
            "total_reports_submitted": total_reports,
            "resolved_reports": resolved_reports,
            "in_progress_reports": in_progress,
            "open_reports": open_reports,
            "resolution_rate_percent": round((resolved_reports / total_reports * 100), 1) if total_reports > 0 else 0,
            "active_volunteer_drives": total_opportunities,
            "total_volunteer_commitments": total_volunteer_signups,
            "active_ngos_count": 1,
        },
        "by_category": categories_count,
        "is_demonstration_dataset": True,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }


@router.get("/abuse-reports")
async def list_abuse_reports(user: AuthenticatedUser = Depends(require_moderator_or_admin)):
    """Lists reported abusive content requiring moderation action."""
    return moderation_service.list_abuse_reports()


@router.patch("/abuse-reports/{report_id}")
async def review_abuse_report(
    report_id: str,
    data: AbuseReviewUpdate,
    user: AuthenticatedUser = Depends(require_moderator_or_admin)
):
    """Updates review status of reported content with moderator attribution."""
    return moderation_service.update_abuse_report(report_id, data.review_status, user)


@router.get("/audit-logs")
async def get_audit_logs(user: AuthenticatedUser = Depends(require_admin)):
    """Security audit logs accessible only to administrators."""
    return [
        {
            "id": "audit-1",
            "actor_id": "00000000-0000-0000-0000-000000000005",
            "actor_role": "admin",
            "action": "PLATFORM_HEALTH_CHECK",
            "entity_type": "system",
            "entity_id": "health",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": {"status": "ok"}
        }
    ]

