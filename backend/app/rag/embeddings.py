import asyncio
import logging

from openai import AsyncOpenAI

from app.core.config import settings
from app.rag.cache import embedding_cache
from app.rag.constants import EMBEDDING_MODEL

logger = logging.getLogger(__name__)


def _client() -> AsyncOpenAI | None:
    if not settings.openai_api_key:
        return None
    return AsyncOpenAI(api_key=settings.openai_api_key)


async def embed_text(text: str, *, use_cache: bool = True) -> list[float]:
    normalized = " ".join(text.split())
    if use_cache:
        cached = embedding_cache.get(normalized)
        if cached is not None:
            return cached

    client = _client()
    if client is None:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    response = await client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=normalized,
    )
    vector = response.data[0].embedding
    if use_cache:
        embedding_cache.set(normalized, vector)
    return vector


async def embed_texts_batch(texts: list[str]) -> list[list[float]]:
    """Embed multiple texts in one API call (for ingestion batches)."""
    client = _client()
    if client is None:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    response = await client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
    )
    return [item.embedding for item in response.data]


def embed_text_sync(text: str) -> list[float]:
    return asyncio.run(embed_text(text, use_cache=False))
