from pydantic import BaseModel
from datetime import datetime
from ..models.payment import PaymentStatus


class PaymentCreate(BaseModel):
    amount: float
    currency: str = "USD"
    description: str = ""
    mock_card_last4: str = "4242"


class PaymentResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    currency: str
    description: str
    status: PaymentStatus
    mock_card_last4: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MediaFileCreate(BaseModel):
    file_url: str
    file_type: str
    caption: str = ""


class MediaFileResponse(BaseModel):
    id: int
    user_id: int
    file_url: str
    file_type: str
    caption: str
    created_at: datetime

    model_config = {"from_attributes": True}
