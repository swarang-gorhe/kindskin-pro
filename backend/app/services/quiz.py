import hashlib
import json

from app.models.schemas import QuizRequest
from app.services.products import recommend_products

_cache: dict[str, dict] = {}


def _cache_key(answers: QuizRequest) -> str:
    data = f"{answers.skin_type}:{answers.main_concern}:{answers.desired_goal}:{answers.additional_notes or ''}"
    return hashlib.md5(data.encode()).hexdigest()


def _fallback_rationale(skin_type: str, main_concern: str) -> str:
    skin_labels = {
        "dry": "dry skin that needs deep hydration",
        "oily": "oily skin that benefits from lightweight, non-greasy care",
        "combination": "combination skin with varying needs across your face",
        "sensitive": "sensitive skin that requires gentle, soothing ingredients",
        "normal": "balanced skin that responds well to consistent, natural care",
    }
    concern_labels = {
        "hydration": "restoring moisture balance",
        "lip-care": "nourishing and protecting your lips",
        "relaxation": "calming your body and mind through self-care rituals",
        "aging": "supporting skin vitality and firmness",
        "irritation": "soothing irritation and reducing reactivity",
    }
    skin = skin_labels.get(skin_type, "your skin type")
    concern = concern_labels.get(main_concern, "your skincare goals")
    return f"Based on your profile — {skin} with a focus on {concern} — we've selected products formulated with pure, Ayurvedic ingredients that address your specific needs."


def _fallback_tips(skin_type: str, main_concern: str) -> list[str]:
    tips = ["Apply products on slightly damp skin for better absorption."]
    if skin_type == "dry":
        tips.append("Layer Aloe Vera gel under oil for maximum hydration.")
    if main_concern == "lip-care":
        tips.append("Reapply lip balm before bed for overnight repair.")
    if main_concern == "relaxation":
        tips.append("Warm your Abhyang Tel slightly before self-massage.")
    return tips


async def generate_quiz_recommendation(answers: QuizRequest) -> dict:
    key = _cache_key(answers)
    if key in _cache:
        return _cache[key]

    products = recommend_products(
        answers.skin_type, answers.main_concern, answers.desired_goal
    )

    rationale = _fallback_rationale(answers.skin_type, answers.main_concern)
    tips = _fallback_tips(answers.skin_type, answers.main_concern)
    ai_assisted = False

    try:
        from app.services.ai import generate_quiz_analysis

        ai_result = await generate_quiz_analysis(answers, products)
        if ai_result:
            rationale = ai_result.get("rationale", rationale)
            tips = ai_result.get("tips", tips)
            ai_assisted = True
    except Exception:
        pass

    result = {
        "products": products,
        "rationale": rationale,
        "tips": tips,
        "aiAssisted": ai_assisted,
    }
    _cache[key] = result
    return result
