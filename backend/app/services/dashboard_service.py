"""Aggregate metrics for the dashboard."""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product


def get_summary(db: Session) -> dict:
    total_products = db.scalar(select(func.count(Product.id))) or 0
    total_customers = db.scalar(select(func.count(Customer.id))) or 0
    total_orders = db.scalar(select(func.count(Order.id))) or 0

    low_stock_products = list(
        db.scalars(
            select(Product)
            .where(Product.quantity_in_stock <= settings.LOW_STOCK_THRESHOLD)
            .order_by(Product.quantity_in_stock.asc())
        ).all()
    )

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_count": len(low_stock_products),
        "low_stock_products": low_stock_products,
    }
