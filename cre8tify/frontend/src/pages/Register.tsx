import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import authService from '../features/auth/authService';
import { loginSuccess } from '../features/auth/authSlice';
import { AppDispatch, RootState } from '../app/store';

// Simple loading component for illustration (reused from Login.tsx)
const Spinner = () => (
  <div 
    style={{ 
      border: '4px solid #f3f3f3', 
      borderTop: '4px solid #3498db', 
      borderRadius: '50%', 
      width: '20px', 
      height: '20px', 
      animation: 'spin 2s linear infinite', 
      margin: 'auto' 
    }}
  ></div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '', // Used for password confirmation
    role: 'buyer' as 'buyer' | 'designer', // Default role is buyer
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { name, email, password, password2, role } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Get user state from Redux
  const { user } = useSelector((state: RootState) => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/'); 
    }
  }, [user, navigate]);


  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const userData = { name, email, password, role };
      const userPayload = await authService.register(userData);

      // Dispatch success action to update Redux store and log user in
      dispatch(loginSuccess(userPayload)); 

      // Show success message briefly before navigating
      setSuccessMessage(`Registration successful! Welcome to Cre8tify as a ${role}.`);
      setTimeout(() => {
        navigate('/'); // Navigate to home on success
      }, 1500);

    } catch (err: any) {
      // Get specific error message from the backend (e.g., "User already exists")
      const message = 
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        'Registration failed.';

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Create Your Cre8tify Account</h2>
      <p>Register as a Buyer or a Designer to get started.</p>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      {successMessage && <div style={{ color: 'green', marginBottom: '15px' }}>{successMessage}</div>}

      <form onSubmit={onSubmit}>

        {/* Name Field */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
          <input
            type='text'
            name='name'
            value={name}
            onChange={onChange}
            placeholder='Enter your name'
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            required
          />
        </div>

        {/* Email Field */}
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

        {/* Role Selector */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>I want to register as:</label>
          <select
            name='role'
            value={role}
            onChange={onChange}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          >
            <option value='buyer'>Buyer (To purchase custom designs)</option>
            <option value='designer'>Designer (To upload and sell designs)</option>
          </select>
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type='password'
            name='password'
            value={password}
            onChange={onChange}
            placeholder='Choose a password'
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            required
          />
        </div>

        {/* Confirm Password Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Confirm Password</label>
          <input
            type='password'
            name='password2'
            value={password2}
            onChange={onChange}
            placeholder='Confirm password'
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <button 
          type='submit' 
          disabled={isLoading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isLoading ? <Spinner /> : 'Register'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Already have an account? <a href='/login' style={{ color: '#007bff' }}>Log In Here</a>
      </p>
    </div>
  );
};

export default Register;