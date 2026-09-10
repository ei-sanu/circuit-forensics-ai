from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Any, Optional

class AppException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, details: Any = None):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)

class UnauthorizedError(AppException):
    def __init__(self, message: str = "Unauthorized access", details: Any = None):
        super().__init__(message=message, status_code=status.HTTP_401_UNAUTHORIZED, details=details)

class ForbiddenError(AppException):
    def __init__(self, message: str = "Forbidden resource", details: Any = None):
        super().__init__(message=message, status_code=status.HTTP_403_FORBIDDEN, details=details)

class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found", details: Any = None):
        super().__init__(message=message, status_code=status.HTTP_404_NOT_FOUND, details=details)

class ConflictError(AppException):
    def __init__(self, message: str = "Resource conflict", details: Any = None):
        super().__init__(message=message, status_code=status.HTTP_409_CONFLICT, details=details)

class BadRequestError(AppException):
    def __init__(self, message: str = "Bad request", details: Any = None):
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST, details=details)

async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "statusCode": exc.status_code,
            "message": exc.message,
            "detail": exc.message,
            "details": exc.details,
            "path": request.url.path,
        },
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    msg = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "statusCode": exc.status_code,
            "message": msg,
            "detail": msg,
            "path": request.url.path,
        },
    )

async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "statusCode": 500,
            "message": "Internal server error occurred",
            "detail": "Internal server error occurred",
            "path": request.url.path,
        },
    )
