export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  is_guest: boolean;
  created_at: string;
}

export interface RestaurantBooking {
  id: number;
  user_id: number;
  restaurant_name: string;
  date: string;
  time: string;
  party_size: number;
  special_requests: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface HotelBooking {
  id: number;
  user_id: number;
  hotel_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  room_type: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface Payment {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'success' | 'failed';
  mock_card_last4: string;
  created_at: string;
}

export interface MediaFile {
  id: number;
  user_id: number;
  file_url: string;
  file_type: 'image' | 'video';
  caption: string;
  created_at: string;
}
