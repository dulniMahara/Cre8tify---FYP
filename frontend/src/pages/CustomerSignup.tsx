import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { Eye, EyeOff } from 'lucide-react';
import "../styles/signup.css";

const initialFormState = {
  name: '',
  email: '',
  contact: '',
  address: '',
  password: '',
  confirmPassword: '',
  gender: '',
  interest: [] as string[],
  role: 'buyer'
};

export default function CustomerSignup() {
  const navigate = useNavigate();

  // States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  // Reset form 
  useEffect(() => {
    setFormData(initialFormState);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'interest') {
      let updatedInterests = [...formData.interest];
      if (checked) {
        if (value === 'all') {
          updatedInterests = ['all'];
        } else {
          updatedInterests = updatedInterests.filter(i => i !== 'all');
          //  LOGIC: Limit to ONLY 2 options
          if (updatedInterests.length < 2) {
            updatedInterests.push(value);
          } else {
            alert("Please select a maximum of 2 interests, or choose 'Everything'.");
            return;
          }
        }
      } else {
        updatedInterests = updatedInterests.filter(i => i !== value);
      }
      setFormData({ ...formData, interest: updatedInterests });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match!");
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        //  THIS IS THE CHANGE: Save the real data for the Profile Page
        localStorage.setItem('userInfo', JSON.stringify(formData));

        localStorage.setItem('isNewUser', 'true');
        alert("Customer Registration Successful!");
        navigate('/login');
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Server error. Check your backend!");
    }
  };

  // Styles
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    paddingRight: '40px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    background: '#ffffff',
    fontSize: '12px',
    color: '#1e293b',
    outline: 'none',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 700,
    color: '#64748b',
    marginBottom: '6px',
    display: 'block',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  };

  const eyeIconStyle: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#94a3b8',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s ease'
  };

  const radioContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer',
    marginBottom: '6px'
  };

  return (
    <>
      <style>{`
        .filling-input:focus {
          border-color: #0d375b !important;
          box-shadow: 0 0 0 4px rgba(13, 55, 91, 0.05) !important;
          background: #fff !important;
        }
        
        .btn-signup-pro {
          width: 100%;
          padding: 13px;
          fontSize: 14px;
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
      `}</style>

      <div className="signup-container" style={{ display: 'flex', width: '100%', height: '100vh', background: 'white', overflow: 'hidden' }}>

        {/* --- LEFT SIDE: VIDEO --- */}
        <div className="signup-left" style={{ flex: '0 0 500px', position: 'relative', height: '100vh', overflow: 'hidden', backgroundColor: '#ffffff', padding: 0 }}>
          <video autoPlay loop muted playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}>
            <source src="/img/customer.mp4" type="video/mp4" />
          </video>
          <div style={{ position: 'relative', zIndex: 3, padding: '50px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'transparent' }}>
            <img src="/img/logo.png" alt="Cre8tify" style={{ width: '120px', marginBottom: '35px', filter: 'drop-shadow(0 8px 15px rgba(0,0,0,0.15))' }} />
            <h1 style={{ fontSize: '42px', lineHeight: '1.1', color: '#0d375b', fontWeight: 900, textShadow: '0 2px 10px rgba(255,255,255,0.5)' }}>Create Your <br /> Free Account</h1>
            <p style={{ color: '#64748b', fontSize: '16px', fontWeight: 600, marginTop: '20px', textShadow: '0 2px 10px rgba(255,255,255,0.5)' }}>Experience the future of fashion <br /> with 360° Live Previews.</p>
          </div>
        </div>

        {/* --- RIGHT SIDE: FORM --- */}
        <div className="signup-right" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '40px 20px',
          overflowY: 'auto',
          background: '#f8fafc'
        }}>
          <div style={{ width: '100%', maxWidth: '550px' }}>
            <div className="white-form-card" style={{
              padding: '35px',
              borderRadius: '24px',
              background: '#fff',
              boxShadow: '0 25px 50px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.02)',
              marginBottom: '40px'
            }}>

              <div style={{ marginBottom: '35px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0d375b', letterSpacing: '0.5px', marginBottom: '8px' }}>CUSTOMER REGISTRATION</h2>
                <div style={{ width: '35px', height: '3px', background: '#0d375b', margin: '0 auto', borderRadius: '10px' }}></div>
              </div>

              <form onSubmit={handleSignup} autoComplete="off">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '18px' }}>
                  <div className="form-group">
                    <label style={labelStyle}>Full Name</label>
                    <input type="text" className="filling-input" name="name" value={formData.name} style={inputStyle} required onChange={handleChange} autoComplete="name" />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Contact Number</label>
                    <input type="tel" className="filling-input" name="contact" value={formData.contact} style={inputStyle} onChange={handleChange} autoComplete="tel" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '18px' }}>
                  <div className="form-group">
                    <label style={labelStyle}>Delivery Address</label>
                    <input type="text" className="filling-input" name="address" id="signup-address" value={formData.address} style={inputStyle} onChange={handleChange} autoComplete="street-address" />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Email</label>
                    <input type="email" className="filling-input" name="email" id="signup-email" value={formData.email} style={inputStyle} required onChange={handleChange} autoComplete="username" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                  <div className="form-group">
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        id="signup-password"
                        className="filling-input"
                        style={inputStyle}
                        required
                        onChange={handleChange}
                        autoComplete="new-password"
                      />
                      <div style={eyeIconStyle} onClick={() => setShowPassword(!showPassword)} onMouseEnter={(e) => e.currentTarget.style.color = '#0d375b'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        className="filling-input"
                        style={inputStyle}
                        required
                        onChange={handleChange}
                        autoComplete="new-password"
                      />
                      <div style={eyeIconStyle} onClick={() => setShowConfirmPassword(!showConfirmPassword)} onMouseEnter={(e) => e.currentTarget.style.color = '#0d375b'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- PREFERENCES SECTION --- */}
                <div style={{ display: 'flex', padding: '25px', background: '#f8fafc', borderRadius: '18px', border: '1px solid #e2e8f0', marginBottom: '30px', alignItems: 'stretch' }}>
                  {/* GENDER */}
                  <div style={{ flex: '1.5', paddingRight: '20px' }}>
                    <label style={{ ...labelStyle, fontSize: '12px', color: '#0d375b' }}>Gender Identity</label>
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '12px' }}>
                      <label style={radioContainerStyle}><input type="radio" name="gender" value="men" checked={formData.gender === 'men'} onChange={handleChange} style={{ width: '13px', height: '13px', cursor: 'pointer' }} /> Men</label>
                      <label style={radioContainerStyle}><input type="radio" name="gender" value="women" checked={formData.gender === 'women'} onChange={handleChange} style={{ width: '13px', height: '13px', cursor: 'pointer' }} /> Women</label>
                      <label style={radioContainerStyle}><input type="radio" name="gender" value="prefer-not" checked={formData.gender === 'prefer-not'} onChange={handleChange} style={{ width: '13px', height: '13px', cursor: 'pointer' }} /> Prefer not to say</label>
                    </div>
                  </div>

                  <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }}></div>

                  {/* STYLE INTERESTS */}
                  <div style={{ flex: '1.5', paddingLeft: '35px' }}>
                    <label style={{ ...labelStyle, fontSize: '12px', color: '#0d375b' }}>Style Interests</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: '12px', gap: '5px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={radioContainerStyle}><input type="checkbox" name="interest" value="men" checked={formData.interest.includes('men')} onChange={handleChange} style={{ width: '13px', height: '13px', cursor: 'pointer' }} /> Men</label>
                        <label style={radioContainerStyle}><input type="checkbox" name="interest" value="women" checked={formData.interest.includes('women')} onChange={handleChange} style={{ width: '13px', height: '13px', cursor: 'pointer' }} /> Women</label>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={radioContainerStyle}><input type="checkbox" name="interest" value="kids" checked={formData.interest.includes('kids')} onChange={handleChange} style={{ width: '13px', height: '13px', cursor: 'pointer' }} /> Kids</label>
                        <label style={radioContainerStyle}><input type="checkbox" name="interest" value="all" checked={formData.interest.includes('all')} onChange={handleChange} style={{ width: '13px', height: '13px', cursor: 'pointer' }} /> All</label>
                      </div>
                    </div>
                    <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '12px', fontWeight: 600 }}>* Select up to 2 interests</p>
                  </div>
                </div>

                <button type="submit" className="btn-signup-pro">
                  CREATE ACCOUNT
                </button>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Already have an account? <Link to="/login" state={{ role: 'buyer' }} style={{ color: '#0d375b', fontWeight: 900, textDecoration: 'none' }}>Login here</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}