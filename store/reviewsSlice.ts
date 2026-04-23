import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  createReview,
  getCities,
  listReviews,
  type ApiCity,
  type ApiReview,
  type CreateReviewInput,
} from '@/services/travoApi';

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type ReviewsState = {
  // Cities (shared by feed and create form)
  cities: ApiCity[];
  fetchCitiesStatus: AsyncStatus;
  fetchCitiesError: string | null;

  // Home feed — all reviews with resolved city names
  feed: ApiReview[];
  fetchFeedStatus: AsyncStatus;
  fetchFeedError: string | null;

  // Account page — reviews for a single user
  userReviews: ApiReview[];
  fetchUserStatus: AsyncStatus;
  fetchUserError: string | null;

  // POST a new review
  submitStatus: AsyncStatus;
  submitError: string | null;
};

const initialState: ReviewsState = {
  cities: [],
  fetchCitiesStatus: 'idle',
  fetchCitiesError: null,

  feed: [],
  fetchFeedStatus: 'idle',
  fetchFeedError: null,

  userReviews: [],
  fetchUserStatus: 'idle',
  fetchUserError: null,

  submitStatus: 'idle',
  submitError: null,
};

// GET cities only (used by create form and map)
export const fetchCities = createAsyncThunk('reviews/fetchCities', getCities);

// GET all reviews + cities (home feed)
export const fetchFeed = createAsyncThunk('reviews/fetchFeed', async () => {
  const [reviews, cities] = await Promise.all([listReviews(), getCities()]);
  return { reviews, cities };
});

// GET reviews for a single user (account page)
export const fetchUserReviews = createAsyncThunk(
  'reviews/fetchUserReviews',
  async (username: string) => listReviews(username),
);

// POST a new review
export const submitReview = createAsyncThunk(
  'reviews/submit',
  async (input: CreateReviewInput) => createReview(input),
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    resetSubmit(state) {
      state.submitStatus = 'idle';
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCities
      .addCase(fetchCities.pending, (state) => {
        state.fetchCitiesStatus = 'loading';
        state.fetchCitiesError = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.fetchCitiesStatus = 'succeeded';
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.fetchCitiesStatus = 'failed';
        state.fetchCitiesError = action.error.message ?? 'Failed to load cities';
      })

      // fetchFeed
      .addCase(fetchFeed.pending, (state) => {
        state.fetchFeedStatus = 'loading';
        state.fetchFeedError = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.fetchFeedStatus = 'succeeded';
        state.feed = action.payload.reviews;
        // cities shared with create form — only overwrite if not already loaded
        if (state.fetchCitiesStatus !== 'succeeded') {
          state.cities = action.payload.cities;
          state.fetchCitiesStatus = 'succeeded';
        }
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.fetchFeedStatus = 'failed';
        state.fetchFeedError = action.error.message ?? 'Failed to load feed';
      })

      // fetchUserReviews
      .addCase(fetchUserReviews.pending, (state) => {
        state.fetchUserStatus = 'loading';
        state.fetchUserError = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.fetchUserStatus = 'succeeded';
        state.userReviews = action.payload;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.fetchUserStatus = 'failed';
        state.fetchUserError = action.error.message ?? 'Failed to load posts';
      })

      // submitReview
      .addCase(submitReview.pending, (state) => {
        state.submitStatus = 'loading';
        state.submitError = null;
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.submitError = action.error.message ?? 'Failed to submit post';
      });
  },
});

export const { resetSubmit } = reviewsSlice.actions;
export default reviewsSlice.reducer;
