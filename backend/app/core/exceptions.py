"""Domain-level exceptions.

Services raise these technology-agnostic errors; a single FastAPI exception
handler (see app.main) maps them to the correct HTTP status code. This keeps
business logic free of HTTP concerns.
"""


class AppError(Exception):
    """Base class for all domain errors."""

    status_code = 400
    message = "Bad request"

    def __init__(self, message: str | None = None):
        if message:
            self.message = message
        super().__init__(self.message)


class NotFoundError(AppError):
    status_code = 404
    message = "Resource not found"


class ConflictError(AppError):
    """Unique-constraint / duplicate violations (e.g. SKU or email already used)."""

    status_code = 409
    message = "Resource already exists"


class InsufficientStockError(AppError):
    status_code = 409
    message = "Insufficient stock to fulfil the order"


class ValidationError(AppError):
    status_code = 422
    message = "Validation failed"
