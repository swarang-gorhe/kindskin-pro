from __future__ import annotations

from pydantic import BaseModel, Field


class AdminProductCreate(BaseModel):
    slug: str
    name: str
    tagline: str = ""
    description: str = ""
    short_description: str = ""
    price: int = Field(..., ge=0)
    category: str = "General"
    image: str = ""
    images: list[str] = []
    benefits: list[str] = []
    stock_quantity: int = Field(0, ge=0)
    rating: float = Field(4.5, ge=0, le=5)
    review_count: int = Field(0, ge=0)


class AdminProductUpdate(BaseModel):
    name: str | None = None
    tagline: str | None = None
    description: str | None = None
    short_description: str | None = None
    price: int | None = Field(None, ge=0)
    category: str | None = None
    image: str | None = None
    images: list[str] | None = None
    benefits: list[str] | None = None
    rating: float | None = Field(None, ge=0, le=5)
    review_count: int | None = Field(None, ge=0)
    is_active: bool | None = None


class StockAdjustRequest(BaseModel):
    change_amount: int = Field(..., description="Positive to add stock, negative to remove")
    reason: str = Field(..., pattern="^(manual_adjustment|restock|correction)$")
    note: str | None = None


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|confirmed|processing|shipped|delivered|cancelled)$")
    message: str | None = None
    internal_notes: str | None = None
    tracking_number: str | None = None
