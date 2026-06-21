from pydantic import BaseModel
from datetime import datetime
from ..models.booking import BookingStatus


class RestaurantBookingCreate(BaseModel):
    restaurant_name: str
    date: str
    time: str
    party_size: int
    special_requests: str = ""


class RestaurantBookingResponse(BaseModel):
    id: int
    user_id: int
    restaurant_name: str
    date: str
    time: str
    party_size: int
    special_requests: str
    status: BookingStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class HotelBookingCreate(BaseModel):
    hotel_name: str
    check_in: str
    check_out: str
    guests: int
    room_type: str


class HotelBookingResponse(BaseModel):
    id: int
    user_id: int
    hotel_name: str
    check_in: str
    check_out: str
    guests: int
    room_type: str
    status: BookingStatus
    created_at: datetime

    model_config = {"from_attributes": True}
