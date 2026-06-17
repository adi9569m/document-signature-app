from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import Base, engine

from models.user import User
from models.document import Document
from models.signature import Signature

from routers.auth import router as auth_router
from routers.document import router as document_router
from routers.signature import router as signature_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Document Signature App"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

app.include_router(
    signature_router,
    prefix="/api/signatures",
    tags=["Signatures"]
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

@app.get("/")
def home():
    return {
        "message": "Document Signature App API Running"
    }
