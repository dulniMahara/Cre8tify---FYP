import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { Eye, EyeOff } from 'lucide-react'; 
import "../styles/signup.css"; 

const initialFormState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  address: '',
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
          // 🟢 LOGIC: Limit to ONLY 2 options
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
    padding: '22px', 
    paddingRight: '60px', 
    borderRadius: '18px', 
    border: '2px solid #475569', 
    background: '#f8fafc', 
    fontSize: '22px', 
    color: '#0d375b', 
    outline: 'none',
    fontWeight: 600
  };

  const labelStyle: React.CSSProperties = { 
    fontWeight: 900, 
    color: '#0d375b', 
    marginBottom: '12px', 
    display: 'block', 
    fontSize: '22px' 
  };

  const eyeIconStyle: React.CSSProperties = {
    position: 'absolute',
    right: '25px',
    top: '50%', 
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#475569',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center'
  };

  const radioContainerStyle: React.CSSProperties = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    fontSize: '20px', 
    fontWeight: 700, 
    color: '#334155', 
    cursor: 'pointer',
    marginBottom: '10px' 
  };

  return (
    <>
      <div className="signup-container" style={{ display: 'flex', width: '100vw', height: '100vh', background: 'white' }}>
        
        {/* --- LEFT SIDE: VIDEO --- */}
        <div className="signup-left" style={{ flex: '0 0 600px', position: 'relative', height: '100vh', overflow: 'hidden', backgroundColor: '#f3f4f5' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(13, 55, 91, 0.4)', zIndex: 2 }}></div>
            <video autoPlay loop muted playsInline style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '100%', objectFit: 'cover', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
                <source src="/img/BuyerSignup.mp4" type="video/mp4" />
            </video>
            <div style={{ position: 'relative', zIndex: 3, padding: '80px', paddingTop: '190px' }}>
                <img src="/img/logo.png" alt="Cre8tify" style={{ filter: 'brightness(1) invert(1)', width: '180px', marginBottom: '40px' }} />
                <h1 style={{ fontSize: '55px', lineHeight: '1.1', color: '#fff', fontWeight: 900 }}>Create Your <br/> Free Account</h1>
                <p style={{ color: '#fff', fontSize: '28px', fontWeight: 500, marginTop: '20px' }}>Experience the future of fashion <br/> with 360° Live Previews.</p>
            </div>
        </div>

        {/* --- RIGHT SIDE: FORM --- */}
        <div className="signup-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 60px', paddingTop: '240px', paddingBottom: '100px', overflowY: 'auto', background: '#fcfcfc' }}>
          <div style={{ width: '100%', maxWidth: '1050px' }}> 
            <div className="white-form-card" style={{ padding: '60px', borderRadius: '40px', background: '#fff', boxShadow: '0 25px 70px rgba(0,0,0,0.07)' }}>
              <h2 style={{ fontSize: '42px', fontWeight: 900, color: '#0d375b', marginBottom: '50px', textAlign: 'center' }}>CUSTOMER REGISTRATION</h2>
              
              <form onSubmit={handleSignup} autoComplete="off">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
                    <div className="form-group">
                        <label style={labelStyle}>Full Name</label>
                        <input type="text" name="name" value={formData.name} style={inputStyle} required onChange={handleChange} autoComplete="off" />
                    </div>
                    <div className="form-group">
                        <label style={labelStyle}>Email Address</label>
                        <input type="email" name="email" value={formData.email} style={inputStyle} required onChange={handleChange} autoComplete="new-password" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
                    <div className="form-group">
                        <label style={labelStyle}>Contact Number</label>
                        <input type="text" name="phone" value={formData.phone} style={inputStyle} onChange={handleChange} autoComplete="off" />
                    </div>
                    <div className="form-group">
                        <label style={labelStyle}>Delivery Address</label>
                        <input type="text" name="address" value={formData.address} style={inputStyle} onChange={handleChange} autoComplete="off" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '45px' }}>
                    <div className="form-group">
                        <label style={labelStyle}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                value={formData.password}
                                style={inputStyle} 
                                required 
                                onChange={handleChange}
                                autoComplete="new-password" 
                            />
                            <div style={eyeIconStyle} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={28} /> : <Eye size={28} />}
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
                                style={inputStyle} 
                                required 
                                onChange={handleChange} 
                                autoComplete="new-password"
                            />
                            <div style={eyeIconStyle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff size={28} /> : <Eye size={28} />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PREFERENCES SECTION --- */}
                <div style={{ display: 'flex', padding: '45px', background: '#f8fafc', borderRadius: '35px', border: '2px solid #e2e8f0', marginBottom: '50px', alignItems: 'stretch' }}>
                    {/* GENDER */}
                    <div style={{ flex: '1.5', paddingRight: '40px' }}>
                        <label style={{ ...labelStyle, fontSize: '24px' }}>Gender Identity</label>
                        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
                            <label style={radioContainerStyle}><input type="radio" name="gender" value="men" checked={formData.gender === 'men'} onChange={handleChange} style={{ width: '22px', height: '22px' }} /> Men</label>
                            <label style={radioContainerStyle}><input type="radio" name="gender" value="women" checked={formData.gender === 'women'} onChange={handleChange} style={{ width: '22px', height: '22px' }} /> Women</label>
                            <label style={radioContainerStyle}><input type="radio" name="gender" value="prefer-not" checked={formData.gender === 'prefer-not'} onChange={handleChange} style={{ width: '22px', height: '22px' }} /> Prefer not to say</label>
                        </div>
                    </div>

                    <div style={{ width: '2px', background: '#e2e8f0', margin: '0 10px' }}></div>

                    {/* STYLE INTERESTS */}
                    <div style={{ flex: '1.2', paddingLeft: '90px' }}>
                        <label style={{ ...labelStyle, fontSize: '24px' }}>Style Interests</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', marginTop: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={radioContainerStyle}><input type="checkbox" name="interest" value="men" checked={formData.interest.includes('men')} onChange={handleChange} style={{ width: '22px', height: '22px' }} /> Men</label>
                                <label style={radioContainerStyle}><input type="checkbox" name="interest" value="women" checked={formData.interest.includes('women')} onChange={handleChange} style={{ width: '22px', height: '22px' }} /> Women</label>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={radioContainerStyle}><input type="checkbox" name="interest" value="kids" checked={formData.interest.includes('kids')} onChange={handleChange} style={{ width: '22px', height: '22px' }} /> Kids</label>
                                <label style={radioContainerStyle}><input type="checkbox" name="interest" value="all" checked={formData.interest.includes('all')} onChange={handleChange} style={{ width: '22px', height: '22px' }} /> Everything</label>
                            </div>
                        </div>
                        <p style={{ fontSize: '16px', color: '#64748b', marginTop: '30px', fontWeight: 600 }}>* You can select up to 2 interests</p>
                    </div>
                </div>

                <button type="submit" style={{ width: '100%', padding: '25px', borderRadius: '22px', background: '#0d375b', color: '#fff', fontSize: '28px', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 15px 40px rgba(13, 55, 91, 0.25)' }}>
                  CREATE ACCOUNT
                </button>

                <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '20px', color: '#64748b', fontWeight: 600 }}>
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