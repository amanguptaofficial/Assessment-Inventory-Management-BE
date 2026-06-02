class AppError(Exception):
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
    status_code = 409
    message = "Resource already exists"


class InsufficientStockError(AppError):
    status_code = 409
    message = "Insufficient stock to fulfil the order"


class ValidationError(AppError):
    status_code = 422
    message = "Validation failed"
