import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import "../styles/signup.css";
import Footer from '../components/Footer';

const initialFormState = {
  name: '',
  username: '',
  email: '',
  contact: '',
  password: '',
  confirmPassword: '',
  shopName: '',
  portfolio: '',
  description: '',
  role: 'designer'
};

export default function DesignerSignup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    setFormData(initialFormState);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // PASSWORD MATCH LOGIC + FETCHING
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("⚠️ Passwords do not match! Please check again.");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // THE CHANGE: Save the user data immediately (Auto-Login)
        localStorage.setItem('userInfo', JSON.stringify(data));

        alert("✅ Registration Successful! Welcome to Cre8tify!");

        //  Redirect straight to the Designer Dashboard
        navigate('/designer-dashboard');
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Server is not responding.");
    }
  };

  const fillingBarStyle: React.CSSProperties = {
    border: '1.5px solid #e2e8f0',
    background: '#ffffff',
    borderRadius: '10px',
    padding: '11px 14px',
    fontSize: '12px',
    width: '100%',
    outline: 'none',
    color: '#1e293b',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  };

  const eyeIconStyle: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s ease'
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-logo { animation: fadeInScale 0.8s ease-out forwards; }
        .animate-text { opacity: 0; animation: fadeInUp 0.8s ease-out 0.3s forwards; }
        .animate-list { opacity: 0; animation: fadeInUp 0.8s ease-out 0.6s forwards; }
        
        .filling-input:focus {
          border-color: #0d375b !important;
          box-shadow: 0 0 0 4px rgba(13, 55, 91, 0.05) !important;
          background: #fff !important;
        }
        
        .btn-signup-pro {
          width: 100%;
          padding: 13px;
          fontSize: 13px;
          font-weight: 800;
          border-radius: 12px;
          background-color: #0d375b;
          color: #fff;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(13, 55, 91, 0.15);
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
        }
        
        .btn-signup-pro:hover {
          background-color: #0a2d4a;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13, 55, 91, 0.25);
        }
        
        .btn-signup-pro:active {
          transform: translateY(0);
        }
      `}</style>

      <div className="signup-container">
        <div className="signup-left" style={{
          backgroundImage: `linear-gradient(rgba(13, 55, 91, 0.6), rgba(20, 90, 90, 0.1)), url('/img/fashiondesigner.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <img src="/img/logo.png" alt="Cre8tify" className="signup-logo animate-logo" />
          <h1 className="signup-headline animate-text">Turn Your <br /> Imaginations <br /> Into Income</h1>
          <ul className="benefit-list animate-list">
            <li>Global Reach and Recognition.</li>
            <li>Hassle Free Production and Sale.</li>
            <li>Zero Upfront Cost.</li>
          </ul>
        </div>

        <div className="signup-right" style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: '#f8fafc',
          overflowX: 'auto',
          minWidth: '0'
        }}>
          <div className="blue-card-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div className="white-form-card" style={{
              width: '500px',
              minWidth: '500px',
              padding: '30px',
              borderRadius: '24px',
              background: '#fff',
              margin: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.02)'
            }}>

              <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                <h2 className="form-title" style={{ fontSize: '22px', fontWeight: '900', color: '#0d375b', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  DESIGNER APPLICATION
                </h2>
                <div style={{ width: '35px', height: '3px', background: '#0d375b', margin: '0 auto', borderRadius: '10px' }}></div>
              </div>

              <form onSubmit={handleSignup} autoComplete="off">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: '700', fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Full Name</label>
                    <input type="text" className="filling-input" name="name" value={formData.name} onChange={handleChange} style={fillingBarStyle} required autoComplete="off" />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: '700', fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Username</label>
                    <input type="text" className="filling-input" name="username" value={formData.username} onChange={handleChange} style={fillingBarStyle} required autoComplete="off" />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: '700', fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Email Address</label>
                    <input type="email" className="filling-input" name="email" value={formData.email} onChange={handleChange} style={fillingBarStyle} required />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: '700', fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Contact Number</label>
                    <input type="text" className="filling-input" name="contact" value={formData.contact} onChange={handleChange} style={fillingBarStyle} />
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: '700', fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPassword ? "text" : "password"} className="filling-input" name="password" value={formData.password} onChange={handleChange} style={fillingBarStyle} required autoComplete="new-password" />
                      <div style={eyeIconStyle} onClick={() => setShowPassword(!showPassword)} onMouseEnter={(e) => e.currentTarget.style.color = '#0d375b'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: '700', fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showConfirmPassword ? "text" : "password"} className="filling-input" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={fillingBarStyle} required />
                      <div style={eyeIconStyle} onClick={() => setShowConfirmPassword(!showConfirmPassword)} onMouseEnter={(e) => e.currentTarget.style.color = '#0d375b'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: '700', fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Shop Name</label>
                    <input type="text" className="filling-input" name="shopName" value={formData.shopName} onChange={handleChange} style={fillingBarStyle} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: '700', fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Portfolio Link</label>
                    <input type="text" className="filling-input" name="portfolio" value={formData.portfolio} onChange={handleChange} style={fillingBarStyle} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '22px' }}>
                  <label style={{ fontWeight: '700', fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Description</label>
                  <textarea className="filling-input" name="description" value={formData.description} onChange={handleChange} style={{ ...fillingBarStyle, minHeight: '85px', resize: 'vertical' }}></textarea>
                </div>

                <div className="checkbox-group" style={{ marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="terms" required style={{ width: '13px', height: '13px', cursor: 'pointer' }} />
                  <label htmlFor="terms" style={{ margin: 0, fontWeight: 500, fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>
                    I agree to the <span style={{ color: '#0d375b', fontWeight: '700' }}>Terms & Conditions</span>
                  </label>
                </div>

                <button type="submit" className="btn-signup-pro">
                  CREATE ACCOUNT
                </button>
              </form>

              <div className="login-redirect" style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>Already have an account? </span>
                <Link to="/login" state={{ role: 'designer' }} style={{ color: '#0d375b', fontWeight: '800', textDecoration: 'none' }}>Login here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}