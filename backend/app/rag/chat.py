import json
import logging
from typing import Any, AsyncGenerator

from openai import AsyncOpenAI

from app.core.config import settings
from app.rag.constants import (
    CHAT_MODEL,
    FALLBACK_MESSAGE,
)
from app.rag.retrieve import related_products_from_chunks, retrieve_relevant_chunks

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are KindSkin Co.'s skincare assistant. Answer ONLY using the context below.
If the context doesn't fully answer the question, say so honestly and suggest contacting support
or visiting /contact — do not make up product details, prices, or claims not present in the context.
Never provide medical diagnoses. For serious skin conditions, suggest consulting a dermatologist.
Keep answers concise, warm, and helpful. When mentioning a KindSkin product, use its exact name."""


def _format_context(chunks: list[dict[str, Any]]) -> str:
    lines = []
    for c in chunks:
        lines.append(f"[Q: {c['question']} / A: {c['answer']}]")
    return "\n".join(lines)


def _emit(obj: dict[str, Any]) -> str:
    return json.dumps(obj, ensure_ascii=False) + "\n"


async def stream_rag_chat(
    message: str,
    session_id: str | None = None,
) -> AsyncGenerator[str, None]:
    yield _emit({"type": "status", "phase": "retrieving"})

    try:
        chunks = await retrieve_relevant_chunks(message, top_k=5)
    except Exception as exc:
        logger.exception("Retrieval failed: %s", exc)
        chunks = []

    matched_ids = [{"id": c["id"], "similarity": c["similarity"]} for c in chunks]
    products = related_products_from_chunks(chunks)

    if not chunks:
        logger.info(
            "chat_no_match session=%s query=%r",
            session_id or "anonymous",
            message[:120],
        )
        yield _emit({"type": "token", "content": FALLBACK_MESSAGE})
        yield _emit({"type": "done", "sources": [], "cached": False})
        return

    top = chunks[0]
    high_threshold = settings.kb_high_confidence_threshold

    if top["similarity"] >= high_threshold:
        logger.info(
            "chat_kb_direct session=%s id=%s sim=%.3f",
            session_id or "anonymous",
            top["id"],
            top["similarity"],
        )
        for product in products:
            yield _emit({"type": "product", **product})
        yield _emit({"type": "token", "content": top["answer"]})
        yield _emit(
            {
                "type": "done",
                "sources": matched_ids,
                "cached": True,
                "model": None,
            }
        )
        return

    if not settings.openai_api_key:
        # No LLM — return the best matching answers directly (single or combined).
        if len(chunks) > 1 and chunks[0]["similarity"] >= settings.kb_similarity_threshold:
            combined = "\n\n".join(c["answer"] for c in chunks[:6])
            for product in products:
                yield _emit({"type": "product", **product})
            yield _emit({"type": "token", "content": combined})
            yield _emit({"type": "done", "sources": matched_ids, "cached": True})
            return

        answer = top["answer"]
        for product in products:
            yield _emit({"type": "product", **product})
        yield _emit({"type": "token", "content": answer})
        yield _emit({"type": "done", "sources": matched_ids, "cached": True})
        return

    yield _emit({"type": "status", "phase": "generating"})

    for product in products:
        yield _emit({"type": "product", **product})

    context = _format_context(chunks)
    user_prompt = f"Context:\n{context}\n\nUser question: {message}"

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    full_response = ""

    try:
        stream = await client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            stream=True,
            max_tokens=300,
            temperature=0.3,
        )

        async for event in stream:
            delta = event.choices[0].delta.content if event.choices else None
            if delta:
                full_response += delta
                yield _emit({"type": "token", "content": delta})

        usage = None
        logger.info(
            "chat_generated session=%s sources=%s model=%s tokens_approx=%d",
            session_id or "anonymous",
            [m["id"] for m in matched_ids],
            CHAT_MODEL,
            len(full_response.split()),
        )
    except Exception as exc:
        logger.exception("OpenAI chat failed: %s", exc)
        yield _emit({"type": "token", "content": top["answer"]})

    yield _emit(
        {
            "type": "done",
            "sources": matched_ids,
            "cached": False,
            "model": CHAT_MODEL,
        }
    )
