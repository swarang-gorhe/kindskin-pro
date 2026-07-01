from app.core.config import settings


async def generate_quiz_analysis(answers, products: list[dict]) -> dict | None:
    if not settings.anthropic_api_key:
        return None

    try:
        import anthropic

        client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        product_names = ", ".join(p["name"] for p in products)

        prompt = f"""You are a KindSkin Co. skincare advisor. Based on the quiz answers below, write a brief personalized analysis (2-3 sentences) and 2 practical tips.

Skin type: {answers.skin_type}
Main concern: {answers.main_concern}
Goal: {answers.desired_goal}
Additional notes: {answers.additional_notes or 'None'}
Recommended products: {product_names}

Respond in JSON format: {{"rationale": "...", "tips": ["...", "..."]}}
Do not make medical diagnoses. Keep advice general and product-focused."""

        message = await client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )

        import json

        text = message.content[0].text
        return json.loads(text)
    except Exception:
        return None


async def stream_chat_response(message: str, history: list[dict]):
    if not settings.anthropic_api_key:
        yield _fallback_chat(message)
        return

    try:
        import anthropic

        client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

        system = """You are KindSkin Co.'s skincare assistant. Answer questions about skincare, ingredients, and routines using KindSkin's product knowledge.

Products:
- Aloe Vera Gel (₹349): Pure hydration, soothes irritation
- Natural Lip Balm (₹199): Beeswax-based, natural tint
- Abhyang Tel (₹499): Ayurvedic body oil for self-massage

Rules:
- Recommend specific KindSkin products when relevant, with links like /products/aloe-vera-gel
- Never diagnose medical conditions
- For serious skin conditions, suggest consulting a dermatologist
- Keep responses concise and helpful"""

        messages = [{"role": "user" if m["role"] == "user" else "assistant", "content": m["content"]} for m in history[-6:]]
        messages.append({"role": "user", "content": message})

        async with client.messages.stream(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            system=system,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield text
    except Exception:
        yield _fallback_chat(message)


def _fallback_chat(message: str) -> str:
    msg = message.lower()
    if "aloe" in msg or "hydrat" in msg or "dry" in msg:
        return "Our Aloe Vera Gel is perfect for hydration! Cold-pressed and pure, it soothes and moisturizes without stickiness. Check it out at /products/aloe-vera-gel"
    if "lip" in msg:
        return "Our Natural Lip Balm uses beeswax and shea butter — no petroleum. Available in Rose Petal, Cocoa Butter, and Clear Honey. See /products/lip-balm"
    if "oil" in msg or "massage" in msg or "abhyang" in msg:
        return "Abhyang Tel is our Ayurvedic body oil, slow-infused for 21 days. Perfect for self-massage rituals. Learn more at /products/abhyang-tel"
    if "quiz" in msg or "recommend" in msg:
        return "Take our personalized skin quiz at /quiz — it takes just 2 minutes and we'll recommend the best products for your skin!"
    return "I'd be happy to help with skincare questions! Ask about our Aloe Vera Gel, Lip Balm, or Abhyang Tel, or take our skin quiz at /quiz for personalized recommendations."


async def generate_article_draft(topic: str, category: str) -> dict:
    if not settings.anthropic_api_key:
        return {
            "title": topic,
            "content": f"## {topic}\n\nDraft article about {topic} in the {category} category. Please edit and review before publishing.",
        }

    try:
        import anthropic
        import json

        client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

        message = await client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            messages=[
                {
                    "role": "user",
                    "content": f"""Write a skincare article draft for KindSkin Co.'s Knowledge Hub.

Topic: {topic}
Category: {category}
Tone: Warm, expert, accessible — like Aesop or Forest Essentials blog
Length: 400-600 words
Include ## headings for sections

Respond in JSON: {{"title": "...", "content": "..."}}""",
                }
            ],
        )

        return json.loads(message.content[0].text)
    except Exception:
        return {"title": topic, "content": f"## {topic}\n\nDraft pending AI generation."}
