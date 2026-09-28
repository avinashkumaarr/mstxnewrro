from fastapi import HTTPException, status


class AppError(HTTPException):
    pass


def not_found(resource: str = "Resource") -> AppError:
    return AppError(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} not found")


def forbidden(detail: str = "Access denied") -> AppError:
    return AppError(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def bad_request(detail: str) -> AppError:
    return AppError(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def unauthorized(detail: str = "Not authenticated") -> AppError:
    return AppError(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )
