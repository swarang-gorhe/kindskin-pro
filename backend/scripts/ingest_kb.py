#!/usr/bin/env python3
"""
Embed and upsert kindskin_knowledge_base.json into Supabase kb_entries.

Usage:
  python scripts/ingest_kb.py

Requires: OPENAI_API_KEY, DATABASE_URL in backend/.env
Run migration 001_kb_entries.sql in Supabase SQL editor first.
"""

from __future__ import annotations

import asyncio
import json
import logging
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from openai import OpenAI  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.rag.constants import EMBEDDING_MODEL  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("ingest_kb")

KB_PATH = ROOT / "data" / "kindskin_knowledge_base.json"
BATCH_SIZE = 20
MAX_RETRIES = 3


def load_entries() -> list[dict]:
    with open(KB_PATH, encoding="utf-8") as f:
        return json.load(f)


def embed_batch(client: OpenAI, texts: list[str]) -> list[list[float]]:
    for attempt in range(MAX_RETRIES):
        try:
            resp = client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
            return [d.embedding for d in resp.data]
        except Exception as exc:
            wait = 2 ** attempt
            logger.warning("Embed batch failed (attempt %d): %s — retry in %ds", attempt + 1, exc, wait)
            time.sleep(wait)
    raise RuntimeError("Embedding batch failed after retries")


async def upsert_entries(entries: list[dict], embeddings: list[list[float]]) -> None:
    import asyncpg

    if not settings.database_url:
        raise RuntimeError("DATABASE_URL is not set")

    conn = await asyncpg.connect(settings.database_url)
    try:
        for entry, embedding in zip(entries, embeddings):
            vec = "[" + ",".join(str(x) for x in embedding) + "]"
            await conn.execute(
                """
                INSERT INTO kb_entries (id, category, question, answer, embedding)
                VALUES ($1, $2, $3, $4, $5::vector)
                ON CONFLICT (id) DO UPDATE SET
                  category = EXCLUDED.category,
                  question = EXCLUDED.question,
                  answer = EXCLUDED.answer,
                  embedding = EXCLUDED.embedding
                """,
                entry["id"],
                entry["category"],
                entry["question"],
                entry["answer"],
                vec,
            )
    finally:
        await conn.close()


async def main() -> None:
    if not settings.openai_api_key:
        logger.error("OPENAI_API_KEY is required")
        sys.exit(1)
    if not settings.database_url:
        logger.error("DATABASE_URL is required (Supabase Postgres connection string)")
        sys.exit(1)

    entries = load_entries()
    client = OpenAI(api_key=settings.openai_api_key)

    processed = 0
    failed = 0

    for i in range(0, len(entries), BATCH_SIZE):
        batch = entries[i : i + BATCH_SIZE]
        texts = [f"{e['question']} {e['answer']}" for e in batch]
        try:
            vectors = embed_batch(client, texts)
            await upsert_entries(batch, vectors)
            processed += len(batch)
            logger.info("Upserted %d / %d", processed, len(entries))
        except Exception as exc:
            failed += len(batch)
            logger.error("Batch %d failed: %s", i // BATCH_SIZE + 1, exc)

    logger.info("Done — processed: %d, failed: %d, total: %d", processed, failed, len(entries))
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
