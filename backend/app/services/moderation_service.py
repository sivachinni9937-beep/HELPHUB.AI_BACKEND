import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from app.core.logging import logger
from app.core.security import AuthenticatedUser
from app.schemas.comment import CommentCreate, CommentResponse, CommentAuthor


class ModerationService:
    def __init__(self):
        self.comments: Dict[str, Dict[str, Any]] = {}
        self.abuse_reports: Dict[str, Dict[str, Any]] = {}
        self.audit_logs: List[Dict[str, Any]] = []
        self._init_demo_store()

    def _init_demo_store(self):
        now = datetime.now(timezone.utc)
        rep1_id = "20000000-0000-0000-0000-000000000001"
        
        c1_id = "30000000-0000-0000-0000-000000000001"
        self.comments[c1_id] = {
            "id": c1_id,
            "report_id": rep1_id,
            "author": {
                "id": "00000000-0000-0000-0000-000000000002",
                "display_name": "Priya Patel",
                "role": "volunteer",
                "avatar_path": None,
            },
            "parent_comment_id": None,
            "content": "I pass this stop every morning. Happy to join a Saturday morning volunteer cleanup if safety gloves are provided!",
            "moderation_status": "approved",
            "created_at": now,
            "updated_at": now,
        }

        c2_id = "30000000-0000-0000-0000-000000000002"
        self.comments[c2_id] = {
            "id": c2_id,
            "report_id": rep1_id,
            "author": {
                "id": "00000000-0000-0000-0000-000000000003",
                "display_name": "Dr. Rajesh Das",
                "role": "organizer",
                "avatar_path": None,
            },
            "parent_comment_id": c1_id,
            "content": "Our NGO has scheduled a drive for this Saturday at 8 AM. We have 15 waste bags, safety gloves, and hand sanitizer ready.",
            "moderation_status": "approved",
            "created_at": now,
            "updated_at": now,
        }

    def get_comments_for_report(
        self,
        report_id: str,
        current_user: Optional[AuthenticatedUser] = None
    ) -> List[CommentResponse]:
        items = [c for c in self.comments.values() if c["report_id"] == report_id]
        
        is_mod = current_user and current_user.role in ["moderator", "admin"]
        if not is_mod:
            # Filter out hidden or flagged comments for regular users
            items = [c for c in items if c["moderation_status"] == "approved"]

        items.sort(key=lambda x: x["created_at"])

        return [
            CommentResponse(
                id=c["id"],
                report_id=c["report_id"],
                author=CommentAuthor(**c["author"]),
                parent_comment_id=c.get("parent_comment_id"),
                content=c["content"],
                moderation_status=c["moderation_status"],
                created_at=c["created_at"],
                updated_at=c["updated_at"],
            )
            for c in items
        ]

    def add_comment(self, report_id: str, data: CommentCreate, user: AuthenticatedUser) -> CommentResponse:
        now = datetime.now(timezone.utc)
        comment_id = str(uuid.uuid4())

        entry = {
            "id": comment_id,
            "report_id": report_id,
            "author": {
                "id": user.id,
                "display_name": user.display_name,
                "role": user.role,
                "avatar_path": None,
            },
            "parent_comment_id": data.parent_comment_id,
            "content": data.content,
            "moderation_status": "approved",
            "created_at": now,
            "updated_at": now,
        }

        self.comments[comment_id] = entry
        logger.info(f"Comment added on report {report_id} by user {user.id}")
        return CommentResponse(
            id=entry["id"],
            report_id=entry["report_id"],
            author=CommentAuthor(**entry["author"]),
            parent_comment_id=entry.get("parent_comment_id"),
            content=entry["content"],
            moderation_status=entry["moderation_status"],
            created_at=entry["created_at"],
            updated_at=entry["updated_at"],
        )

    def report_abuse(self, target_type: str, target_id: str, reason: str, user: AuthenticatedUser) -> Dict[str, Any]:
        report_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        self.abuse_reports[report_id] = {
            "id": report_id,
            "reporter_id": user.id,
            "reporter_name": user.display_name,
            "target_type": target_type,
            "target_id": target_id,
            "reason": reason,
            "review_status": "pending",
            "reviewed_by": None,
            "created_at": now,
        }

        logger.info(f"Abuse reported by {user.id} on {target_type} {target_id}: {reason}")
        return {
            "success": True,
            "message": "Report submitted for moderation review. Thank you for keeping our community constructive.",
            "abuse_report_id": report_id
        }

    def list_abuse_reports(self) -> List[Dict[str, Any]]:
        return list(self.abuse_reports.values())

    def update_abuse_report(self, abuse_id: str, review_status: str, moderator: AuthenticatedUser) -> Dict[str, Any]:
        item = self.abuse_reports.get(abuse_id)
        if not item:
            raise HTTPException(status_code=404, detail="Abuse report not found")

        item["review_status"] = review_status
        item["reviewed_by"] = moderator.display_name
        item["updated_at"] = datetime.now(timezone.utc)
        return item


moderation_service = ModerationService()

