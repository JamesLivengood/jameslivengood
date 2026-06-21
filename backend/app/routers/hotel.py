from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.booking import HotelBooking, BookingStatus
from ..schemas.booking import HotelBookingCreate, HotelBookingResponse
from ..auth import get_current_user

router = APIRouter()


@router.post("/bookings", response_model=HotelBookingResponse)
def create_booking(
    booking_data: HotelBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = HotelBooking(user_id=current_user.id, **booking_data.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/bookings", response_model=List[HotelBookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(HotelBooking).filter(HotelBooking.user_id == current_user.id).all()


@router.delete("/bookings/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(HotelBooking).filter(
        HotelBooking.id == booking_id,
        HotelBooking.user_id == current_user.id,
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = BookingStatus.cancelled
    db.commit()
    return {"message": "Booking cancelled"}
