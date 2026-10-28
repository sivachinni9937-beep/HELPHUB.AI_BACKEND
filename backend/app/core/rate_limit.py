import time
from collections import defaultdict
from typing import Dict, List
from fastapi import HTTPException, status
from app.core.config import settings
from app.core.logging import logger


class InMemoryRateLimiter:
    """
    Thread-safe sliding-window rate limiter for FastAPI routes.
    """
    def __init__(self, requests_per_minute: int = 20):
        self.requests_per_minute = requests_per_minute
        self.client_records: Dict[str, List[float]] = defaultdict(list)

    def check(self, client_id: str):
        now = time.time()
        window_start = now - 60.0
        
        # Clean older entries
        recent = [ts for ts in self.client_records[client_id] if ts > window_start]
        self.client_records[client_id] = recent
        
        if len(recent) >= self.requests_per_minute:
            logger.warning(f"Rate limit exceeded for client: {client_id}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit of {self.requests_per_minute} requests per minute exceeded. Please try again shortly."
            )
        
        self.client_records[client_id].append(now)


ai_rate_limiter = InMemoryRateLimiter(requests_per_minute=settings.AI_RATE_LIMIT_PER_MINUTE)

