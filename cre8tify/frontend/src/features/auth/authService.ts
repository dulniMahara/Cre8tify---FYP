import axios from 'axios';

// Base URL for the user API routes
const API_URL = '/api/users/'; 

// --- Types (must match the backend data structure) ---
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'designer' | 'admin';
  isApproved?: boolean;
  token: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'designer';
}

interface LoginData {
  email: string;
  password: string;
}
// ------------------------------------

// Register user
const register = async (userData: RegisterData): Promise<UserData> => {
  const response = await axios.post(API_URL + 'register', userData);

  // Save user to local storage and return data if successful
  if (response.data) {
    // Note: authSlice also handles saving, but this ensures immediate sync if needed
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Login user
const login = async (userData: LoginData): Promise<UserData> => {
  const response = await axios.post(API_URL + 'login', userData);

  // Save user to local storage and return data if successful
  if (response.data) {
    // Note: authSlice also handles saving, but this ensures immediate sync if needed
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Logout user - clears local storage
const logout = () => {
  localStorage.removeItem('user');
};

// Export service functions
const authService = {
  register,
  login,
  logout,
};

export default authService;