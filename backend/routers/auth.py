from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.user import User

from schemas.user_schema import UserCreate, UserLogin

from utils.security import hash_password, verify_password
from utils.jwt_handler import create_access_token, verify_token

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

router = APIRouter()

security = HTTPBearer()


@router.get("/")
def test_auth():
    return {
        "message": "Auth Router Working"
    }


@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        return {
            "message": "Email already exists"
        }

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }


@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        return {
            "message": "Invalid email"
        }

    valid_password = verify_password(
        user.password,
        existing_user.password
    )

    if not valid_password:
        return {
            "message": "Invalid password"
        }

    token = create_access_token(
        {
            "sub": existing_user.email
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "name": existing_user.name
    }


@router.get("/profile")
def get_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    payload = verify_token(token)

    if payload is None:
        return {
            "message": "Invalid token"
        }

    return {
        "email": payload["sub"]
    }
