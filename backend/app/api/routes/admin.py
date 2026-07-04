from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.deps.admin_auth import AdminUser, require_admin
from app.models.admin_schemas import (
    AdminProductCreate,
    AdminProductUpdate,
    DiscountCreate,
    DiscountUpdate,
    OrderStatusUpdate,
    StockAdjustRequest,
)
from app.services.admin_orders import (
    dashboard_summary,
    get_order_detail,
    list_orders,
    update_order_status,
)
from app.services.admin_products import (
    adjust_product_stock,
    create_product,
    deactivate_product,
    list_products,
    update_product,
)
from app.services.admin_discounts import (
    create_discount,
    deactivate_discount,
    list_discounts,
    update_discount,
)
from app.services.ai import generate_article_draft
from app.services.stock import InsufficientStockError
from app.models.schemas import ArticleGenerateRequest

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/dashboard/summary")
@limiter.limit("60/minute")
async def admin_dashboard_summary(
    request: Request,
    admin: AdminUser = Depends(require_admin),
):
    return await dashboard_summary()


@router.get("/products")
@limiter.limit("60/minute")
async def admin_list_products(
    request: Request,
    admin: AdminUser = Depends(require_admin),
):
    return {"products": await list_products()}


@router.post("/products")
@limiter.limit("30/minute")
async def admin_create_product(
    request: Request,
    body: AdminProductCreate,
    admin: AdminUser = Depends(require_admin),
):
    try:
        product = await create_product(body, admin.id)
        return {"status": "ok", "product": product}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.patch("/products/{product_id}")
@limiter.limit("30/minute")
async def admin_update_product(
    request: Request,
    product_id: str,
    body: AdminProductUpdate,
    admin: AdminUser = Depends(require_admin),
):
    try:
        product = await update_product(product_id, body, admin.id)
        return {"status": "ok", "product": product}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/products/{product_id}")
@limiter.limit("30/minute")
async def admin_delete_product(
    request: Request,
    product_id: str,
    admin: AdminUser = Depends(require_admin),
):
    try:
        product = await deactivate_product(product_id, admin.id)
        return {"status": "ok", "product": product}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/products/{product_id}/stock")
@limiter.limit("60/minute")
async def admin_adjust_stock(
    request: Request,
    product_id: str,
    body: StockAdjustRequest,
    admin: AdminUser = Depends(require_admin),
):
    try:
        product = await adjust_product_stock(product_id, body, admin.id)
        return {"status": "ok", "product": product}
    except InsufficientStockError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock: {exc.product_slug} has {exc.available} available",
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/orders")
@limiter.limit("60/minute")
async def admin_list_orders(
    request: Request,
    status: str | None = Query(None),
    search: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    admin: AdminUser = Depends(require_admin),
):
    return await list_orders(
        status=status,
        search=search,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )


@router.get("/orders/{order_id}")
@limiter.limit("60/minute")
async def admin_get_order(
    request: Request,
    order_id: str,
    admin: AdminUser = Depends(require_admin),
):
    order = await get_order_detail(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "ok", "order": order}


@router.patch("/orders/{order_id}/status")
@limiter.limit("30/minute")
async def admin_update_order_status(
    request: Request,
    order_id: str,
    body: OrderStatusUpdate,
    admin: AdminUser = Depends(require_admin),
):
    try:
        order = await update_order_status(order_id, body, admin.id)
        return {"status": "ok", "order": order}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/discounts")
@limiter.limit("60/minute")
async def admin_list_discounts(
    request: Request,
    admin: AdminUser = Depends(require_admin),
):
    return {"discounts": await list_discounts()}


@router.post("/discounts")
@limiter.limit("30/minute")
async def admin_create_discount(
    request: Request,
    body: DiscountCreate,
    admin: AdminUser = Depends(require_admin),
):
    try:
        discount = await create_discount(body, admin.id)
        return {"status": "ok", "discount": discount}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.patch("/discounts/{discount_id}")
@limiter.limit("30/minute")
async def admin_update_discount(
    request: Request,
    discount_id: str,
    body: DiscountUpdate,
    admin: AdminUser = Depends(require_admin),
):
    try:
        discount = await update_discount(discount_id, body, admin.id)
        return {"status": "ok", "discount": discount}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/discounts/{discount_id}")
@limiter.limit("30/minute")
async def admin_delete_discount(
    request: Request,
    discount_id: str,
    admin: AdminUser = Depends(require_admin),
):
    try:
        discount = await deactivate_discount(discount_id, admin.id)
        return {"status": "ok", "discount": discount}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/generate-article")
@limiter.limit("10/minute")
async def admin_generate_article(
    request: Request,
    body: ArticleGenerateRequest,
    admin: AdminUser = Depends(require_admin),
):
    return await generate_article_draft(body.topic, body.category)
