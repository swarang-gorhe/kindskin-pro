import json
from unittest.mock import AsyncMock, patch

import pytest

from app.rag.chat import stream_rag_chat
from app.rag.constants import FALLBACK_MESSAGE


async def _collect(stream):
    chunks = []
    async for line in stream:
        chunks.append(json.loads(line))
    return chunks


@pytest.mark.asyncio
async def test_chat_no_matches_returns_fallback():
    with patch("app.rag.chat.retrieve_relevant_chunks", new=AsyncMock(return_value=[])):
        events = await _collect(stream_rag_chat("obscure question xyz"))

    tokens = [e for e in events if e["type"] == "token"]
    assert len(tokens) == 1
    assert FALLBACK_MESSAGE in tokens[0]["content"]


@pytest.mark.asyncio
async def test_chat_high_confidence_skips_llm():
    chunks = [
        {
            "id": "aloe-006",
            "category": "Aloe Vera Gel",
            "question": "What is the price of Aloe Vera Gel?",
            "answer": "The price of Aloe Vera Gel is ₹100.",
            "similarity": 0.95,
        }
    ]
    with patch("app.rag.chat.retrieve_relevant_chunks", new=AsyncMock(return_value=chunks)):
        events = await _collect(stream_rag_chat("How much is aloe vera gel?"))

    done = next(e for e in events if e["type"] == "done")
    assert done["cached"] is True
    tokens = "".join(e["content"] for e in events if e["type"] == "token")
    assert "₹100" in tokens
    products = [e for e in events if e["type"] == "product"]
    assert products[0]["slug"] == "aloe-vera-gel"
