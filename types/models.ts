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
