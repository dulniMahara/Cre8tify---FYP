import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Clear session if already logged in as something else?
        // Or check if already admin
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            if (user.role === 'admin') navigate('/admin-dashboard');
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.role !== 'admin') {
                    alert("Access Denied: You do not have administrator privileges.");
                    setLoading(false);
                    return;
                }
                localStorage.setItem('userInfo', JSON.stringify(data));
                localStorage.setItem('token', data.token);
                navigate('/admin-dashboard');
            } else {
                alert(data.message || "Invalid Admin Credentials");
            }
        } catch (error) {
            alert("Connection error. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '40px 0', overflowY: 'auto' }}>

            <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', width: '350px', textAlign: 'center' }}>

                <div style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#0d375b', fontSize: '24px', fontWeight: '900', letterSpacing: '1px' }}>Cre8tify</span>
                        <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#0284c7', padding: '3px 10px', borderRadius: '15px', fontSize: '10px', fontWeight: 'bold' }}>ADMIN</span>
                    </div>
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '20px 0' }} />
                    <h2 style={{ fontSize: '20px', color: '#334155', margin: '0 0 20px 0', fontWeight: '700' }}>Admin Login</h2>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Enter secure credentials to access control panel.</p>
                </div>

                <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b', fontSize: '12px' }}>Admin Email</label>
                         <input
                            type="email"
                            name="admin_cre8_email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off"
                            readOnly
                            onFocus={(e) => e.target.removeAttribute('readonly')}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
                        />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b', fontSize: '12px' }}>Password</label>
                         <input
                            type="password"
                            name="admin_cre8_password"
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
                        disabled={loading}
                        style={{ marginTop: '10px', padding: '14px', borderRadius: '12px', background: '#0d375b', color: 'white', border: 'none', fontSize: '14px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                </form>

                <button
                    onClick={() => navigate('/')}
                    style={{ marginTop: '25px', background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    Return to Public Site
                </button>
            </div>
        </div>
    );
};

export default AdminLogin;
