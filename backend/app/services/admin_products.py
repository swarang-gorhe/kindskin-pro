from __future__ import annotations

import json
import re
import uuid
from typing import Any

import asyncpg

from app.models.admin_schemas import AdminProductCreate, AdminProductUpdate, StockAdjustRequest
from app.services.audit import log_admin_action
from app.services.db import get_connection
from app.services.stock import apply_stock_change, STOCK_REASONS


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "product"


def _serialize_product(row: asyncpg.Record) -> dict[str, Any]:
    data = dict(row)
    for key in ("images", "benefits"):
        if isinstance(data.get(key), str):
            data[key] = json.loads(data[key])
    data["id"] = str(data["id"])
    data["review_count"] = data.get("review_count", 0)
    if data.get("created_at"):
        data["created_at"] = data["created_at"].isoformat()
    if data.get("updated_at"):
        data["updated_at"] = data["updated_at"].isoformat()
    return data


async def list_products() -> list[dict[str, Any]]:
    conn = await get_connection()
    try:
        rows = await conn.fetch(
            """
            select id, slug, name, tagline, description, short_description,
                   price, category, image, images, benefits,
                   stock_quantity, is_active, rating, review_count,
                   created_at, updated_at
            from products
            order by name asc
            """
        )
        return [_serialize_product(r) for r in rows]
    finally:
        await conn.close()


async def create_product(body: AdminProductCreate, admin_id: str) -> dict[str, Any]:
    slug = _slugify(body.slug or body.name)
    conn = await get_connection()
    try:
        async with conn.transaction():
            existing = await conn.fetchrow("select id from products where slug = $1", slug)
            if existing:
                raise ValueError(f"Product slug already exists: {slug}")

            row = await conn.fetchrow(
                """
                insert into products (
                  slug, name, tagline, description, short_description,
                  price, category, image, images, benefits,
                  stock_quantity, rating, review_count
                ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12, $13)
                returning id, slug, name, tagline, description, short_description,
                          price, category, image, images, benefits,
                          stock_quantity, is_active, rating, review_count,
                          created_at, updated_at
                """,
                slug,
                body.name.strip(),
                body.tagline.strip(),
                body.description.strip(),
                body.short_description.strip() or body.description.strip()[:200],
                body.price,
                body.category.strip(),
                body.image.strip(),
                json.dumps(body.images),
                json.dumps(body.benefits),
                body.stock_quantity,
                body.rating,
                body.review_count,
            )

            if body.stock_quantity > 0:
                await conn.execute(
                    """
                    insert into stock_movements (product_id, change_amount, reason, admin_id, note)
                    values ($1, $2, 'restock', $3, 'Initial stock on product creation')
                    """,
                    row["id"],
                    body.stock_quantity,
                    uuid.UUID(admin_id),
                )

            product = _serialize_product(row)
            await log_admin_action(
                conn,
                admin_id=admin_id,
                action="product_created",
                entity_type="product",
                entity_id=product["id"],
                details={"after": product},
            )
            return product
    finally:
        await conn.close()


async def update_product(
    product_id: str,
    body: AdminProductUpdate,
    admin_id: str,
) -> dict[str, Any]:
    conn = await get_connection()
    try:
        async with conn.transaction():
            before = await conn.fetchrow(
                """
                select id, slug, name, tagline, description, short_description,
                       price, category, image, images, benefits,
                       stock_quantity, is_active, rating, review_count,
                       created_at, updated_at
                from products where id = $1
                """,
                uuid.UUID(product_id),
            )
            if not before:
                raise ValueError("Product not found")

            updates: dict[str, Any] = body.model_dump(exclude_unset=True)
            if not updates:
                return _serialize_product(before)

            set_parts = []
            values: list[Any] = []
            idx = 1
            for field, value in updates.items():
                if field in ("images", "benefits"):
                    set_parts.append(f"{field} = ${idx}::jsonb")
                    values.append(json.dumps(value))
                else:
                    set_parts.append(f"{field} = ${idx}")
                    values.append(value)
                idx += 1

            set_parts.append("updated_at = now()")
            values.append(uuid.UUID(product_id))

            row = await conn.fetchrow(
                f"""
                update products
                set {", ".join(set_parts)}
                where id = ${idx}
                returning id, slug, name, tagline, description, short_description,
                          price, category, image, images, benefits,
                          stock_quantity, is_active, rating, review_count,
                          created_at, updated_at
                """,
                *values,
            )
            product = _serialize_product(row)
            await log_admin_action(
                conn,
                admin_id=admin_id,
                action="product_updated",
                entity_type="product",
                entity_id=product["id"],
                details={
                    "before": _serialize_product(before),
                    "after": product,
                    "changes": updates,
                },
            )
            return product
    finally:
        await conn.close()


async def deactivate_product(product_id: str, admin_id: str) -> dict[str, Any]:
    return await update_product(
        product_id,
        AdminProductUpdate(is_active=False),
        admin_id,
    )


async def adjust_product_stock(
    product_id: str,
    body: StockAdjustRequest,
    admin_id: str,
) -> dict[str, Any]:
    if body.reason not in STOCK_REASONS:
        raise ValueError("Invalid stock reason")

    conn = await get_connection()
    try:
        async with conn.transaction():
            before = await conn.fetchrow(
                "select stock_quantity from products where id = $1",
                uuid.UUID(product_id),
            )
            if not before:
                raise ValueError("Product not found")

            new_qty = await apply_stock_change(
                conn,
                product_uuid=uuid.UUID(product_id),
                change_amount=body.change_amount,
                reason=body.reason,
                admin_id=admin_id,
                note=body.note,
            )

            row = await conn.fetchrow(
                """
                select id, slug, name, tagline, description, short_description,
                       price, category, image, images, benefits,
                       stock_quantity, is_active, rating, review_count,
                       created_at, updated_at
                from products where id = $1
                """,
                uuid.UUID(product_id),
            )
            product = _serialize_product(row)
            await log_admin_action(
                conn,
                admin_id=admin_id,
                action="stock_adjusted",
                entity_type="product",
                entity_id=product_id,
                details={
                    "change_amount": body.change_amount,
                    "reason": body.reason,
                    "note": body.note,
                    "stock_before": before["stock_quantity"],
                    "stock_after": new_qty,
                },
            )
            return product
    finally:
        await conn.close()
