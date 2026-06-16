from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
import shutil
import os

from database import get_db
from models.document import Document
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if not file.filename.endswith(".pdf"):
        return {
            "message": "Only PDF files allowed"
        }

    user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    os.makedirs("uploads", exist_ok=True)

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    document = Document(
        filename=file.filename,
        filepath=file_path,
        uploaded_by=user.id
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "PDF uploaded successfully",
        "document_id": document.id,
        "uploaded_by": user.id
    }


@router.get("/")
def get_all_documents(
    db: Session = Depends(get_db)
):

    documents = db.query(Document).all()

    return documents


@router.get("/my-documents")
def get_my_documents(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    documents = db.query(Document).filter(
        Document.uploaded_by == user.id
    ).all()

    return documents


@router.get("/{document_id}")
def get_document(
    document_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if not document:
        return {
            "message": "Document not found"
        }

    user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if document.uploaded_by != user.id:
        return {
            "message": "Access denied"
        }

    return document