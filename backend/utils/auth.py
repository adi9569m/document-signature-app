from fastapi import Depends

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from utils.jwt_handler import verify_token

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    payload = verify_token(token)

    if not payload:
        return None

    return payload
