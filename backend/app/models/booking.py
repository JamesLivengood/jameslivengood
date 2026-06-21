import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"


class RestaurantBooking(Base):
    __tablename__ = "restaurant_bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_name = Column(String, nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    party_size = Column(Integer, nullable=False)
    special_requests = Column(String, default="")
    status = Column(SAEnum(BookingStatus), default=BookingStatus.confirmed)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="restaurant_bookings")


class HotelBooking(Base):
    __tablename__ = "hotel_bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hotel_name = Column(String, nullable=False)
    check_in = Column(String, nullable=False)
    check_out = Column(String, nullable=False)
    guests = Column(Integer, nullable=False)
    room_type = Column(String, nullable=False)
    status = Column(SAEnum(BookingStatus), default=BookingStatus.confirmed)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="hotel_bookings")
