from __future__ import annotations

import uuid
from typing import Any

import asyncpg

STOCK_REASONS = frozenset(
    {
        "order_placed",
        "order_cancelled",
        "manual_adjustment",
        "restock",
        "correction",
    }
)


class InsufficientStockError(Exception):
    def __init__(self, product_slug: str, available: int, requested: int):
        self.product_slug = product_slug
        self.available = available
        self.requested = requested
        super().__init__(
            f"Insufficient stock for {product_slug}: have {available}, need {requested}"
        )


async def apply_stock_change(
    conn: asyncpg.Connection,
    *,
    product_uuid: uuid.UUID,
    change_amount: int,
    reason: str,
    reference_order_id: str | None = None,
    admin_id: str | None = None,
    note: str | None = None,
) -> int:
    if reason not in STOCK_REASONS:
        raise ValueError(f"Invalid stock reason: {reason}")

    row = await conn.fetchrow(
        "select stock_quantity from products where id = $1 for update",
        product_uuid,
    )
    if not row:
        raise ValueError("Product not found")

    new_qty = row["stock_quantity"] + change_amount
    if new_qty < 0:
        raise InsufficientStockError(str(product_uuid), row["stock_quantity"], -change_amount)

    await conn.execute(
        """
        update products
        set stock_quantity = $1, updated_at = now()
        where id = $2
        """,
        new_qty,
        product_uuid,
    )
    await conn.execute(
        """
        insert into stock_movements (
          product_id, change_amount, reason,
          reference_order_id, admin_id, note
        ) values ($1, $2, $3, $4, $5, $6)
        """,
        product_uuid,
        change_amount,
        reason,
        reference_order_id,
        uuid.UUID(admin_id) if admin_id else None,
        note,
    )
    return new_qty


async def apply_stock_change_by_slug(
    conn: asyncpg.Connection,
    *,
    product_slug: str,
    change_amount: int,
    reason: str,
    reference_order_id: str | None = None,
    admin_id: str | None = None,
    note: str | None = None,
    require_active: bool = True,
) -> int:
    query = """
        select id, stock_quantity, is_active
        from products
        where slug = $1
        for update
    """
    row = await conn.fetchrow(query, product_slug)
    if not row:
        raise ValueError(f"Product not found: {product_slug}")
    if require_active and not row["is_active"]:
        raise ValueError(f"Product is inactive: {product_slug}")

    new_qty = row["stock_quantity"] + change_amount
    if new_qty < 0:
        raise InsufficientStockError(product_slug, row["stock_quantity"], -change_amount)

    return await apply_stock_change(
        conn,
        product_uuid=row["id"],
        change_amount=change_amount,
        reason=reason,
        reference_order_id=reference_order_id,
        admin_id=admin_id,
        note=note,
    )


async def deduct_order_items(
    conn: asyncpg.Connection,
    order_id: str,
    items: list[dict[str, Any]],
) -> None:
    for item in items:
        await apply_stock_change_by_slug(
            conn,
            product_slug=item["product_id"],
            change_amount=-item["quantity"],
            reason="order_placed",
            reference_order_id=order_id,
        )


async def restock_cancelled_order(
    conn: asyncpg.Connection,
    order_id: str,
    admin_id: str | None = None,
) -> None:
    rows = await conn.fetch(
        """
        select product_id, quantity
        from order_items
        where order_id = $1
        """,
        order_id,
    )
    for row in rows:
        await apply_stock_change_by_slug(
            conn,
            product_slug=row["product_id"],
            change_amount=row["quantity"],
            reason="order_cancelled",
            reference_order_id=order_id,
            admin_id=admin_id,
            note="Stock restored after order cancellation",
            require_active=False,
        )
