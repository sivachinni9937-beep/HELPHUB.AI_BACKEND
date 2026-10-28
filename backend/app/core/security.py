import jwt
from typing import Optional, Dict, Any, List
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.logging import logger

security_scheme = HTTPBearer(auto_error=False)

# Seeded Demo Users for fallback / demo testing mode
DEMO_USERS: Dict[str, Dict[str, Any]] = {
    "citizen-token": {
        "id": "00000000-0000-0000-0000-000000000001",
        "email": "aarav.citizen@helphub.local",
        "display_name": "Aarav Sharma",
        "role": "citizen",
        "preferred_language": "en"
    },
    "volunteer-token": {
        "id": "00000000-0000-0000-0000-000000000002",
        "email": "priya.volunteer@helphub.local",
        "display_name": "Priya Patel",
        "role": "volunteer",
        "preferred_language": "hi"
    },
    "organizer-token": {
        "id": "00000000-0000-0000-0000-000000000003",
        "email": "rajesh.organizer@helphub.local",
        "display_name": "Dr. Rajesh Das",
        "role": "organizer",
        "preferred_language": "or"
    },
    "moderator-token": {
        "id": "00000000-0000-0000-0000-000000000004",
        "email": "anita.moderator@helphub.local",
        "display_name": "Anita Rao",
        "role": "moderator",
        "preferred_language": "en"
    },
    "admin-token": {
        "id": "00000000-0000-0000-0000-000000000005",
        "email": "admin@helphub.local",
        "display_name": "HelpHub Admin",
        "role": "admin",
        "preferred_language": "en"
    }
}


class AuthenticatedUser:
    def __init__(self, id: str, email: Optional[str], role: str, display_name: str, preferred_language: str = "en"):
        self.id = id
        self.email = email
        self.role = role
        self.display_name = display_name
        self.preferred_language = preferred_language

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "display_name": self.display_name,
            "preferred_language": self.preferred_language,
        }


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> AuthenticatedUser:
    """
    Validates Supabase JWT or supported demo token.
    Derives identity strictly from token, never from request body.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to proceed.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Check Demo Mode / Test Tokens
    if token in DEMO_USERS:
        data = DEMO_USERS[token]
        return AuthenticatedUser(
            id=data["id"],
            email=data.get("email"),
            role=data.get("role", "citizen"),
            display_name=data.get("display_name", "Demo User"),
            preferred_language=data.get("preferred_language", "en")
        )

    # Verify standard Supabase JWT
    try:
        # Supabase access tokens are signed with SUPABASE_JWT_SECRET
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing subject."
            )
        
        user_metadata = payload.get("user_metadata", {})
        role = user_metadata.get("role", "citizen")
        display_name = user_metadata.get("display_name") or payload.get("email", "Citizen")

        return AuthenticatedUser(
            id=user_id,
            email=payload.get("email"),
            role=role,
            display_name=display_name,
            preferred_language=user_metadata.get("preferred_language", "en")
        )
    except jwt.PyJWTError as e:
        logger.warning(f"JWT Verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Optional[AuthenticatedUser]:
    """Allows guest browsing when credentials are absent."""
    if not credentials or not credentials.credentials:
        return None
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None


def require_roles(allowed_roles: List[str]):
    def role_checker(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if user.role not in allowed_roles:
            logger.warning(f"Unauthorized role access attempt: user {user.id} with role '{user.role}' tried to access {allowed_roles}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of the following roles: {', '.join(allowed_roles)}"
            )
        return user
    return role_checker


require_moderator_or_admin = require_roles(["moderator", "admin"])
require_organizer_or_admin = require_roles(["organizer", "admin"])
require_admin = require_roles(["admin"])

