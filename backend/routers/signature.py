import fitz
import os

from models.document import Document

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db

from models.signature import Signature

from schemas.signature_schema import SignatureCreate

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
    db: Session = Depends(get_db)
):

    signatures = db.query(Signature).filter(
        Signature.document_id == document_id
    ).all()

    return signatures

@router.post("/apply/{document_id}")
def apply_signature(
    document_id: int,
    db: Session = Depends(get_db)
):

    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if not document:
        return {
            "message": "Document not found"
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