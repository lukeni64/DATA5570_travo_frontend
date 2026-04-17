import { configureStore } from '@reduxjs/toolkit';

import travoReducer from '@/store/travoSlice';

export const store = configureStore({
  reducer: {
    travo: travoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
