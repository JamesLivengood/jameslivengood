import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    description = Column(String, default="")
    status = Column(SAEnum(PaymentStatus), default=PaymentStatus.success)
    mock_card_last4 = Column(String, default="4242")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="payments")


class MediaFile(Base):
    __tablename__ = "media_files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # "image" or "video"
    caption = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="media_files")
