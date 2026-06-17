import fitz
import os

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db

from models.signature import Signature
from models.document import Document
from models.user import User

from schemas.signature_schema import SignatureCreate

from utils.auth import get_current_user

router = APIRouter()


@router.post("/")
def save_signature(
    signature: SignatureCreate,
    db: Session = Depends(get_db)
):

    new_signature = Signature(
        document_id=signature.document_id,
        page_number=signature.page_number,
        x_coordinate=signature.x_coordinate,
        y_coordinate=signature.y_coordinate
    )

    db.add(new_signature)

    db.commit()

    db.refresh(new_signature)

    return {
        "message": "Signature position saved",
        "signature_id": new_signature.id
    }


@router.get("/{document_id}")
def get_signatures(
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

    signatures = db.query(Signature).filter(
        Signature.document_id == document_id
    ).all()

    return signatures


@router.post("/apply/{document_id}")
def apply_signature(
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

    signatures = db.query(Signature).filter(
        Signature.document_id == document_id
    ).all()

    if not signatures:
        return {
            "message": "No signature positions found"
        }

    pdf = fitz.open(document.filepath)

    for signature in signatures:

        page = pdf[
            signature.page_number - 1
        ]

        page.insert_text(
            (
                signature.x_coordinate,
                signature.y_coordinate
            ),
            "SIGNED",
            fontsize=20
        )

    os.makedirs(
        "signed_docs",
        exist_ok=True
    )

    output_file = (
        f"signed_docs/"
        f"signed_{document.filename}"
    )

    pdf.save(output_file)

    pdf.close()

    return {
        "message": "Signed PDF generated",
        "file": output_file
    }


@router.get("/download/{document_id}")
def download_signed_pdf(
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

    file_path = (
        f"signed_docs/"
        f"signed_{document.filename}"
    )

    return FileResponse(
        path=file_path,
        filename=f"signed_{document.filename}",
        media_type="application/pdf"
    )

@router.delete("/{signature_id}")
def delete_signature(
    signature_id: int,
    db: Session = Depends(get_db)
):

    signature = db.query(Signature).filter(
        Signature.id == signature_id
    ).first()

    if not signature:
        return {"message": "Signature not found"}

    db.delete(signature)
    db.commit()

    return {"message": "Signature deleted successfully"}