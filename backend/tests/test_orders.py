import pytest
from unittest.mock import AsyncMock, patch

from app.models.schemas import CheckoutRequest, CheckoutItem
from app.services.orders import create_order, generate_order_id, get_order, _memory_orders


@pytest.fixture(autouse=True)
def clear_memory_orders():
    _memory_orders.clear()
    yield
    _memory_orders.clear()


def test_generate_order_id_format():
    order_id = generate_order_id()
    assert order_id.startswith("KS-")
    parts = order_id.split("-")
    assert len(parts) == 3
    assert len(parts[1]) == 8  # YYYYMMDD


@pytest.mark.asyncio
async def test_create_order_in_memory():
    body = CheckoutRequest(
        items=[
            CheckoutItem(product_id="aloe-vera-gel", product_name="Aloe Vera Gel", quantity=2, price=100),
        ],
        customer={
            "name": "Test User",
            "email": "test@example.com",
            "phone": "9876543210",
            "address": "123 Main St",
            "city": "Nashik",
            "pincode": "422001",
        },
        total=200,
    )

    with patch("app.services.orders.settings") as mock_settings:
        mock_settings.database_url = ""
        order = await create_order(body)

    assert order["order_id"].startswith("KS-")
    assert order["status"] == "confirmed"
    assert order["total"] == 200
    assert len(order["items"]) == 1
    assert order["customer"]["email"] == "test@example.com"
    assert len(order["timeline"]) == 1


@pytest.mark.asyncio
async def test_get_order_by_email():
    body = CheckoutRequest(
        items=[CheckoutItem(product_id="lip-balm", quantity=1, price=50)],
        customer={
            "name": "Jane",
            "email": "jane@example.com",
            "phone": "9999999999",
            "address": "456 Oak Ave",
            "city": "Pune",
            "pincode": "411001",
        },
        total=50,
    )

    with patch("app.services.orders.settings") as mock_settings:
        mock_settings.database_url = ""
        created = await create_order(body)
        found = await get_order(created["order_id"], "jane@example.com")
        missing = await get_order(created["order_id"], "wrong@example.com")

    assert found is not None
    assert found["order_id"] == created["order_id"]
    assert missing is None
