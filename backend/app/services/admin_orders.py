from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.core.config import settings
from app.models.admin_schemas import OrderStatusUpdate
from app.services.audit import log_admin_action
from app.services.db import get_connection
from app.services.stock import restock_cancelled_order

ORDER_STATUSES = ("pending", "confirmed", "processing", "shipped", "delivered", "cancelled")

STATUS_MESSAGES = {
    "pending": "Order received — awaiting confirmation.",
    "confirmed": "Order confirmed — we're preparing your KindSkin products.",
    "processing": "Your order is being prepared for shipment.",
    "shipped": "Your order is on its way!",
    "delivered": "Delivered — enjoy your KindSkin products.",
    "cancelled": "Order cancelled.",
}


def _serialize_order_summary(row: dict) -> dict[str, Any]:
    return {
        "order_id": row["id"],
        "customer_name": row["customer_name"],
        "customer_email": row["customer_email"],
        "total": row["total_amount"],
        "status": row["status"],
        "payment_status": row.get("payment_status", "unpaid"),
        "created_at": row["created_at"].isoformat() if row.get("created_at") else None,
    }


def _serialize_order_detail(row: dict, items: list, events: list) -> dict[str, Any]:
    return {
        "order_id": row["id"],
        "status": row["status"],
        "payment_status": row.get("payment_status", "unpaid"),
        "total": row["total_amount"],
        "tracking_number": row.get("tracking_number"),
        "carrier": row.get("carrier") or "KindSkin Delivery",
        "internal_notes": row.get("internal_notes") or "",
        "customer": {
            "name": row["customer_name"],
            "email": row["customer_email"],
            "phone": row["customer_phone"],
            "address": row["shipping_address"],
            "city": row["city"],
            "pincode": row["pincode"],
        },
        "items": [dict(i) for i in items],
        "timeline": [
            {
                "status": e["status"],
                "message": e["message"],
                "created_at": e["created_at"].isoformat(),
            }
            for e in events
        ],
        "created_at": row["created_at"].isoformat() if row.get("created_at") else None,
        "updated_at": row["updated_at"].isoformat() if row.get("updated_at") else None,
    }


async def list_orders(
    *,
    status: str | None = None,
    search: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> dict[str, Any]:
    conn = await get_connection()
    try:
        conditions = ["1=1"]
        params: list[Any] = []
        idx = 1

        if status:
            conditions.append(f"o.status = ${idx}")
            params.append(status)
            idx += 1

        if search:
            conditions.append(
                f"(o.id ilike ${idx} or o.customer_name ilike ${idx} or o.customer_email ilike ${idx})"
            )
            params.append(f"%{search.strip()}%")
            idx += 1

        if date_from:
            conditions.append(f"o.created_at >= ${idx}::timestamptz")
            params.append(date_from)
            idx += 1

        if date_to:
            conditions.append(f"o.created_at <= ${idx}::timestamptz")
            params.append(date_to)
            idx += 1

        where = " and ".join(conditions)
        count_row = await conn.fetchrow(
            f"select count(*) as total from orders o where {where}",
            *params,
        )

        params.extend([limit, offset])
        rows = await conn.fetch(
            f"""
            select o.id, o.customer_name, o.customer_email, o.total_amount,
                   o.status, o.payment_status, o.created_at
            from orders o
            where {where}
            order by o.created_at desc
            limit ${idx} offset ${idx + 1}
            """,
            *params,
        )
        return {
            "total": count_row["total"],
            "orders": [_serialize_order_summary(dict(r)) for r in rows],
        }
    finally:
        await conn.close()


async def get_order_detail(order_id: str) -> dict[str, Any] | None:
    conn = await get_connection()
    try:
        order = await conn.fetchrow(
            """
            select id, customer_name, customer_email, customer_phone,
                   shipping_address, city, pincode, total_amount, status,
                   payment_status, tracking_number, carrier, internal_notes,
                   created_at, updated_at
            from orders
            where id = $1
            """,
            order_id.strip().upper(),
        )
        if not order:
            return None

        items = await conn.fetch(
            """
            select product_id, product_name, quantity, unit_price
            from order_items where order_id = $1
            """,
            order["id"],
        )
        events = await conn.fetch(
            """
            select status, message, created_at
            from order_status_events
            where order_id = $1
            order by created_at asc
            """,
            order["id"],
        )
        return _serialize_order_detail(dict(order), items, events)
    finally:
        await conn.close()


async def update_order_status(
    order_id: str,
    body: OrderStatusUpdate,
    admin_id: str,
) -> dict[str, Any]:
    order_id = order_id.strip().upper()
    if body.status not in ORDER_STATUSES:
        raise ValueError("Invalid order status")

    conn = await get_connection()
    try:
        async with conn.transaction():
            before = await conn.fetchrow(
                """
                select id, status, tracking_number, internal_notes
                from orders where id = $1 for update
                """,
                order_id,
            )
            if not before:
                raise ValueError("Order not found")

            old_status = before["status"]
            new_status = body.status

            if new_status == "cancelled" and old_status != "cancelled":
                await restock_cancelled_order(conn, order_id, admin_id=admin_id)

            message = body.message or STATUS_MESSAGES.get(new_status, f"Status updated to {new_status}.")

            await conn.execute(
                """
                update orders
                set status = $1,
                    tracking_number = coalesce($2, tracking_number),
                    internal_notes = coalesce($3, internal_notes),
                    updated_at = now()
                where id = $4
                """,
                new_status,
                body.tracking_number,
                body.internal_notes,
                order_id,
            )

            if new_status != old_status:
                await conn.execute(
                    """
                    insert into order_status_events (order_id, status, message)
                    values ($1, $2, $3)
                    """,
                    order_id,
                    new_status,
                    message,
                )

            await log_admin_action(
                conn,
                admin_id=admin_id,
                action="order_status_updated",
                entity_type="order",
                entity_id=order_id,
                details={
                    "status_before": old_status,
                    "status_after": new_status,
                    "message": message,
                    "tracking_number": body.tracking_number,
                    "internal_notes": body.internal_notes,
                },
            )

            order = await conn.fetchrow(
                """
                select id, customer_name, customer_email, customer_phone,
                       shipping_address, city, pincode, total_amount, status,
                       payment_status, tracking_number, carrier, internal_notes,
                       created_at, updated_at
                from orders where id = $1
                """,
                order_id,
            )
            items = await conn.fetch(
                """
                select product_id, product_name, quantity, unit_price
                from order_items where order_id = $1
                """,
                order_id,
            )
            events = await conn.fetch(
                """
                select status, message, created_at
                from order_status_events
                where order_id = $1
                order by created_at asc
                """,
                order_id,
            )
            return _serialize_order_detail(dict(order), items, events)
    finally:
        await conn.close()


async def dashboard_summary() -> dict[str, Any]:
    conn = await get_connection()
    try:
        now = datetime.now(timezone.utc)
        threshold = settings.low_stock_threshold

        orders_today = await conn.fetchval(
            """
            select count(*) from orders
            where created_at >= date_trunc('day', now() at time zone 'utc')
            """
        )
        orders_week = await conn.fetchval(
            """
            select count(*) from orders
            where created_at >= now() - interval '7 days'
            """
        )
        revenue_week = await conn.fetchval(
            """
            select coalesce(sum(total_amount), 0) from orders
            where created_at >= now() - interval '7 days'
              and status != 'cancelled'
            """
        )
        revenue_month = await conn.fetchval(
            """
            select coalesce(sum(total_amount), 0) from orders
            where created_at >= now() - interval '30 days'
              and status != 'cancelled'
            """
        )

        low_stock = await conn.fetch(
            """
            select id, slug, name, stock_quantity, image, category
            from products
            where is_active = true and stock_quantity < $1
            order by stock_quantity asc, name asc
            limit 20
            """,
            threshold,
        )
        low_stock_count = await conn.fetchval(
            """
            select count(*) from products
            where is_active = true and stock_quantity < $1
            """,
            threshold,
        )

        recent = await conn.fetch(
            """
            select id, customer_name, customer_email, total_amount,
                   status, payment_status, created_at
            from orders
            order by created_at desc
            limit 10
            """
        )

        return {
            "orders_today": orders_today,
            "orders_this_week": orders_week,
            "revenue_this_week": revenue_week,
            "revenue_this_month": revenue_month,
            "low_stock_threshold": threshold,
            "low_stock_count": low_stock_count,
            "low_stock_products": [
                {
                    "id": str(r["id"]),
                    "slug": r["slug"],
                    "name": r["name"],
                    "stock_quantity": r["stock_quantity"],
                    "image": r["image"],
                    "category": r["category"],
                }
                for r in low_stock
            ],
            "recent_orders": [_serialize_order_summary(dict(r)) for r in recent],
            "generated_at": now.isoformat(),
        }
    finally:
        await conn.close()
