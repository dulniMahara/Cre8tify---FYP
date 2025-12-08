import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import designReducer from '../features/designs/designSlice'; // Import the new design slice

export const store = configureStore({
    reducer: {
        auth: authReducer,
        design: designReducer, // Add the new design slice
    },
});

// Define RootState and AppDispatch types for use throughout the application
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;