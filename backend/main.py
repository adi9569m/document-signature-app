from fastapi import FastAPI

from database import Base, engine

from models.user import User
from models.document import Document

from routers.auth import router as auth_router
from routers.document import router as document_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Document Signature App"
)

app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"]
)

app.include_router(
    document_router,
    prefix="/api/documents",
    tags=["Documents"]
)

@app.get("/")
def home():
    return {
        "message": "Document Signature App API Running"
    }

