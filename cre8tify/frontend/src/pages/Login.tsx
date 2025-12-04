import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import authService from '../features/auth/authService';
import { loginSuccess, logout } from '../features/auth/authSlice';
import { AppDispatch, RootState } from '../app/store';

// Simple loading component for illustration
const Spinner = () => <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '20px', height: '20px', animation: 'spin 2s linear infinite' }}></div>;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Get user state from Redux
  const { user } = useSelector((state: RootState) => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Redirect to home page
      navigate('/'); 
    }
  }, [user, navigate]);


  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userData = { email, password };
      const userPayload = await authService.login(userData);

      // Dispatch success action to update Redux store
      dispatch(loginSuccess(userPayload)); 
      navigate('/'); // Navigate to home on success

    } catch (err: any) {
      // Display error message from the backend (if available)
      const message = 
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        'Login failed. Check your email and password.';

      setError(message);
      dispatch(logout()); // Clear any previous failed state
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Login to Cre8tify</h2>
      <p>Access your Buyer, Designer, or Admin account.</p>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type='email'
            name='email'
            value={email}
            onChange={onChange}
            placeholder='Enter your email'
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            required
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type='password'
            name='password'
            value={password}
            onChange={onChange}
            placeholder='Enter password'
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            required
          />
        </div>
        <button 
          type='submit' 
          disabled={isLoading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isLoading ? <Spinner /> : 'Log In'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Don't have an account? <a href='/register' style={{ color: '#007bff' }}>Register Here</a>
      </p>
    </div>
  );
};

export default Login;