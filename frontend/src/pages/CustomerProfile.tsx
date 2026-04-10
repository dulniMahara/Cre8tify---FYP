import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const CustomerProfile = () => {
    const navigate = useNavigate();

    // 🟢 UPDATED: Pulls real data from localStorage if it exists
   const [profile, setProfile] = useState(() => {
        const savedData = localStorage.getItem('userInfo');
        const parsed = savedData ? JSON.parse(savedData) : null;
        
        return {
            // 🟢 If data exists, use it. If not, stay completely empty/blank.
            name: parsed?.name || "", 
            email: parsed?.email || "",
            contact: parsed?.contact || "", 
            address: parsed?.address || "",
            image: parsed?.image || "/img/profile-picture.png",
            orders: parsed?.orders || 0, 
            likes: parsed?.likes || 0, 
            points: parsed?.points || 0
        };
    });

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

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('userInfo', JSON.stringify(profile));
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
const sidebarWrapper: React.CSSProperties = { width: '320px', flexShrink: 0, height: '100vh' };
const mainContentArea: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' };
const topBar: React.CSSProperties = { background: '#0d375b', height: '160px', padding: '0 40px', display: 'flex', alignItems: 'center', flexShrink: 0, zIndex: 10 };
const backBtn: React.CSSProperties = { color: 'white', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '26px', fontWeight: 600 };
const backIcon: React.CSSProperties = { width: '28px', filter: 'invert(1)' };
const scrollBody: React.CSSProperties = { padding: '60px 80px', overflowY: 'auto', flex: 1 };
const titleSection: React.CSSProperties = { marginBottom: '50px' };
const mainHeading: React.CSSProperties = { fontFamily: '"Instrument Serif", serif', fontSize: '64px', color: '#0d375b', margin: 0, fontWeight: 600 };
const subHeading: React.CSSProperties = { color: '#64748b', fontSize: '22px', marginTop: '10px' };
const mainGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '50px' };
const sideStack: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '30px' };
const formCard: React.CSSProperties = { background: 'white', padding: '50px', borderRadius: '35px', boxShadow: '0 20px 50px rgba(13, 55, 91, 0.05)', border: '1px solid #f1f5f9' };
const cardTitle: React.CSSProperties = { fontSize: '36px', fontWeight: 700, color: '#0d375b', margin: 0 };
const titleUnderline: React.CSSProperties = { height: '2px', background: '#e2e8f0', margin: '20px 0 40px 0' };
const formStack: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '30px' };
const inputGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };
const fieldLabel: React.CSSProperties = { fontWeight: 800, fontSize: '18px', color: '#1e293b' };
const textInput: React.CSSProperties = { padding: '22px', borderRadius: '15px', border: '2px solid #e2e8f0', background: '#fcfdfe', fontSize: '20px', outline: 'none', color: '#0d375b' };
const saveBtn: React.CSSProperties = { background: '#0d375b', color: 'white', padding: '24px', borderRadius: '18px', border: 'none', fontWeight: 900, fontSize: '22px', cursor: 'pointer', marginTop: '20px', boxShadow: '0 10px 25px rgba(13, 55, 91, 0.2)' };
const profileVisualCard: React.CSSProperties = { background: 'white', padding: '50px', borderRadius: '35px', textAlign: 'center', boxShadow: '0 20px 50px rgba(13, 55, 91, 0.05)', border: '1px solid #f1f5f9' };
const imageContainer: React.CSSProperties = { position: 'relative', width: '180px', height: '180px', margin: '0 auto 25px' };
const bigAvatar: React.CSSProperties = { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '6px solid #f8fafc' };
const cameraBadge: React.CSSProperties = { position: 'absolute', bottom: '10px', right: '10px', background: 'white', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', cursor: 'pointer' };
const displayName: React.CSSProperties = { fontSize: '38px', fontWeight: 900, color: '#0d375b', margin: 0 };
const roleText: React.CSSProperties = { color: '#64748b', fontWeight: 800, fontSize: '18px', marginTop: '10px' };
const removePhotoBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#ef4444', fontWeight: 800, marginTop: '25px', cursor: 'pointer', fontSize: '16px' };
const pulseCard: React.CSSProperties = { background: '#0d375b', color: 'white', padding: '50px', borderRadius: '35px', boxShadow: '0 20px 50px rgba(13, 55, 91, 0.1)' };
const pulseTitle: React.CSSProperties = { fontSize: '28px', fontWeight: 800, margin: 0 };
const pulseLine: React.CSSProperties = { height: '1px', background: 'rgba(255,255,255,0.1)', margin: '20px 0' };
const pulseRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '20px', opacity: 0.9 };

export default CustomerProfile;