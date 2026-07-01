from pydantic import BaseModel, EmailStr, Field


class QuizRequest(BaseModel):
    skin_type: str = Field(..., alias="skinType")
    main_concern: str = Field(..., alias="mainConcern")
    desired_goal: str = Field(..., alias="desiredGoal")
    additional_notes: str | None = Field(None, alias="additionalNotes")

    model_config = {"populate_by_name": True}


class ProductResponse(BaseModel):
    id: str
    slug: str
    name: str
    tagline: str
    description: str
    price: int
    image: str
    images: list[str]
    category: str
    benefits: list[str]
    rating: float
    review_count: int = Field(..., alias="reviewCount")

    model_config = {"populate_by_name": True}


class QuizRecommendationResponse(BaseModel):
    products: list[ProductResponse]
    rationale: str
    tips: list[str]
    ai_assisted: bool = Field(..., alias="aiAssisted")

    model_config = {"populate_by_name": True}


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []
    session_id: str | None = Field(None, alias="sessionId")

    model_config = {"populate_by_name": True}


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str


class NewsletterRequest(BaseModel):
    email: EmailStr


class CheckoutItem(BaseModel):
    product_id: str
    product_name: str | None = None
    quantity: int
    price: int


class CheckoutRequest(BaseModel):
    items: list[CheckoutItem]
    customer: dict
    total: int


class OrderTrackRequest(BaseModel):
    order_id: str = Field(..., alias="orderId")
    email: EmailStr

    model_config = {"populate_by_name": True}


class ArticleGenerateRequest(BaseModel):
    topic: str
    category: str
