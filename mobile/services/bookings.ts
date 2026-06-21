import api from './api';
import { RestaurantBooking, HotelBooking } from '../types';

export async function createRestaurantBooking(payload: {
  restaurant_name: string;
  date: string;
  time: string;
  party_size: number;
  special_requests?: string;
}): Promise<RestaurantBooking> {
  const { data } = await api.post('/restaurant/bookings', payload);
  return data;
}

export async function getRestaurantBookings(): Promise<RestaurantBooking[]> {
  const { data } = await api.get('/restaurant/bookings');
  return data;
}

export async function cancelRestaurantBooking(id: number): Promise<void> {
  await api.delete(`/restaurant/bookings/${id}`);
}

export async function createHotelBooking(payload: {
  hotel_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  room_type: string;
}): Promise<HotelBooking> {
  const { data } = await api.post('/hotel/bookings', payload);
  return data;
}

export async function getHotelBookings(): Promise<HotelBooking[]> {
  const { data } = await api.get('/hotel/bookings');
  return data;
}

export async function cancelHotelBooking(id: number): Promise<void> {
  await api.delete(`/hotel/bookings/${id}`);
}
