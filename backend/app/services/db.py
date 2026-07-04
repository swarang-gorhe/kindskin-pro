from __future__ import annotations

import asyncpg

from app.core.config import settings


async def get_connection() -> asyncpg.Connection:
    if not settings.database_url:
        raise RuntimeError("DATABASE_URL is not configured")
    return await asyncpg.connect(settings.database_url)
