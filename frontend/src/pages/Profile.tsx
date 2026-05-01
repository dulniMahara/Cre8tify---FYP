import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import "../styles/signup.css"; 

const API_URL = "http://localhost:5000";

export default function Profile() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [userRole, setUserRole] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',    
        interest: '',   
        shopName: '',  
        portfolio: '',
        bio: '',        
        profileImage: '', 
    });

    useEffect(() => {
        const initProfile = async () => {
            window.scrollTo(0, 0);
            const { getUserInfo } = await import('../utils/auth');
            const storedUser = getUserInfo('designer'); // This page is for designers
            
            if (storedUser) {
                // 🟢 Force 'admin' to be treated as 'designer' for this page's layout if they are admin
                const role = storedUser.role === 'admin' ? 'designer' : (storedUser.role || 'buyer');
                setUserRole(role);
                
                setFormData({
                    name: storedUser.name || '',
                    email: storedUser.email || '',
                    phone: storedUser.phone || storedUser.contact || '', 
                    address: storedUser.address || '',
                    interest: storedUser.interest || '',
                    shopName: storedUser.shopName || '',
                    portfolio: storedUser.portfolio || '',
                    bio: storedUser.bio || storedUser.description || '',
                    profileImage: storedUser.profileImage || '', 
                });
            }
        };
        initProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('avatar', file); 

    // 1. Get the user data object
    const storedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    // 2. 🟢 THE FIX: Try to find the token in BOTH places
    const token = storedUser.token || localStorage.getItem('token'); 

    // 3. 🔍 DEBUG: Log this to see which one is missing
    console.log("userInfo object:", storedUser);
    console.log("Found Token:", token);

    if (!token) {
        alert("No security token found. Please log out and log back in to refresh your session.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/users/upload-avatar`, {
            method: 'POST',
            headers: {
                // This must send the token you just found
                'Authorization': `Bearer ${token}`, 
            },
            body: uploadData,
        });
        const data = await response.json();
            if (response.ok) {
                const updatedUser = { ...storedUser, profileImage: data.profileImage };
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('storage')); // 🟢 Trigger Header sync
                setFormData(prev => ({ ...prev, profileImage: data.profileImage }));
                alert("Image uploaded successfully! 📸");
            } else {
                // 🔴 This is where your "Token Failed" message is coming from
                alert(data.message || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Image upload failed");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const storedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = storedUser.token || localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData), 
            });

            const data = await response.json();

            if (response.ok) {
                const updatedUser = { ...storedUser, ...formData, profileImage: data.profileImage || formData.profileImage };
                localStorage.setItem('userInfo', JSON.stringify(updatedUser)); 
                window.dispatchEvent(new Event('storage')); // 🟢 Trigger Header sync
                alert("Profile Updated Successfully! ✨");
            
                if (userRole === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/designer-dashboard');
                }
            
        } else {
            alert(data.message || "Update failed");
        }
    } catch (error) {
        console.error("Update error:", error);
        alert("Connection error.");
    }
    };
    

    // 🟢 NEW: Remove Photo Function
    const handleRemovePhoto = async () => {
        if (!window.confirm("Are you sure you want to remove your profile photo?")) return;

        const storedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
        try {
            const response = await fetch(`${API_URL}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedUser.token}`,
                },
                body: JSON.stringify({ ...formData, profileImage: "" }), 
            });

            if (response.ok) {
                const updatedUser = { ...storedUser, profileImage: "" };
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('storage')); // 🟢 Trigger Header sync
                setFormData(prev => ({ ...prev, profileImage: "" }));
                alert("Photo removed! 🗑️");
            }
        } catch (error) {
            alert("Failed to remove photo.");
        }
    };

    return (
        <div className="dashboard-container">
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleImageChange}
                accept="image/*"
            />

            <Sidebar variant={userRole === 'buyer' ? 'customer' : 'designer'} />
            
            <div className="main-content">
                <header className="top-header" style={{ background: '#0d375b' }}>
                    <div className="header-left" onClick={() => navigate(-1)} style={{ cursor: 'pointer', color: 'white' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src="/img/back.png" alt="Back" style={{ width: '18px', filter: 'invert(1)', marginRight: '5px' }} />
                            Back to Dashboard
                        </span>
                    </div>
                </header>

                <div 
                    className="content-wrapper" 
                    style={{ 
                        padding: '24px',
                        background: '#f8fafc',
                        width: '100%',
                        boxSizing: 'border-box'
                    }}
                >
                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '32px', color: '#0d375b', margin: 0 }}>
                            My Profile
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Manage your personal information and preferences.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start',  flexWrap: 'wrap'  }}>
                        <div 
                            style={{ 
                                flex: '2 1 600px',   // 👈 responsive behavior
                                width: '100%',
                                maxWidth: '800px',
                                background: 'white', 
                                padding: '24px', 
                                borderRadius: '16px',
                                boxShadow: '0 10px 30px rgba(13, 55, 91, 0.08)' 
                            }}
                        >
                            <form onSubmit={handleUpdate}>
                                <h2 style={{ marginBottom: '20px', color: '#0d375b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '22px', fontWeight: '700' }}>
                                    Personal Details
                                </h2>
                                
                                <div className="form-grid-2-col">
                                    <div className="form-group">
                                        <label style={{ fontSize: '14px', fontWeight: '600' }}>Full Name</label>
                                        <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} style={{ height: '40px', fontSize: '14px' }} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '14px', fontWeight: '600' }}>Email Address</label>
                                        <input type="email" className="form-input" value={formData.email} disabled style={{ background: '#f1f5f9', cursor: 'not-allowed', height: '40px', fontSize: '14px' }} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label style={{ fontSize: '14px', fontWeight: '600' }}>Contact Number</label>
                                    <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} style={{ height: '40px', fontSize: '14px' }} />
                                </div>

                                {/* Designer Specific Fields (Always show on this page) */}
                                <div className="form-group">
                                    <label style={{ fontSize: '14px', fontWeight: '600' }}>Shop Name</label>
                                    <input type="text" name="shopName" className="form-input" value={formData.shopName} onChange={handleChange} style={{ height: '40px', fontSize: '14px' }} />
                                </div>
                                <div className="form-group">

                                    <label style={{ fontSize: '14px', fontWeight: '600' }}>Portfolio Link</label>
                                    <input 
                                        type="url" 
                                        name="portfolio" 
                                        className="form-input" 
                                        value={formData.portfolio} 
                                        onChange={handleChange} 
                                        placeholder="https://yourportfolio.com"
                                        style={{ height: '40px', fontSize: '14px' }} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '14px', fontWeight: '600' }}>About Me (Bio)</label>
                                    <textarea name="bio" className="form-input" rows={4} value={formData.bio} onChange={handleChange} style={{ resize: 'none', fontSize: '14px', padding: '12px' }} />
                                </div>

                                <button type="submit" className="btn-signup" style={{ marginTop: '20px', width: '100%', height: '48px', fontSize: '16px', borderRadius: '8px', fontWeight: 'bold' }}>
                                    UPDATE MY PROFILE
                                </button>
                            </form>
                        </div>

                        <div style={{ 
                            flex: '1 1 300px',   // 👈 responsive width
                            width: '100%',
                            maxWidth: '350px',
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '24px' 
                        }}>
                            <div style={{ background: 'white', padding: '32px 24px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 30px rgba(13, 55, 91, 0.05)' }}>
                                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
                                    
                                    <img 
                                        src={formData.profileImage 
                                            ? (formData.profileImage.startsWith('http') 
                                                ? formData.profileImage 
                                                : `${API_URL}${formData.profileImage.startsWith('/') ? '' : '/'}${formData.profileImage}`)
                                            : "/img/profile-picture.png"
                                        } 
                                        alt="User" 
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '6px solid #f1f5f9' }} 
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/img/profile-picture.png";
                                        }}
                                    />

                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ 
                                            position: 'absolute', bottom: '5px', right: '5px', 
                                            background: 'white', border: 'none', borderRadius: '50%', 
                                            padding: '12px', cursor: 'pointer',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        <img src="/img/search.png" style={{ width: '18px', filter: 'brightness(0) saturate(100%) invert(13%) sepia(35%)' }} alt="edit" />
                                    </button>
                                </div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#0d375b', fontSize: '18px' }}>{formData.name}</h3>
                                <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', marginBottom: '8px' }}>
                                    {userRole === 'admin' ? 'ADMIN' : 'DESIGNER'}
                                </p>
                                
                                {/* 🟢 REMOVE PHOTO BUTTON */}
                                {formData.profileImage && (
                                    <button 
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        style={{ 
                                            background: 'none', border: 'none', color: '#ef4444', 
                                            cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', 
                                            textDecoration: 'underline' 
                                        }}
                                    >
                                        Remove Photo
                                    </button>
                                )}
                            </div>

                            <div style={{ background: '#0d375b', padding: '32px 24px', borderRadius: '16px', color: 'white', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', opacity: 0.9, fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
                                    {userRole === 'designer' ? 'Sales Performance' : 'Activity Overview'}
                                </h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '16px' }}>
                                    <span>{userRole === 'designer' ? 'Published Designs' : 'Wishlist Items'}</span>
                                    <strong style={{ fontSize: '16px' }}>{userRole === 'designer' ? '08' : '12'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                                    <span>{userRole === 'designer' ? 'Total Sales' : 'Total Orders'}</span>
                                    <strong style={{ fontSize: '16px' }}>{userRole === 'designer' ? '24' : '04'}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
}