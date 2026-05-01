import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const API_URL = "http://localhost:5000";

const CustomerProfile = () => {
    const navigate = useNavigate();

    // 🟢 UPDATED: Pulls real data from localStorage if it exists
    // 🟢 UPDATED: Pulls real data from role-specific storage
    const [profile, setProfile] = useState({
        name: "", 
        email: "",
        contact: "", 
        address: "",
        image: "/img/profile-picture.png",
        orders: 0, 
        likes: 0, 
        points: 0
    });

    useEffect(() => {
        const init = async () => {
            const { getUserInfo } = await import('../utils/auth');
            const parsed = getUserInfo('customer');
            if (parsed) {
                setProfile(prev => ({
                    ...prev,
                    name: parsed.name || "", 
                    email: parsed.email || "",
                    contact: parsed.contact || parsed.phone || "", 
                    address: parsed.address || "",
                    image: parsed.image || parsed.profileImage || "/img/profile-picture.png",
                    orders: parsed.orders || 0, 
                    likes: parsed.likes || 0, 
                    points: parsed.points || 0
                }));
            }
        };
        init();
    }, []);

    // 🟢 NEW: Fetch real stats from Backend & LocalStorage
    useEffect(() => {
        const fetchStats = async () => {
            const { getToken } = await import('../utils/auth');
            const token = getToken('customer');

            // 1. Fetch Orders count from Backend
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/api/orders/myorders`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const orders = await response.json();
                        setProfile(prev => ({ ...prev, orders: orders.length }));
                    }
                } catch (err) {
                    console.error("Error fetching order count:", err);
                }
            }

            // 2. Fetch Liked Designs count from LocalStorage
            const savedWishlist = localStorage.getItem('wishlist');
            if (savedWishlist) {
                const wishlistArray = JSON.parse(savedWishlist);
                setProfile(prev => ({ ...prev, likes: wishlistArray.length }));
            }
        };

        fetchStats();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProfile((prev: any) => ({ ...prev, image: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const { getUserInfo, setUserInfo } = await import('../utils/auth');
        const existingInfo = getUserInfo('customer') || {};
        
        // 🟢 Merging the new profile data into existing userInfo
        const updatedInfo = { ...existingInfo, ...profile };
        
        setUserInfo(updatedInfo);
        window.dispatchEvent(new Event('storage'));
        alert("Profile Updated Successfully!");
        navigate('/customer-dashboard'); 
    };

    return (
        <div style={rootContainer}>
            <div style={sidebarWrapper}>
                <Sidebar variant="customer" />
            </div>

            <div style={mainContentArea}>
                <header style={topBar}>
                    <div onClick={() => navigate(-1)} style={backBtn}>
                        <img src="/img/back.png" alt="Back" style={backIcon} />
                        <span>Back to Dashboard</span>
                    </div>
                </header>

                <div style={scrollBody}>
                    <div style={titleSection}>
                        <h1 style={mainHeading}>My Profile</h1>
                        <p style={subHeading}>Manage your personal information and preferences.</p>
                    </div>

                    <div style={mainGrid}>
                        <div style={formCard}>
                            <h2 style={cardTitle}>Personal Details</h2>
                            <div style={titleUnderline} />
                            
                            <form onSubmit={handleUpdate} style={formStack}>
                                <div style={inputGroup}>
                                    <label style={fieldLabel}>Full Name</label>
                                    <input 
                                        style={textInput} 
                                        value={profile.name} 
                                        onChange={(e)=>setProfile({...profile, name: e.target.value})} 
                                    />
                                </div>
                                <div style={inputGroup}>
                                    <label style={fieldLabel}>Email Address</label>
                                    <input 
                                        style={textInput} 
                                        value={profile.email} 
                                        onChange={(e)=>setProfile({...profile, email: e.target.value})}
                                    />
                                </div>
                                <div style={inputGroup}>
                                    <label style={fieldLabel}>Contact Number</label>
                                    <input 
                                        style={textInput} 
                                        value={profile.contact || ""}
                                        onChange={(e)=>setProfile({...profile, contact: e.target.value})}
                                    />
                                </div>
                                <div style={inputGroup}>
                                    <label style={fieldLabel}>Primary Address</label>
                                    <input 
                                        style={textInput} 
                                        value={profile.address || ""} 
                                        onChange={(e)=>setProfile({...profile, address: e.target.value})}
                                    />
                                </div>
                                <button type="submit" style={saveBtn}>UPDATE MY PROFILE</button>
                            </form>
                        </div>

                        <div style={sideStack}>
                            <div style={profileVisualCard}>
                                <div style={imageContainer}>
                                    <img src={profile.image} style={bigAvatar} alt="Profile" />
                                    <label style={cameraBadge}>
                                        <input 
                                            type="file" 
                                            hidden 
                                            accept="image/*"
                                            onChange={handleImageChange} 
                                        />
                                        <img src="/img/camera.png" style={{width: '24px'}} alt="Camera" />
                                    </label>
                                </div>
                                <h3 style={displayName}>{profile.name}</h3>
                                <p style={roleText}>BUYER</p>
                                <button 
                                    style={removePhotoBtn}
                                    onClick={() => setProfile({...profile, image: "/img/profile-picture.png"})}
                                >
                                    Remove Photo
                                </button>
                            </div>

                            <div style={pulseCard}>
                                <h3 style={pulseTitle}>Activity Pulse</h3>
                                <div style={pulseLine} />
                                <div style={pulseRow}><span>Orders Placed</span> <strong>{profile.orders}</strong></div>
                                <div style={pulseRow}><span>Designs Liked</span> <strong>{profile.likes}</strong></div>
                                <div style={pulseRow}><span>Points Earned</span> <strong>{profile.points}</strong></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- STYLES (Updated Font Sizes) ---
const rootContainer: React.CSSProperties = { display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#f8fafc' };
const sidebarWrapper: React.CSSProperties = { width: '200px', flexShrink: 0, height: '100vh' };
const mainContentArea: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' };
const topBar: React.CSSProperties = { background: '#0d375b', height: '70px', padding: '0 40px', display: 'flex', alignItems: 'center', flexShrink: 0, zIndex: 10 };
const backBtn: React.CSSProperties = { color: 'white', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 };
const backIcon: React.CSSProperties = { width: '18px', filter: 'invert(1)' };
const scrollBody: React.CSSProperties = { padding: '30px 40px', overflowY: 'auto', flex: 1 };
const titleSection: React.CSSProperties = { marginBottom: '30px' };
const mainHeading: React.CSSProperties = { fontFamily: '"Instrument Serif", serif', fontSize: '32px', color: '#0d375b', margin: 0, fontWeight: 600 };
const subHeading: React.CSSProperties = { color: '#64748b', fontSize: '14px', marginTop: '5px' };
const mainGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' };
const sideStack: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '24px' };
const formCard: React.CSSProperties = { background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(13, 55, 91, 0.05)', border: '1px solid #f1f5f9' };
const cardTitle: React.CSSProperties = { fontSize: '22px', fontWeight: 700, color: '#0d375b', margin: 0 };
const titleUnderline: React.CSSProperties = { height: '2px', background: '#e2e8f0', margin: '10px 0 24px 0' };
const formStack: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '18px' };
const inputGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const fieldLabel: React.CSSProperties = { fontWeight: 800, fontSize: '13px', color: '#1e293b' };
const textInput: React.CSSProperties = { padding: '10px 15px', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#fcfdfe', fontSize: '14px', outline: 'none', color: '#0d375b' };
const saveBtn: React.CSSProperties = { background: '#0d375b', color: 'white', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 900, fontSize: '15px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 6px 15px rgba(13, 55, 91, 0.2)' };
const profileVisualCard: React.CSSProperties = { background: 'white', padding: '24px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 30px rgba(13, 55, 91, 0.05)', border: '1px solid #f1f5f9' };
const imageContainer: React.CSSProperties = { position: 'relative', width: '120px', height: '120px', margin: '0 auto 15px' };
const bigAvatar: React.CSSProperties = { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f8fafc' };
const cameraBadge: React.CSSProperties = { position: 'absolute', bottom: '5px', right: '5px', background: 'white', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', cursor: 'pointer' };
const displayName: React.CSSProperties = { fontSize: '20px', fontWeight: 900, color: '#0d375b', margin: 0 };
const roleText: React.CSSProperties = { color: '#64748b', fontWeight: 800, fontSize: '12px', marginTop: '5px' };
const removePhotoBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#ef4444', fontWeight: 800, marginTop: '15px', cursor: 'pointer', fontSize: '13px' };
const pulseCard: React.CSSProperties = { background: '#0d375b', color: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(13, 55, 91, 0.1)' };
const pulseTitle: React.CSSProperties = { fontSize: '18px', fontWeight: 800, margin: 0 };
const pulseLine: React.CSSProperties = { height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0' };
const pulseRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', opacity: 0.9 };

export default CustomerProfile;