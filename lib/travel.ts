import { ApiReview, TravelPost } from '@/types/models';

const FALLBACK_REVIEW_IMAGE = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';

export function buildAvatarUrl(seed: string) {
  return `https://i.pravatar.cc/120?u=${encodeURIComponent(seed)}`;
}

export function parseBulletText(value: string) {
  return value
    .split(/\r?\n|•/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mapReviewToTravelPost(review: ApiReview): TravelPost {
  return {
    id: review.id,
    user: review.user_username,
    userProfileImage: buildAvatarUrl(review.user_username),
    image: FALLBACK_REVIEW_IMAGE,
    city: review.city_name,
    state: review.state_name,
    description: review.description,
    startDate: review.date_start ?? undefined,
    endDate: review.date_end ?? undefined,
    pros: parseBulletText(review.pros),
    cons: parseBulletText(review.cons),
    rating: review.rating,
    createdAt: review.created_at,
  };
}
