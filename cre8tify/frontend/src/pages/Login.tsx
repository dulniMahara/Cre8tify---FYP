import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const userRole = location.state?.role || 'designer'; 

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // RESET FORM ON PAGE LOAD
    useEffect(() => {
        setEmail('');
        setPassword('');
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }), 
        });

        const data = await response.json();

        if (response.ok) {
            // logic tosave the user info and Token in the browser
            localStorage.setItem('userInfo', JSON.stringify(data));

            // Go to correct dashboard based on the role from the Database
            if (data.role === 'designer') {
                navigate('/designer-dashboard');
            } else {
                navigate('/buyer-dashboard');
            }
        } else {
            alert(data.message || "Invalid Email or Password");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Server error. Is your backend running?");
      }
  };

    return (
        <div style={{ height: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            <div style={{ background: 'white', padding: '60px 80px', borderRadius: '30px', boxShadow: '0 30px 60px rgba(0,0,0,0.08)', width: '600px' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '64px', color: '#0d375b', margin: '0 0 15px 0', fontStyle: 'italic' }}>
                        {userRole === 'buyer' ? 'Customer Login' : 'Designer Login'}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '18px', margin: 0 }}>
                        Please enter your details to login.
                    </p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }} autoComplete="off">
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off"
                            style={{ width: '100%', padding: '18px', borderRadius: '12px', border: '2px solid #e2e8f0', background: 'white', outline: 'none', fontSize: '16px', color: '#0f172a' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>
                            Password
                        </label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password" 
                            required
                            autoComplete="new-password"
                            style={{ width: '100%', padding: '18px', borderRadius: '12px', border: '2px solid #e2e8f0', background: 'white', outline: 'none', fontSize: '16px', color: '#0f172a' }}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={{ marginTop: '20px', padding: '20px', borderRadius: '15px', background: '#0d375b', color: 'white', border: 'none', fontSize: '18px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px rgba(13, 55, 91, 0.2)' }}
                    >
                        Login
                    </button>
                </form>

                <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '16px' }}>
                    <span style={{ color: '#94a3b8' }}>Don't have an account? </span>
                    <span 
                        style={{ color: '#0d375b', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }} 
                        onClick={() => navigate(userRole === 'buyer' ? '/buyer-signup' : '/designer-signup')}
                    >
                        Sign Up as {userRole === 'buyer' ? 'Customer' : 'Designer'}
                    </span>
                </div>

            </div>
        </div>
    );
};

export default Login;