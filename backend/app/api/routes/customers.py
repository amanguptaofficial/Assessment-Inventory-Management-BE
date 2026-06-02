"""Customer API routes."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.customer import CustomerCreate, CustomerRead
from app.services import customer_service

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("", response_model=list[CustomerRead])
def list_customers(db: Session = Depends(get_db)):
    return customer_service.list_customers(db)


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    return customer_service.create_customer(db, payload)


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return customer_service.get_customer(db, customer_id)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer_service.delete_customer(db, customer_id)
