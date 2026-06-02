"""Business logic for orders.

This is where the most important rules live:
  * an order cannot be placed if any product has insufficient stock;
  * the order total is computed server-side from current product prices;
  * stock is decremented atomically when the order is created;
  * deleting an order restocks the products (treated as a cancellation).
"""
from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import InsufficientStockError, NotFoundError, ValidationError
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate
from app.services.customer_service import get_customer


def list_orders(db: Session) -> list[Order]:
    return list(db.scalars(select(Order).order_by(Order.id.desc())).all())


def get_order(db: Session, order_id: int) -> Order:
    order = db.get(Order, order_id)
    if order is None:
        raise NotFoundError(f"Order {order_id} not found")
    return order


def create_order(db: Session, payload: OrderCreate) -> Order:
    # Validate the customer exists (raises 404 otherwise).
    get_customer(db, payload.customer_id)

    # Merge duplicate product lines so stock checks use the true requested total.
    requested: dict[int, int] = defaultdict(int)
    for item in payload.items:
        requested[item.product_id] += item.quantity

    order = Order(customer_id=payload.customer_id, total_amount=0, status="confirmed")
    total = 0

    for product_id, quantity in requested.items():
        product = db.get(Product, product_id)
        if product is None:
            raise NotFoundError(f"Product {product_id} not found")
        if quantity > product.quantity_in_stock:
            raise InsufficientStockError(
                f"Insufficient stock for '{product.name}' (SKU {product.sku}): "
                f"requested {quantity}, available {product.quantity_in_stock}"
            )

        subtotal = product.price * quantity
        total += subtotal
        product.quantity_in_stock -= quantity  # decrement stock atomically
        order.items.append(
            OrderItem(
                product_id=product.id,
                quantity=quantity,
                unit_price=product.price,
                subtotal=subtotal,
            )
        )

    order.total_amount = total
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def delete_order(db: Session, order_id: int) -> None:
    """Cancel an order and return its items to stock."""
    order = get_order(db, order_id)
    for item in order.items:
        product = db.get(Product, item.product_id)
        if product is not None:
            product.quantity_in_stock += item.quantity
    db.delete(order)
    db.commit()
