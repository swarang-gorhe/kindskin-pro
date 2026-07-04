#!/usr/bin/env python3
"""
One-time admin bootstrap — promote an existing Supabase Auth user to admin.

Usage (from backend/):
  ADMIN_EMAIL=someone@example.com python scripts/create_admin.py

Create the account first if it does not exist (password only via env, never in this file):
  ADMIN_EMAIL=someone@example.com \\
  ADMIN_PASSWORD='your-temp-password' \\
  CREATE_IF_MISSING=1 \\
  python scripts/create_admin.py

Requires in environment or backend/.env:
  SUPABASE_URL
  SUPABASE_SERVICE_KEY

Run migration 003_profiles.sql in Supabase SQL editor before first use.

Delete or archive this script after initial admin setup — do not expose as an API endpoint.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from supabase import Client, create_client  # noqa: E402

from app.core.config import settings  # noqa: E402


def _require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        print(f"Error: {name} must be set in the environment.", file=sys.stderr)
        sys.exit(1)
    return value


def _supabase_client() -> Client:
    url = settings.supabase_url or os.environ.get("SUPABASE_URL", "").strip()
    key = settings.supabase_service_key or os.environ.get("SUPABASE_SERVICE_KEY", "").strip()
    if not url or not key:
        print(
            "Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set "
            "(backend/.env or environment).",
            file=sys.stderr,
        )
        sys.exit(1)
    return create_client(url, key)


def _find_user_by_email(client: Client, email: str):
    normalized = email.strip().lower()
    page = 1
    per_page = 200

    while True:
        result = client.auth.admin.list_users(page=page, per_page=per_page)
        users = getattr(result, "users", None) or []
        if not users:
            break

        for user in users:
            user_email = (getattr(user, "email", None) or "").strip().lower()
            if user_email == normalized:
                return user

        if len(users) < per_page:
            break
        page += 1

    return None


def _create_user(client: Client, email: str, password: str):
    return client.auth.admin.create_user(
        {
            "email": email.strip(),
            "password": password,
            "email_confirm": True,
        }
    )


def _promote_to_admin(client: Client, user_id: str, email: str) -> None:
    client.table("profiles").upsert(
        {
            "id": user_id,
            "email": email.strip(),
            "role": "admin",
        },
        on_conflict="id",
    ).execute()


def main() -> None:
    admin_email = _require_env("ADMIN_EMAIL")
    create_if_missing = os.environ.get("CREATE_IF_MISSING", "").strip() in {"1", "true", "yes"}
    admin_password = os.environ.get("ADMIN_PASSWORD", "").strip()

    if create_if_missing and not admin_password:
        print(
            "Error: CREATE_IF_MISSING=1 requires ADMIN_PASSWORD in the environment.",
            file=sys.stderr,
        )
        sys.exit(1)

    client = _supabase_client()
    user = _find_user_by_email(client, admin_email)

    if user is None:
        if not create_if_missing:
            print(
                f"Error: No auth user found for {admin_email}.\n"
                "Create the account in Supabase Dashboard > Authentication > Users,\n"
                "or re-run with CREATE_IF_MISSING=1 and ADMIN_PASSWORD set in the environment.",
                file=sys.stderr,
            )
            sys.exit(1)
        created = _create_user(client, admin_email, admin_password)
        user = getattr(created, "user", None) or created
        print(f"Created auth user for {admin_email}.")

    user_id = str(getattr(user, "id", None) or user.get("id"))
    if not user_id:
        print("Error: Could not resolve user id from Supabase Auth.", file=sys.stderr)
        sys.exit(1)

    _promote_to_admin(client, user_id, admin_email)
    print(f"Success: {admin_email} is now an admin (profiles.role = 'admin').")


if __name__ == "__main__":
    main()
