from __future__ import annotations

import json
import uuid
from typing import Any

import asyncpg

from app.models.admin_schemas import DiscountCreate, DiscountUpdate
from app.services.audit import log_admin_action
from app.services.db import get_connection


def _serialize(row: asyncpg.Record) -> dict[str, Any]:
    data = dict(row)
    data["id"] = str(data["id"])
    if isinstance(data.get("product_slugs"), str):
        data["product_slugs"] = json.loads(data["product_slugs"])
    for key in ("starts_at", "ends_at", "created_at", "updated_at"):
        if data.get(key):
            data[key] = data[key].isoformat()
    return data


async def list_discounts() -> list[dict[str, Any]]:
    conn = await get_connection()
    try:
        rows = await conn.fetch(
            "select * from discounts order by created_at desc"
        )
        return [_serialize(r) for r in rows]
    finally:
        await conn.close()


async def create_discount(body: DiscountCreate, admin_id: str) -> dict[str, Any]:
    conn = await get_connection()
    try:
        async with conn.transaction():
            row = await conn.fetchrow(
                """
                insert into discounts (
                  code, name, description, discount_type, value,
                  min_order_amount, max_uses, applies_to, product_slugs,
                  category, is_active, starts_at, ends_at
                ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13)
                returning *
                """,
                body.code.strip().upper(),
                body.name.strip(),
                body.description,
                body.discount_type,
                body.value,
                body.min_order_amount,
                body.max_uses,
                body.applies_to,
                json.dumps(body.product_slugs),
                body.category,
                body.is_active,
                body.starts_at,
                body.ends_at,
            )
            discount = _serialize(row)
            await log_admin_action(
                conn,
                admin_id=admin_id,
                action="discount_created",
                entity_type="discount",
                entity_id=discount["id"],
                details={"after": discount},
            )
            return discount
    finally:
        await conn.close()


async def update_discount(
    discount_id: str,
    body: DiscountUpdate,
    admin_id: str,
) -> dict[str, Any]:
    conn = await get_connection()
    try:
        async with conn.transaction():
            before = await conn.fetchrow(
                "select * from discounts where id = $1",
                uuid.UUID(discount_id),
            )
            if not before:
                raise ValueError("Discount not found")

            updates = body.model_dump(exclude_unset=True)
            if not updates:
                return _serialize(before)

            if "code" in updates and updates["code"]:
                updates["code"] = updates["code"].strip().upper()
            if "product_slugs" in updates:
                updates["product_slugs"] = json.dumps(updates["product_slugs"])

            set_parts = []
            values: list[Any] = []
            idx = 1
            for field, value in updates.items():
                if field == "product_slugs":
                    set_parts.append(f"{field} = ${idx}::jsonb")
                else:
                    set_parts.append(f"{field} = ${idx}")
                values.append(value)
                idx += 1
            set_parts.append("updated_at = now()")
            values.append(uuid.UUID(discount_id))

            row = await conn.fetchrow(
                f"update discounts set {', '.join(set_parts)} where id = ${idx} returning *",
                *values,
            )
            discount = _serialize(row)
            await log_admin_action(
                conn,
                admin_id=admin_id,
                action="discount_updated",
                entity_type="discount",
                entity_id=discount_id,
                details={"before": _serialize(before), "after": discount},
            )
            return discount
    finally:
        await conn.close()


async def deactivate_discount(discount_id: str, admin_id: str) -> dict[str, Any]:
    return await update_discount(
        discount_id,
        DiscountUpdate(is_active=False),
        admin_id,
    )
