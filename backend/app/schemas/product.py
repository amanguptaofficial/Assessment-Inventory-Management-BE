"""Pydantic schemas for the Product resource."""
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, examples=["Wireless Mouse"])
    sku: str = Field(..., min_length=1, max_length=64, examples=["WM-001"])
    price: Decimal = Field(..., ge=0, max_digits=12, decimal_places=2, examples=[19.99])
    quantity_in_stock: int = Field(..., ge=0, examples=[100])


class ProductCreate(ProductBase):
    """Payload for creating a product."""


class ProductUpdate(BaseModel):
    """Payload for updating a product. All fields optional (partial update)."""

    name: str | None = Field(None, min_length=1, max_length=255)
    sku: str | None = Field(None, min_length=1, max_length=64)
    price: Decimal | None = Field(None, ge=0, max_digits=12, decimal_places=2)
    quantity_in_stock: int | None = Field(None, ge=0)


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
