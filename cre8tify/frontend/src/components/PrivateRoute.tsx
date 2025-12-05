import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

// This component acts as a guard. If the user is logged out,
// it redirects them to the login page. If they are logged in,
// it renders the child route.

interface PrivateRouteProps {
  // Optional: Specify required roles (e.g., ['designer', 'admin'])
  requiredRole?: ('buyer' | 'designer' | 'admin')[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  // Get the user state from Redux
  const { user } = useSelector((state: RootState) => state.auth);

  // 1. Check if the user is logged in
  if (!user) {
    // Redirect to login if no user is found
    return <Navigate to='/login' replace />;
  }

  // 2. Check Role Authorization (if requiredRole is specified)
  if (requiredRole && !requiredRole.includes(user.role)) {
    // Redirect to the home page or a 403 Forbidden page if role doesn't match
    console.warn(`User role (${user.role}) is not authorized for this route.`);
    // Note: You could create a dedicated /403 page here, but we redirect to home for simplicity.
    return <Navigate to='/' replace />;
  }

  // 3. If logged in and authorized, render the child route content
  return <Outlet />;
};

export default PrivateRoute;