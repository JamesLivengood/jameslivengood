from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.payment import Payment, PaymentStatus
from ..schemas.payment import PaymentCreate, PaymentResponse
from ..auth import get_current_user

router = APIRouter()


@router.post("/", response_model=PaymentResponse)
def process_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = Payment(
        user_id=current_user.id,
        status=PaymentStatus.success,
        **payment_data.model_dump(),
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/", response_model=List[PaymentResponse])
def get_my_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Payment).filter(Payment.user_id == current_user.id).all()
