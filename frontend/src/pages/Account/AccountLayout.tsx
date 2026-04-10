import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerSettings from './CustomerSettings';
import DesignerSettings from './DesignerSettings';
import AdminSettings from './AdminSettings';

const AccountLayout = () => {
    const navigate = useNavigate();
    
    // 🟢 MOCK ROLE: Change this to 'designer' or 'admin' to test other views
    const [userRole] = useState<'buyer' | 'designer' | 'admin'>('buyer');
    const [activeTab, setActiveTab] = useState("Profile");

    // Dynamic Sidebar logic
    const menuItems = {
        buyer: ["Profile", "My Orders", "Favorites", "Security"],
        designer: ["Dashboard", "My Designs", "Earnings", "Profile", "Security"],
        admin: ["Overview", "Verify Designs", "User Management", "System Logs"]
    };

    return (
        <div style={pageWrapper}>
            {/* 🟢 BLURRED PATTERN BACKGROUND */}
            <div style={blurredBg} />

            <div style={uiLayer}>
                {/* 🔵 MAXIMIZED HEADER */}
                <header style={blueHeader}>
                    <div style={backArea} onClick={() => navigate(-1)}>
                        <img src="/img/back.png" alt="Back" style={backIcon} />
                        <span>Back</span>
                    </div>
                    <div style={headerIconGroup}>
                        <img src="/img/profile-picture.png" style={navIcon} alt="Profile" />
                        <img src="/img/notifi.png" style={navIcon} alt="Notif" />
                        <img src="/img/shopping-cart.png" style={navIcon} alt="Cart" />
                        <img src="/img/logout.png" style={navIcon} alt="Logout" />
                    </div>
                </header>

                <div style={mainContent}>
                    {/* 🟢 FLOATING SIDEBAR */}
                    <aside style={glassSidebar}>
                        <div style={profileSection}>
                            <div style={avatarWrapper}>
                                <img src="/img/profile-picture.png" style={largeAvatar} alt="User" />
                                <div style={onlineIndicator} />
                            </div>
                            <h3 style={profileName}>Dilara Perera</h3>
                            <p style={profileHandle}>@dilara_cre8</p>
                            <span style={roleTag}>{userRole.toUpperCase()}</span>
                        </div>

                        <nav style={navList}>
                            {menuItems[userRole].map((item) => (
                                <div 
                                    key={item} 
                                    style={{
                                        ...navItem, 
                                        background: activeTab === item ? 'rgba(13, 55, 91, 0.1)' : 'transparent',
                                        color: activeTab === item ? '#0d375b' : '#666',
                                        borderLeft: activeTab === item ? '5px solid #0d375b' : '5px solid transparent'
                                    }}
                                    onClick={() => setActiveTab(item)}
                                >
                                    {item}
                                </div>
                            ))}
                        </nav>
                    </aside>

                    {/* 🟢 MAIN SETTINGS DISPLAY */}
                    <section style={contentWindow}>
                        {userRole === 'buyer' && <CustomerSettings activeTab={activeTab} />}
                        {userRole === 'designer' && <DesignerSettings activeTab={activeTab} />}
                        {userRole === 'admin' && <AdminSettings activeTab={activeTab} />}
                    </section>
                </div>
            </div>
        </div>
    );
};

// --- PREMIUM STYLES ---
const pageWrapper: React.CSSProperties = { position: 'relative', minHeight: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' };
const blurredBg: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'url(/img/wavy-checkerboard.png)', backgroundSize: 'cover', filter: 'blur(25px)', transform: 'scale(1.1)', zIndex: 1 };
const uiLayer: React.CSSProperties = { position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', minHeight: '100vh' };

const blueHeader: React.CSSProperties = { background: '#0d375b', padding: '40px 8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
const backArea: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', color: '#fff', fontWeight: 800, fontSize: '20px' };
const backIcon: React.CSSProperties = { width: '22px', filter: 'brightness(0) invert(1)' };
const headerIconGroup: React.CSSProperties = { display: 'flex', gap: '25px' };
const navIcon: React.CSSProperties = { width: '38px', height: '38px', filter: 'brightness(0) invert(1)', borderRadius: '50%' };

const mainContent: React.CSSProperties = { display: 'flex', flex: 1, padding: '50px 8%', gap: '50px' };

const glassSidebar: React.CSSProperties = { width: '320px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '40px', padding: '40px 0', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', height: 'fit-content' };
const profileSection: React.CSSProperties = { textAlign: 'center', marginBottom: '40px', padding: '0 20px' };
const avatarWrapper: React.CSSProperties = { position: 'relative', width: '110px', height: '110px', margin: '0 auto 15px' };
const largeAvatar: React.CSSProperties = { width: '100%', height: '100%', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' };
const onlineIndicator: React.CSSProperties = { position: 'absolute', bottom: '5px', right: '5px', width: '20px', height: '20px', background: '#2ecc71', borderRadius: '50%', border: '3px solid #fff' };
const profileName: React.CSSProperties = { fontSize: '22px', fontWeight: 900, color: '#111', margin: 0 };
const profileHandle: React.CSSProperties = { color: '#888', marginBottom: '15px' };
const roleTag: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '6px 18px', borderRadius: '50px', fontSize: '12px', fontWeight: 800 };

const navList: React.CSSProperties = { display: 'flex', flexDirection: 'column' };
const navItem: React.CSSProperties = { padding: '20px 40px', cursor: 'pointer', fontSize: '18px', fontWeight: 700, transition: '0.3s all ease' };

const contentWindow: React.CSSProperties = { flex: 1 };

export default AccountLayout;