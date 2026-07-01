import pytest

from app.rag.local_search import keyword_search, product_overview_chunks


def test_product_overview_query_returns_catalog():
    results = keyword_search("give me product details")
    assert len(results) >= 3
    categories = {r["category"] for r in results}
    assert "Aloe Vera Gel" in categories
    assert "Lip Balm" in categories
    assert "Abhyang Tel" in categories


def test_price_query_matches_aloe():
    results = keyword_search("how much is aloe vera gel")
    assert results
    assert results[0]["id"] == "aloe-006"
    assert "₹100" in results[0]["answer"]


def test_product_overview_chunks_include_prices():
    chunks = product_overview_chunks()
    answers = " ".join(c["answer"] for c in chunks)
    assert "₹100" in answers
    assert "₹50" in answers
    assert "₹120" in answers
