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
            console.log("Login successful, data received:", data);
            
            // 🟢 Use centralized auth utility for role-based storage
            import('../utils/auth').then(({ setUserInfo }) => {
                setUserInfo(data);
            });

            // Go to the correct dashboard based on the role from the Database
            if (data.role === 'designer') {
                navigate('/designer-dashboard');
            } else {
                navigate('/customer-dashboard');
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
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '40px 0', overflowY: 'auto' }}>
            
            <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', width: '350px', textAlign: 'center' }}>
                
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#0d375b', fontSize: '24px', fontWeight: '900', letterSpacing: '1px' }}>Cre8tify</span>
                        <span style={{ 
                            background: userRole === 'buyer' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)', 
                            color: userRole === 'buyer' ? '#15803d' : '#0284c7', 
                            padding: '3px 10px', 
                            borderRadius: '15px', 
                            fontSize: '9px', 
                            fontWeight: '900',
                            textTransform: 'uppercase'
                        }}>
                            {userRole === 'buyer' ? 'CUSTOMER' : 'DESIGNER'}
                        </span>
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '20px 0' }} />
                    <h2 style={{ fontSize: '20px', color: '#334155', margin: '0 0 20px 0', fontWeight: '700'  }}>
                        {userRole === 'buyer' ? 'Customer Login' : 'Designer Login'}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Welcome back! Please enter your credentials.</p>
                </div>

                <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b', fontSize: '12px' }}>Email Address</label>
                        <input 
                            type="email" 
                            name="cre8_user_email"
                            placeholder="your@email.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off"
                            readOnly
                            onFocus={(e) => e.target.removeAttribute('readonly')}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                        />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b', fontSize: '12px' }}>Password</label>
                        <input 
                            type="password" 
                            name="cre8_user_password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" 
                            required
                            autoComplete="new-password"
                            readOnly
                            onFocus={(e) => e.target.removeAttribute('readonly')}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={{ marginTop: '10px', padding: '14px', borderRadius: '12px', background: '#0d375b', color: 'white', border: 'none', fontSize: '14px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#0f2950'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#0d375b'}
                    >
                        Login
                    </button>
                </form>

                <div style={{ marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                        Don't have an account? {' '}
                        <span 
                            onClick={() => navigate(userRole === 'buyer' ? '/buyer-signup' : '/designer-signup')}
                            style={{ color: '#0d375b', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Sign Up
                        </span>
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        style={{ marginTop: '15px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '11px', cursor: 'pointer' }}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;