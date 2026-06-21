from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, default="")
    hashed_password = Column(String, nullable=False)
    bio = Column(String, default="")
    avatar_url = Column(String, default="")
    is_active = Column(Boolean, default=True)
    is_guest = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    restaurant_bookings = relationship("RestaurantBooking", back_populates="user")
    hotel_bookings = relationship("HotelBooking", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    media_files = relationship("MediaFile", back_populates="user")
