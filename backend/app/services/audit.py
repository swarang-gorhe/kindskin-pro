from __future__ import annotations

import json
import uuid
from typing import Any

import asyncpg


async def log_admin_action(
    conn: asyncpg.Connection,
    *,
    admin_id: str,
    action: str,
    entity_type: str,
    entity_id: str,
    details: dict[str, Any] | None = None,
) -> None:
    await conn.execute(
        """
        insert into admin_audit_log (admin_id, action, entity_type, entity_id, details)
        values ($1, $2, $3, $4, $5::jsonb)
        """,
        uuid.UUID(admin_id),
        action,
        entity_type,
        entity_id,
        json.dumps(details or {}),
    )
