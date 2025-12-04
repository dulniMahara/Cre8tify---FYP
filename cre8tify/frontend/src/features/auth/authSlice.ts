import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the structure for a User object
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'designer' | 'admin';
  isApproved?: boolean;
  token: string;
}

// Define the state structure for the Auth slice
interface AuthState {
  user: User | null;
}

// Attempt to load user data from Local Storage (for persistent login)
const storedUser = localStorage.getItem('user');
const user: User | null = storedUser ? JSON.parse(storedUser) : null;

const initialState: AuthState = {
  user: user,
};

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
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;