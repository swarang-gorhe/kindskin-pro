from __future__ import annotations

import json
import logging
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

KB_PATH = Path(__file__).resolve().parents[2] / "data" / "kindskin_knowledge_base.json"

STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "need", "i", "me",
    "my", "we", "our", "you", "your", "it", "its", "they", "them", "their",
    "this", "that", "these", "those", "am", "to", "of", "in", "for", "on",
    "with", "at", "by", "from", "as", "into", "about", "what", "how", "when",
    "where", "who", "which", "why", "give", "tell", "please", "hi", "hello",
    "hey", "get", "show",
}

QUERY_EXPANSIONS: dict[str, list[str]] = {
    "product": ["aloe", "gel", "lip", "balm", "abhyang", "tel", "oil", "skincare"],
    "products": ["aloe", "gel", "lip", "balm", "abhyang", "tel", "oil", "skincare"],
    "details": ["price", "ingredients", "size", "use", "cost", "flavour", "flavor"],
    "detail": ["price", "ingredients", "size", "use", "cost"],
    "buy": ["price", "cost", "order", "shipping"],
    "lip": ["lip balm", "balm"],
    "aloe": ["aloe vera gel", "gel"],
    "oil": ["abhyang tel", "massage"],
    "massage": ["abhyang tel"],
}

PRODUCT_OVERVIEW_PHRASES = (
    "product detail",
    "product info",
    "product information",
    "your product",
    "what product",
    "what do you sell",
    "what products",
    "tell me about your product",
    "show me product",
    "all product",
    "kindskin product",
)

PRODUCT_SUMMARY_IDS = (
    "aloe-001",
    "aloe-006",
    "lip-001",
    "lip-005",
    "abhyang-001",
    "abhyang-004",
)


@lru_cache(maxsize=1)
def load_kb_entries() -> tuple[dict[str, Any], ...]:
    with open(KB_PATH, encoding="utf-8") as handle:
        data = json.load(handle)
    return tuple(data)


def _tokenize(text: str) -> set[str]:
    tokens = set(re.findall(r"[a-z0-9]+", text.lower()))
    return {t for t in tokens if t not in STOPWORDS and len(t) > 1}


def _expand_tokens(tokens: set[str]) -> set[str]:
    expanded = set(tokens)
    for token in list(tokens):
        for extra in QUERY_EXPANSIONS.get(token, []):
            expanded.update(_tokenize(extra))
    return expanded


def _is_product_overview(query: str) -> bool:
    normalized = " ".join(query.lower().split())
    if normalized in {"product", "products"}:
        return True
    return any(phrase in normalized for phrase in PRODUCT_OVERVIEW_PHRASES)


def _entries_by_id() -> dict[str, dict[str, Any]]:
    return {entry["id"]: entry for entry in load_kb_entries()}


def product_overview_chunks() -> list[dict[str, Any]]:
    by_id = _entries_by_id()
    chunks: list[dict[str, Any]] = []
    for entry_id in PRODUCT_SUMMARY_IDS:
        entry = by_id.get(entry_id)
        if not entry:
            continue
        chunks.append(
            {
                "id": entry["id"],
                "category": entry["category"],
                "question": entry["question"],
                "answer": entry["answer"],
                "similarity": 0.9,
            }
        )
    return chunks


def _is_greeting(query: str) -> bool:
    normalized = " ".join(query.lower().split())
    if normalized in {"hi", "hello", "hey", "hi!", "hello!"}:
        return True
    tokens = _tokenize(query)
    greetings = {"hi", "hello", "hey", "hiya", "howdy", "good", "morning", "evening", "afternoon"}
    return bool(tokens) and tokens.issubset(greetings)


def greeting_chunks() -> list[dict[str, Any]]:
    return [
        {
            "id": "greet-001",
            "category": "Brand",
            "question": "Hello",
            "answer": (
                "Hello! Welcome to KindSkin Co. I can help with our products "
                "(Aloe Vera Gel ₹100, Lip Balm ₹50, Abhyang Tel ₹120), ingredients, "
                "shipping, returns, and daily skincare routines. What would you like to know?"
            ),
            "similarity": 0.95,
        }
    ]


def keyword_search(
    query: str,
    top_k: int = 5,
    threshold: float = 0.12,
) -> list[dict[str, Any]]:
    if _is_greeting(query):
        return greeting_chunks()

    if _is_product_overview(query):
        return product_overview_chunks()

    query_tokens = _expand_tokens(_tokenize(query))
    if not query_tokens:
        return []

    scored: list[tuple[float, dict[str, Any]]] = []

    for entry in load_kb_entries():
        question_tokens = _tokenize(entry["question"])
        answer_tokens = _tokenize(entry["answer"])
        category_tokens = _tokenize(entry["category"])

        q_overlap = len(query_tokens & question_tokens)
        a_overlap = len(query_tokens & answer_tokens)
        c_overlap = len(query_tokens & category_tokens)

        score = q_overlap * 3.0 + a_overlap * 1.0 + c_overlap * 2.5

        question_lower = entry["question"].lower()
        if query_tokens & {"price", "cost", "much"} and (
            "price" in question_lower or "cost" in question_lower or "how much" in question_lower
        ):
            score += 6.0

        haystack = f"{entry['question']} {entry['answer']} {entry['category']}".lower()
        if query.strip().lower() in haystack:
            score += 4.0

        if score <= 0:
            continue

        max_possible = len(query_tokens) * 3.0 + 4.0
        similarity = min(0.89, score / max(max_possible, 1.0))

        scored.append(
            (
                similarity,
                {
                    "id": entry["id"],
                    "category": entry["category"],
                    "question": entry["question"],
                    "answer": entry["answer"],
                    "similarity": similarity,
                },
            )
        )

    scored.sort(key=lambda item: item[0], reverse=True)

    price_intent = bool(query_tokens & {"price", "cost", "much"})
    if price_intent:
        price_results = [
            item[1]
            for item in scored
            if any(
                marker in item[1]["question"].lower()
                for marker in ("price", "cost", "how much")
            )
        ]
        if price_results:
            return price_results[:top_k]

    results = [item[1] for item in scored if item[0] >= threshold][:top_k]

    if results:
        logger.info(
            "local_kb_match query=%r hits=%d top_id=%s top_sim=%.2f",
            query[:80],
            len(results),
            results[0]["id"],
            results[0]["similarity"],
        )

    return results
