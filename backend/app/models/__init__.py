"""ORM models package.

Importing the models here ensures they are registered on the shared metadata
before `Base.metadata.create_all` is called.
"""
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product

__all__ = ["Product", "Customer", "Order", "OrderItem"]
