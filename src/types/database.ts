export type Role = "user" | "admin" | "super_admin";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  name_no: string | null;
  slug: string;
  created_at: string;
}

export interface Restaurant {
  id: string;
  google_place_id: string | null;
  name: string;
  address: string | null;
  neighborhood_id: string | null;
  latitude: number;
  longitude: number;
  cuisine_types: string[];
  phone: string | null;
  website: string | null;
  opening_hours: Record<string, string> | null;
  google_rating: number | null;
  price_level: number | null;
  photo_reference: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  neighborhood?: Neighborhood;
}

export interface CheckIn {
  id: string;
  user_id: string;
  restaurant_id: string;
  photo_url: string | null;
  review: string | null;
  rating: number | null;
  dish_name: string | null;
  latitude: number | null;
  longitude: number | null;
  is_public: boolean;
  created_at: string;
}

export interface CheckInFeedItem {
  id: string;
  user_id: string;
  restaurant_id: string;
  photo_url: string | null;
  review: string | null;
  rating: number | null;
  dish_name: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  restaurant_name: string;
  restaurant_address: string | null;
  cuisine_types: string[];
  neighborhood_id: string | null;
  neighborhood_name: string | null;
  like_count: number;
  user_liked?: boolean;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  category: "visits" | "explorer" | "cuisine" | "streak" | "special";
  criteria: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  badge?: Badge;
}

export interface UserStats {
  user_id: string;
  username: string;
  total_check_ins: number;
  unique_restaurants: number;
  neighborhoods_visited: number;
  cuisines_tried: string[] | null;
  last_check_in: string | null;
}

export interface Favorite {
  user_id: string;
  restaurant_id: string;
  created_at: string;
  restaurant?: Restaurant;
}
