from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import (
    ChatRequest,
    ContactRequest,
    NewsletterRequest,
    QuizRequest,
    CheckoutRequest,
    OrderTrackRequest,
    ArticleGenerateRequest,
)
from app.services.quiz import generate_quiz_recommendation
from app.services.ai import generate_article_draft
from app.services.orders import create_order, get_order
from app.rag.chat import stream_rag_chat
from app.rag.retrieve import rag_status

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/quiz/recommend")
@limiter.limit("10/minute")
async def quiz_recommend(request: Request, body: QuizRequest):
    return await generate_quiz_recommendation(body)


@router.post("/assistant/chat")
@limiter.limit("20/hour")
async def assistant_chat(request: Request, body: ChatRequest):
    async def generate():
        async for chunk in stream_rag_chat(body.message, session_id=body.session_id):
            yield chunk

    return StreamingResponse(generate(), media_type="application/x-ndjson")


@router.get("/assistant/status")
async def assistant_status():
    return {"status": "ok", **rag_status()}


@router.post("/contact")
@limiter.limit("5/minute")
async def contact(request: Request, body: ContactRequest):
    return {"status": "ok", "message": "Message received"}


@router.post("/newsletter/subscribe")
@limiter.limit("5/minute")
async def newsletter_subscribe(request: Request, body: NewsletterRequest):
    return {"status": "ok", "message": "Subscribed"}


@router.post("/checkout/create")
@limiter.limit("10/minute")
async def checkout_create(request: Request, body: CheckoutRequest):
    return await create_order(body)


@router.post("/orders/track")
@limiter.limit("20/minute")
async def orders_track(request: Request, body: OrderTrackRequest):
    order = await get_order(body.order_id, body.email)
    if not order:
        return {"status": "not_found", "message": "No order found with that ID and email."}
    return {"status": "ok", "order": order}


@router.get("/orders/{order_id}")
@limiter.limit("20/minute")
async def orders_get(request: Request, order_id: str, email: str):
    order = await get_order(order_id, email)
    if not order:
        return {"status": "not_found", "message": "No order found with that ID and email."}
    return {"status": "ok", "order": order}


@router.post("/admin/generate-article")
@limiter.limit("5/minute")
async def admin_generate_article(request: Request, body: ArticleGenerateRequest):
    return await generate_article_draft(body.topic, body.category)
