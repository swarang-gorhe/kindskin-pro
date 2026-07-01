from app.services.products import recommend_products, get_product_by_id


def test_recommend_dry_hydration():
    products = recommend_products("dry", "hydration", "daily-routine")
    assert len(products) >= 1
    assert products[0]["id"] == "aloe-vera-gel"


def test_recommend_lip_care():
    products = recommend_products("normal", "lip-care", "daily-routine")
    assert any(p["id"] == "lip-balm" for p in products)


def test_recommend_relaxation():
    products = recommend_products("normal", "relaxation", "self-care-ritual")
    assert products[0]["id"] == "abhyang-tel"


def test_get_product():
    product = get_product_by_id("aloe-vera-gel")
    assert product is not None
    assert product["price"] == 100


def test_get_product_not_found():
    assert get_product_by_id("nonexistent") is None
