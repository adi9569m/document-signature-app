from fastapi import FastAPI

from database import Base, engine
from models.user import User
from routers.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Document Signature App"
)

app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"]
)

@app.get("/")
def home():
    return {
        "message": "Document Signature App API Running"
    }