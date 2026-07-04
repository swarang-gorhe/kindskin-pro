from __future__ import annotations

import jwt
from fastapi import Header, HTTPException, status

from app.core.config import settings
from app.services.db import get_connection

ADMIN_ROLE = "admin"
STAFF_ROLE = "staff"

# Future staff permissions — extend without rewriting require_admin.
STAFF_PERMISSIONS: set[str] = {
    "orders:read",
    "orders:update_status",
    "products:read",
    "stock:adjust",
}


class AdminUser(dict):
    """Decoded admin context passed to route handlers and audit logging."""

    @property
    def id(self) -> str:
        return self["id"]

    @property
    def email(self) -> str | None:
        return self.get("email")

    @property
    def role(self) -> str:
        return self["role"]


def has_permission(role: str, permission: str) -> bool:
    if role == ADMIN_ROLE:
        return True
    if role == STAFF_ROLE:
        return permission in STAFF_PERMISSIONS
    return False


async def _fetch_role(user_id: str) -> str | None:
    conn = await get_connection()
    try:
        row = await conn.fetchrow(
            "select role from profiles where id = $1",
            user_id,
        )
        return row["role"] if row else None
    finally:
        await conn.close()


def _decode_supabase_jwt(token: str) -> dict:
    if not settings.supabase_jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin auth is not configured (SUPABASE_JWT_SECRET missing)",
        )
    try:
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc


async def require_admin(authorization: str = Header(..., alias="Authorization")) -> AdminUser:
    """
    Verify Supabase JWT and ensure the user has admin role.
    Raises 401 for missing/invalid token, 403 for valid non-admin users.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be Bearer <token>",
        )

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )

    payload = _decode_supabase_jwt(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims",
        )

    role = await _fetch_role(str(user_id))
    if role != ADMIN_ROLE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return AdminUser(
        {
            "id": str(user_id),
            "email": payload.get("email"),
            "role": role,
        }
    )
