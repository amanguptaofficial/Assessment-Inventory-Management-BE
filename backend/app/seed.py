from app.core.database import Base, SessionLocal, engine
from app.models.customer import Customer
from app.models.product import Product
from app.schemas.customer import CustomerCreate
from app.schemas.order import OrderCreate, OrderItemCreate
from app.schemas.product import ProductCreate
from app.services import customer_service, order_service, product_service


def run() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Product).count() or db.query(Customer).count():
            print("Data already present; skipping seed.")
            return

        products = [
            ProductCreate(name="Wireless Mouse", sku="WM-001", price=19.99, quantity_in_stock=120),
            ProductCreate(name="Mechanical Keyboard", sku="KB-100", price=79.50, quantity_in_stock=45),
            ProductCreate(name="USB-C Hub", sku="HUB-7", price=34.00, quantity_in_stock=8),
            ProductCreate(name="27\" Monitor", sku="MON-27", price=219.99, quantity_in_stock=5),
        ]
        created = [product_service.create_product(db, p) for p in products]

        customers = [
            CustomerCreate(full_name="Jane Doe", email="jane@example.com", phone="+1-555-0100"),
            CustomerCreate(full_name="John Smith", email="john@example.com", phone="+1-555-0199"),
        ]
        created_customers = [customer_service.create_customer(db, c) for c in customers]

        order_service.create_order(
            db,
            OrderCreate(
                customer_id=created_customers[0].id,
                items=[
                    OrderItemCreate(product_id=created[0].id, quantity=2),
                    OrderItemCreate(product_id=created[1].id, quantity=1),
                ],
            ),
        )
        print("Seed complete: products, customers and one sample order created.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
