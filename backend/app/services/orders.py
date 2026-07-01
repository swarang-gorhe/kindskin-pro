from __future__ import annotations

import logging
import secrets
from datetime import datetime, timezone

import asyncpg

from app.core.config import settings
from app.models.schemas import CheckoutRequest

logger = logging.getLogger(__name__)

# In-memory fallback when DATABASE_URL is not configured (local dev)
_memory_orders: dict[str, dict] = {}

ORDER_STATUSES = ("confirmed", "processing", "shipped", "delivered", "cancelled")

PRODUCT_NAMES = {
    "aloe-vera-gel": "Aloe Vera Gel",
    "lip-balm": "Lip Balm",
    "abhyang-tel": "Abhyang Tel",
}


def generate_order_id() -> str:
    date_part = datetime.now(timezone.utc).strftime("%Y%m%d")
    suffix = secrets.token_hex(3).upper()
    return f"KS-{date_part}-{suffix}"


def _normalize_customer(body: CheckoutRequest) -> dict:
    c = body.customer
    return {
        "name": c.get("name", "").strip(),
        "email": c.get("email", "").strip().lower(),
        "phone": c.get("phone", "").strip(),
        "address": c.get("address", "").strip(),
        "city": c.get("city", "").strip(),
        "pincode": c.get("pincode", "").strip(),
    }


def _serialize_order(row: dict) -> dict:
    return {
        "order_id": row["id"],
        "status": row["status"],
        "total": row["total_amount"],
        "customer": {
            "name": row["customer_name"],
            "email": row["customer_email"],
            "phone": row["customer_phone"],
            "address": row["shipping_address"],
            "city": row["city"],
            "pincode": row["pincode"],
        },
        "items": row.get("items", []),
        "tracking_number": row.get("tracking_number"),
        "carrier": row.get("carrier") or "KindSkin Delivery",
        "created_at": row.get("created_at"),
        "timeline": row.get("timeline", []),
    }


async def create_order(body: CheckoutRequest) -> dict:
    customer = _normalize_customer(body)
    order_id = generate_order_id()
    now = datetime.now(timezone.utc)

    items = []
    for item in body.items:
        name = PRODUCT_NAMES.get(item.product_id, item.product_id.replace("-", " ").title())
        items.append(
            {
                "product_id": item.product_id,
                "product_name": item.product_name or name,
                "quantity": item.quantity,
                "unit_price": item.price,
            }
        )

    order_row = {
        "id": order_id,
        "customer_name": customer["name"],
        "customer_email": customer["email"],
        "customer_phone": customer["phone"],
        "shipping_address": customer["address"],
        "city": customer["city"],
        "pincode": customer["pincode"],
        "total_amount": body.total,
        "status": "confirmed",
        "tracking_number": None,
        "carrier": "KindSkin Delivery",
        "created_at": now.isoformat(),
        "items": items,
        "timeline": [
            {
                "status": "confirmed",
                "message": "Order confirmed — we're preparing your KindSkin products.",
                "created_at": now.isoformat(),
            }
        ],
    }

    if settings.database_url:
        try:
            order_row = await _create_order_db(order_row, items)
        except Exception:
            logger.exception("DB order create failed — using in-memory store")
            _memory_orders[order_id] = order_row
    else:
        logger.warning("DATABASE_URL missing — order stored in memory only")
        _memory_orders[order_id] = order_row

    return _serialize_order(order_row)


async def _create_order_db(order_row: dict, items: list[dict]) -> dict:
    conn = await asyncpg.connect(settings.database_url)
    try:
        async with conn.transaction():
            await conn.execute(
                """
                insert into orders (
                  id, customer_name, customer_email, customer_phone,
                  shipping_address, city, pincode, total_amount, status
                ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                """,
                order_row["id"],
                order_row["customer_name"],
                order_row["customer_email"],
                order_row["customer_phone"],
                order_row["shipping_address"],
                order_row["city"],
                order_row["pincode"],
                order_row["total_amount"],
                order_row["status"],
            )

            for item in items:
                await conn.execute(
                    """
                    insert into order_items (
                      order_id, product_id, product_name, quantity, unit_price
                    ) values ($1, $2, $3, $4, $5)
                    """,
                    order_row["id"],
                    item["product_id"],
                    item["product_name"],
                    item["quantity"],
                    item["unit_price"],
                )

            await conn.execute(
                """
                insert into order_status_events (order_id, status, message)
                values ($1, $2, $3)
                """,
                order_row["id"],
                "confirmed",
                "Order confirmed — we're preparing your KindSkin products.",
            )
    finally:
        await conn.close()

    return order_row


async def get_order(order_id: str, email: str) -> dict | None:
    email = email.strip().lower()
    order_id = order_id.strip().upper()

    if settings.database_url:
        try:
            return await _get_order_db(order_id, email)
        except Exception:
            logger.exception("DB order lookup failed — checking memory store")

    row = _memory_orders.get(order_id)
    if not row or row["customer_email"] != email:
        return None
    return _serialize_order(row)


async def _get_order_db(order_id: str, email: str) -> dict | None:
    conn = await asyncpg.connect(settings.database_url)
    try:
        order = await conn.fetchrow(
            """
            select id, customer_name, customer_email, customer_phone,
                   shipping_address, city, pincode, total_amount, status,
                   tracking_number, carrier, created_at
            from orders
            where id = $1 and lower(customer_email) = $2
            """,
            order_id,
            email,
        )
        if not order:
            return None

        item_rows = await conn.fetch(
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

        row = dict(order)
        row["items"] = [dict(i) for i in item_rows]
        row["timeline"] = [
            {
                "status": e["status"],
                "message": e["message"],
                "created_at": e["created_at"].isoformat(),
            }
            for e in events
        ]
        row["created_at"] = row["created_at"].isoformat()
        return _serialize_order(row)
    finally:
        await conn.close()
