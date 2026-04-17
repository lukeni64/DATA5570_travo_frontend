import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { api } from '@/store/api';
import {
  ApiCity,
  ApiRelationship,
  ApiReview,
  ApiUser,
  CreateRelationshipPayload,
  CreateReviewPayload,
  CreateUserPayload,
} from '@/types/models';

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type TravoState = {
  activeUserId?: number;
  cities: ApiCity[];
  relationships: ApiRelationship[];
  reviews: ApiReview[];
  users: ApiUser[];
  citiesStatus: LoadStatus;
  relationshipsStatus: LoadStatus;
  reviewsStatus: LoadStatus;
  usersStatus: LoadStatus;
  createUserStatus: LoadStatus;
  createReviewStatus: LoadStatus;
  relationshipMutationStatus: LoadStatus;
  error?: string;
};

const initialState: TravoState = {
  cities: [],
  relationships: [],
  reviews: [],
  users: [],
  citiesStatus: 'idle',
  relationshipsStatus: 'idle',
  reviewsStatus: 'idle',
  usersStatus: 'idle',
  createUserStatus: 'idle',
  createReviewStatus: 'idle',
  relationshipMutationStatus: 'idle',
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export const fetchCities = createAsyncThunk('travo/fetchCities', async () => {
  return api.get<ApiCity[]>('cities/');
});

export const fetchUsers = createAsyncThunk('travo/fetchUsers', async () => {
  return api.get<ApiUser[]>('dim-users/');
});

export const fetchReviews = createAsyncThunk('travo/fetchReviews', async () => {
  return api.get<ApiReview[]>('reviews/');
});

export const fetchRelationships = createAsyncThunk('travo/fetchRelationships', async () => {
  return api.get<ApiRelationship[]>('relationships/');
});

export const createUser = createAsyncThunk(
  'travo/createUser',
  async (payload: CreateUserPayload, { rejectWithValue }) => {
    try {
      return await api.post<ApiUser>('dim-users/', payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createReview = createAsyncThunk(
  'travo/createReview',
  async (payload: CreateReviewPayload, { rejectWithValue }) => {
    try {
      return await api.post<ApiReview>('reviews/', payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createRelationship = createAsyncThunk(
  'travo/createRelationship',
  async (payload: CreateRelationshipPayload, { rejectWithValue }) => {
    try {
      return await api.post<ApiRelationship>('relationships/', payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteRelationship = createAsyncThunk(
  'travo/deleteRelationship',
  async (relationshipId: number, { rejectWithValue }) => {
    try {
      await api.delete(`relationships/${relationshipId}/`);
      return relationshipId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const travoSlice = createSlice({
  name: 'travo',
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined;
    },
    setActiveUserId(state, action: PayloadAction<number | undefined>) {
      state.activeUserId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.citiesStatus = 'loading';
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.citiesStatus = 'succeeded';
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.citiesStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.usersStatus = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersStatus = 'succeeded';
        state.users = action.payload;
        if (action.payload.length > 0) {
          const activeUserExists = action.payload.some((user) => user.user_key === state.activeUserId);
          if (!activeUserExists) {
            state.activeUserId = action.payload[0].user_key;
          }
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchReviews.pending, (state) => {
        state.reviewsStatus = 'loading';
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.reviewsStatus = 'succeeded';
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.reviewsStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchRelationships.pending, (state) => {
        state.relationshipsStatus = 'loading';
      })
      .addCase(fetchRelationships.fulfilled, (state, action) => {
        state.relationshipsStatus = 'succeeded';
        state.relationships = action.payload;
      })
      .addCase(fetchRelationships.rejected, (state, action) => {
        state.relationshipsStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(createUser.pending, (state) => {
        state.createUserStatus = 'loading';
        state.error = undefined;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createUserStatus = 'succeeded';
        state.users = [...state.users, action.payload].sort((left, right) =>
          left.username.localeCompare(right.username),
        );
        state.activeUserId = action.payload.user_key;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createUserStatus = 'failed';
        state.error = (action.payload as string | undefined) ?? action.error.message;
      })
      .addCase(createReview.pending, (state) => {
        state.createReviewStatus = 'loading';
        state.error = undefined;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.createReviewStatus = 'succeeded';
        state.reviews = [action.payload, ...state.reviews];
      })
      .addCase(createReview.rejected, (state, action) => {
        state.createReviewStatus = 'failed';
        state.error = (action.payload as string | undefined) ?? action.error.message;
      })
      .addCase(createRelationship.pending, (state) => {
        state.relationshipMutationStatus = 'loading';
        state.error = undefined;
      })
      .addCase(createRelationship.fulfilled, (state, action) => {
        state.relationshipMutationStatus = 'succeeded';
        state.relationships = [action.payload, ...state.relationships];
      })
      .addCase(createRelationship.rejected, (state, action) => {
        state.relationshipMutationStatus = 'failed';
        state.error = (action.payload as string | undefined) ?? action.error.message;
      })
      .addCase(deleteRelationship.pending, (state) => {
        state.relationshipMutationStatus = 'loading';
        state.error = undefined;
      })
      .addCase(deleteRelationship.fulfilled, (state, action) => {
        state.relationshipMutationStatus = 'succeeded';
        state.relationships = state.relationships.filter(
          (relationship) => relationship.id !== action.payload,
        );
      })
      .addCase(deleteRelationship.rejected, (state, action) => {
        state.relationshipMutationStatus = 'failed';
        state.error = (action.payload as string | undefined) ?? action.error.message;
      });
  },
});

export const { clearError, setActiveUserId } = travoSlice.actions;
export default travoSlice.reducer;
