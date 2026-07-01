import logging
from typing import Any

import asyncpg

from app.core.config import settings
from app.rag.embeddings import embed_text
from app.rag.local_search import keyword_search, load_kb_entries

logger = logging.getLogger(__name__)


def _vector_literal(embedding: list[float]) -> str:
    return "[" + ",".join(str(x) for x in embedding) + "]"


async def _vector_search(query: str, top_k: int) -> list[dict[str, Any]]:
    threshold = settings.kb_similarity_threshold
    embedding = await embed_text(query)

    conn = await asyncpg.connect(settings.database_url)
    try:
        rows = await conn.fetch(
            """
            SELECT id, category, question, answer,
                   1 - (embedding <=> $1::vector) AS similarity
            FROM kb_entries
            WHERE embedding IS NOT NULL
              AND 1 - (embedding <=> $1::vector) > $2
            ORDER BY embedding <=> $1::vector
            LIMIT $3
            """,
            _vector_literal(embedding),
            threshold,
            top_k,
        )
    finally:
        await conn.close()

    return [
        {
            "id": row["id"],
            "category": row["category"],
            "question": row["question"],
            "answer": row["answer"],
            "similarity": float(row["similarity"]),
        }
        for row in rows
    ]


async def retrieve_relevant_chunks(
    query: str,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    if settings.database_url and settings.openai_api_key:
        try:
            chunks = await _vector_search(query, top_k)
            if chunks:
                logger.info(
                    "vector_kb_match query=%r hits=%d top_id=%s top_sim=%.2f",
                    query[:80],
                    len(chunks),
                    chunks[0]["id"],
                    chunks[0]["similarity"],
                )
                return chunks
            logger.warning("Vector search returned no matches for query=%r", query[:80])
        except Exception:
            logger.exception("Vector retrieval failed — falling back to local keyword search")

    return keyword_search(query, top_k=top_k)


CATEGORY_TO_PRODUCT: dict[str, dict[str, str]] = {
    "Aloe Vera Gel": {"slug": "aloe-vera-gel", "name": "Aloe Vera Gel"},
    "Lip Balm": {"slug": "lip-balm", "name": "Nourishing Lip Balm"},
    "Abhyang Tel": {"slug": "abhyang-tel", "name": "Abhyang Tel"},
}


def related_products_from_chunks(chunks: list[dict[str, Any]]) -> list[dict[str, str]]:
    seen: set[str] = set()
    products: list[dict[str, str]] = []
    for chunk in chunks:
        cat = chunk.get("category", "")
        if cat in CATEGORY_TO_PRODUCT:
            slug = CATEGORY_TO_PRODUCT[cat]["slug"]
            if slug not in seen:
                seen.add(slug)
                products.append(CATEGORY_TO_PRODUCT[cat])
    return products


def rag_status() -> dict[str, Any]:
    return {
        "openai_configured": bool(settings.openai_api_key),
        "database_configured": bool(settings.database_url),
        "local_kb_entries": len(load_kb_entries()),
        "retrieval_mode": (
            "vector"
            if settings.database_url and settings.openai_api_key
            else "keyword_fallback"
        ),
    }
