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
        // 🟢 THE CHANGE: Save the user data immediately (Auto-Login)
        localStorage.setItem('userInfo', JSON.stringify(data));
        
        alert("✅ Registration Successful! Welcome to Cre8tify!");
        
        // 🟢 Redirect straight to the Designer Dashboard
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
    border: '2px solid #475569', 
    background: '#f8fafc', 
    borderRadius: '16px',
    padding: '20px', 
    fontSize: '22px', 
    width: '100%',
    outline: 'none',
    color: '#0d375b', 
    fontWeight: '600',
    transition: 'border-color 0.2s'
  };

  const eyeIconStyle: React.CSSProperties = {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#000000',
    display: 'flex',
    alignItems: 'center'
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-logo { animation: fadeInScale 0.8s ease-out forwards; }
        .animate-text { opacity: 0; animation: fadeInUp 0.8s ease-out 0.3s forwards; }
        .animate-list { opacity: 0; animation: fadeInUp 0.8s ease-out 0.6s forwards; }
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
            padding: '40px', 
            background: '#fcfcfc',
            overflowX: 'auto',
            minWidth: '0'
        }}>
          <div className="blue-card-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div className="white-form-card" style={{ 
                width: '1000px', 
                minWidth: '1000px',
                padding: '40px 40px', 
                borderRadius: '40px',
                background: '#fff',
                margin:'auto',
                boxShadow: '0 25px 70px rgba(0,0,0,0.07)'
            }}>

              <h2 className="form-title" style={{ fontSize: '42px', marginBottom: '40px', textAlign: 'center', fontWeight: '900', color: '#0d375b' }}>
                  DESIGNER APPLICATION
              </h2>
              
              <form onSubmit={handleSignup} autoComplete="off">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                    <div className="form-group">
                      <label style={{ fontWeight: '800', fontSize: '22px', color: '#0d375b', marginBottom: '10px', display: 'block' }}>Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} style={fillingBarStyle} required autoComplete="off" />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: '800', fontSize: '22px', color: '#0d375b', marginBottom: '10px', display: 'block' }}>Username</label>
                      <input type="text" name="username" value={formData.username} onChange={handleChange} style={fillingBarStyle} required autoComplete="off" />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: '800', fontSize: '22px', color: '#0d375b', marginBottom: '10px', display: 'block' }}>Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} style={fillingBarStyle} required />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: '800', fontSize: '22px', color: '#0d375b', marginBottom: '10px', display: 'block' }}>Contact Number</label>
                      <input type="text" name="contact" value={formData.contact} onChange={handleChange} style={fillingBarStyle} />
                    </div>

                    <div className="form-group">
                      <label style={{ fontWeight: '800', fontSize: '22px', color: '#0d375b', marginBottom: '10px', display: 'block' }}>Password</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} style={fillingBarStyle} required autoComplete="new-password" />
                        <div style={eyeIconStyle} onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label style={{ fontWeight: '800', fontSize: '22px', color: '#0d375b', marginBottom: '10px', display: 'block' }}>Confirm Password</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={fillingBarStyle} required />
                        <div style={eyeIconStyle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label style={{ fontWeight: '800', fontSize: '22px', color: '#0d375b', marginBottom: '10px', display: 'block' }}>Shop Name</label>
                      <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} style={fillingBarStyle} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: '800', fontSize: '22px', color: '#0d375b', marginBottom: '10px', display: 'block' }}>Portfolio Link</label>
                      <input type="text" name="portfolio" value={formData.portfolio} onChange={handleChange} style={fillingBarStyle} />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '35px' }}>
                  <label style={{ fontWeight: '800', fontSize: '22px', color: '#0d375b', marginBottom: '10px', display: 'block' }}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...fillingBarStyle, minHeight: '160px', resize: 'vertical' }}></textarea>
                </div>

                <div className="checkbox-group" style={{ marginBottom: '35px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" id="terms" required style={{ width: '20px', height: '20px' }} />
                  <label htmlFor="terms" style={{ margin: 0, fontWeight: 600, fontSize: '22px', color: '#64748b' }}>
                    I agree to the Terms & Conditions
                  </label>
                </div>

                <button type="submit" className="btn-signup" style={{ 
                    width: '100%', padding: '22px', fontSize: '24px', fontWeight: '900', borderRadius: '20px', backgroundColor: '#0d375b', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 15px 35px rgba(13, 55, 91, 0.3)'
                }}>
                  SIGN UP
                </button>
              </form>

              <div className="login-redirect" style={{ marginTop: '30px', textAlign: 'center', fontSize: '18px' }}>
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