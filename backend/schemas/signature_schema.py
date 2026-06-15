from pydantic import BaseModel


class SignatureCreate(BaseModel):

    document_id: int
    page_number: int
    x_coordinate: int
    y_coordinate: int