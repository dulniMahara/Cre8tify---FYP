// cre8tify/frontend/src/features/auth/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// --- 1. Define and Export Types ---
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'designer' | 'admin';
  isApproved?: boolean;
  token: string;
}

export interface AuthState {
  user: User | null;
}
// ----------------------------------

// Attempt to load user data from Local Storage (for persistent login)
const storedUser = localStorage.getItem('user');
const user: User | null = storedUser ? JSON.parse(storedUser) : null;

const initialState: AuthState = {
  user: user,
};

// --- 2. Define the Slice (This was likely missing or misplaced!) ---
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducer to handle login success
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      // Save user data (including token) to Local Storage
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    // Reducer to handle logout
    logout: (state) => {
      state.user = null;
      // Remove user data from Local Storage
      localStorage.removeItem('user');
    },
    // You can add other actions like registerSuccess, etc. here if needed
  },
});
// -----------------------------------------------------------------

// --- 3. Export Actions and Reducer (This relies on the above definition) ---
export const { loginSuccess, logout } = authSlice.actions; // Fixes 'Cannot find name authSlice'
export default authSlice.reducer; // Fixes 'Cannot find name authSlice'