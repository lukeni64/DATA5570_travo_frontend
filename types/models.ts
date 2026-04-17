export type TravelPost = {
  id: number;
  user: string;
  userProfileImage: string;
  image: string;
  city: string;
  state: string;
  description: string;
  startDate?: string;
  endDate?: string;
  pros: string[];
  cons: string[];
  rating?: number;
  price?: number;
  createdAt: string;
};

export type ApiCity = {
  id: number;
  city: string;
  state_name: string;
  lat: string;
  lng: string;
};

export type ApiUser = {
  user_key: number;
  username: string;
  last_name: string;
  first_name: string;
  phone_number: string;
  date_created: string;
  email: string;
};

export type ApiRelationship = {
  id: number;
  requester: number;
  requester_username: string;
  addressee: number;
  addressee_username: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  date_sent: string;
};

export type ApiReview = {
  id: number;
  user: number;
  user_username: string;
  rating: number;
  description: string;
  city: number;
  city_name: string;
  state_name: string;
  created_at: string;
  pros: string;
  cons: string;
  date_start?: string | null;
  date_end?: string | null;
};

export type Friend = {
  id: number;
  username: string;
  image: string;
};

export type FriendRequest = {
  id: number;
  username: string;
  image: string;
};

export type CreateUserPayload = {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
};

export type CreateReviewPayload = {
  user: number;
  rating: number;
  description: string;
  city: number;
  pros: string;
  cons: string;
  date_start?: string;
  date_end?: string;
};

export type CreateRelationshipPayload = {
  requester: number;
  addressee: number;
  status: 'pending';
};
