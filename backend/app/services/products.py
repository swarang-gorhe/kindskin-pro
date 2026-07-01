PRODUCTS = [
    {
        "id": "aloe-vera-gel",
        "slug": "aloe-vera-gel",
        "name": "Aloe Vera Gel",
        "tagline": "Pure hydration from nature's pharmacy.",
        "description": "Cold-pressed Aloe Vera gel that soothes, hydrates, and restores balance.",
        "price": 100,
        "image": "/images/products/aloe-vera-gel.svg",
        "images": ["/images/products/aloe-vera-gel.svg"],
        "category": "Face & Body",
        "benefits": ["Deep hydration", "Soothes irritation", "Non-sticky finish"],
        "rating": 4.8,
        "reviewCount": 124,
    },
    {
        "id": "lip-balm",
        "slug": "lip-balm",
        "name": "Natural Lip Balm",
        "tagline": "Soft lips, naturally tinted.",
        "description": "Beeswax and shea butter blend with natural tint.",
        "price": 50,
        "image": "/images/products/lip-balm.svg",
        "images": ["/images/products/lip-balm.svg"],
        "category": "Lip Care",
        "benefits": ["Long-lasting moisture", "Natural tint", "SPF-free & clean"],
        "rating": 4.9,
        "reviewCount": 89,
    },
    {
        "id": "abhyang-tel",
        "slug": "abhyang-tel",
        "name": "Abhyang Tel",
        "tagline": "Ancient Ayurvedic body oil.",
        "description": "A warming blend of sesame, coconut, and Ayurvedic herbs.",
        "price": 120,
        "image": "/images/products/abhyang-tel.svg",
        "images": ["/images/products/abhyang-tel.svg"],
        "category": "Body Care",
        "benefits": ["Deep tissue nourishment", "Calming ritual", "Herbal infusion"],
        "rating": 4.7,
        "reviewCount": 67,
    },
]

RECOMMENDATION_RULES = {
    ("dry", "hydration"): ["aloe-vera-gel"],
    ("dry", "irritation"): ["aloe-vera-gel"],
    ("sensitive", "irritation"): ["aloe-vera-gel"],
    ("sensitive", "hydration"): ["aloe-vera-gel"],
    ("oily", "hydration"): ["aloe-vera-gel"],
    ("normal", "hydration"): ["aloe-vera-gel"],
    ("combination", "hydration"): ["aloe-vera-gel"],
    ("dry", "lip-care"): ["lip-balm", "aloe-vera-gel"],
    ("normal", "lip-care"): ["lip-balm"],
    ("dry", "relaxation"): ["abhyang-tel", "aloe-vera-gel"],
    ("normal", "relaxation"): ["abhyang-tel"],
    ("combination", "relaxation"): ["abhyang-tel"],
    ("dry", "aging"): ["abhyang-tel", "aloe-vera-gel"],
    ("normal", "aging"): ["abhyang-tel", "aloe-vera-gel"],
    ("dry", "self-care-ritual"): ["abhyang-tel"],
    ("normal", "self-care-ritual"): ["abhyang-tel"],
    ("sensitive", "self-care-ritual"): ["abhyang-tel", "aloe-vera-gel"],
}


def get_product_by_id(product_id: str) -> dict | None:
    return next((p for p in PRODUCTS if p["id"] == product_id), None)


def recommend_products(skin_type: str, main_concern: str, desired_goal: str) -> list[dict]:
    key = (skin_type, main_concern)
    product_ids = RECOMMENDATION_RULES.get(key, ["aloe-vera-gel"])

    if desired_goal == "self-care-ritual" and "abhyang-tel" not in product_ids:
        product_ids = ["abhyang-tel"] + product_ids
    elif desired_goal == "lip-care" and "lip-balm" not in product_ids:
        product_ids = ["lip-balm"] + product_ids

    seen = set()
    result = []
    for pid in product_ids:
        if pid not in seen:
            seen.add(pid)
            product = get_product_by_id(pid)
            if product:
                result.append(product)
    return result[:2]
