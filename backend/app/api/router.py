"""Aggregate router mounting every resource under the API prefix."""
from fastapi import APIRouter

from app.api.routes import customers, dashboard, orders, products

api_router = APIRouter()
api_router.include_router(products.router)
api_router.include_router(customers.router)
api_router.include_router(orders.router)
api_router.include_router(dashboard.router)
