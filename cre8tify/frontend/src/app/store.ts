import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other feature reducers here (e.g., designs, cart)
  },
});

// Define types for state and dispatch (for use throughout the application)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;