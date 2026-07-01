from app.core.config import settings

CATEGORY_TO_PRODUCT: dict[str, dict[str, str]] = {
    "Aloe Vera Gel": {"slug": "aloe-vera-gel", "name": "Aloe Vera Gel"},
    "Lip Balm": {"slug": "lip-balm", "name": "Nourishing Lip Balm"},
    "Abhyang Tel": {"slug": "abhyang-tel", "name": "Abhyang Tel"},
}

FALLBACK_MESSAGE = (
    "I don't have specific info on that yet — you can reach our team via the "
    "Contact page at /contact, or take our skincare quiz at /quiz for personalized help."
)

EMBEDDING_MODEL = "text-embedding-3-small"
CHAT_MODEL = "gpt-4o-mini"
EMBEDDING_DIMENSION = 1536
