import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { logout } from '../features/auth/authSlice';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  // Get the user state from Redux
  const { user } = useSelector((state: RootState) => state.auth);

  const onLogout = () => {
    // Dispatch the Redux action to clear state and local storage
    dispatch(logout()); 
    navigate('/login'); // Redirect to login page
  };

  return (
    <header style={{ padding: '10px 20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', fontSize: '24px', color: '#333' }}>
        <Link to='/' style={{ textDecoration: 'none', color: '#333' }}>Cre8tify</Link>
      </div>
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '20px' }}>
          <li><Link to="/" style={{ textDecoration: 'none', color: '#555' }}>Home</Link></li>
          
          {/* --- CONDITIONAL RENDERING BASED ON LOGIN STATUS --- */}
          {user ? (
            // If user is logged in: Show Dashboard link and Logout button
            <>
              <li>
                {/* Dynamically link to the correct dashboard based on the user's role */}
                <Link to={`/${user.role}/dashboard`} style={{ textDecoration: 'none', color: '#555' }}>
                  {user.role === 'admin' ? 'Admin' : user.role === 'designer' ? 'Designer' : 'Buyer'} Panel
                </Link>
              </li>
              <li>
                <button 
                  onClick={onLogout} 
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#dc3545', textDecoration: 'underline' }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            // If user is NOT logged in: Show Login and Register links
            <>
              <li><Link to="/login" style={{ textDecoration: 'none', color: '#555' }}>Login</Link></li>
              <li><Link to="/register" style={{ textDecoration: 'none', color: '#555' }}>Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;