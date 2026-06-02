"""Pydantic schemas for the Customer resource."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255, examples=["Jane Doe"])
    email: EmailStr = Field(..., examples=["jane@example.com"])
    phone: str = Field(..., min_length=3, max_length=32, examples=["+1-555-0100"])


class CustomerCreate(CustomerBase):
    """Payload for creating a customer."""


class CustomerRead(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
