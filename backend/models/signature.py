from sqlalchemy import Column, Integer, DateTime
from datetime import datetime

from database import Base


class Signature(Base):

    __tablename__ = "signatures"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    document_id = Column(
        Integer,
        nullable=False
    )

    page_number = Column(
        Integer,
        nullable=False
    )

    x_coordinate = Column(
        Integer,
        nullable=False
    )

    y_coordinate = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )