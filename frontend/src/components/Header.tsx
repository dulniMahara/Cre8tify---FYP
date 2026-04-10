import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    mode?: 'search' | 'title';
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ mode = 'search', title = "Cre8tify" }) => {
    const navigate = useNavigate();

    // 🟢 1. Dynamic Profile Image State
    const [navProfileImg, setNavProfileImg] = useState("/img/profile-picture.png");

    // 🟢 2. Sync Logic: Refresh the header when profile changes
    useEffect(() => {
        const handleSync = () => {
            const savedData = localStorage.getItem('userInfo');
            if (savedData) {
                const userObj = JSON.parse(savedData);
                if (userObj.image) {
                    setNavProfileImg(userObj.image);
                }
            }
        };

        // Run once on load
        handleSync();

        // Listen for the 'storage' event triggered by CustomerProfile
        window.addEventListener('storage', handleSync);

        return () => window.removeEventListener('storage', handleSync);
    }, []);

    return (
        <header style={headerStyle}>
            {/* LEFT: BACK BUTTON */}
            <div onClick={() => navigate(-1)} style={backContainer}>
                <img src="/img/back.png" alt="Back" style={backIconStyle} />
                <span style={backTextStyle}>Back</span>
            </div>

            {/* CENTER: SEARCH OR TITLE */}
            <div style={centerSection}>
                {mode === 'search' ? (
                    <div style={searchWrapper}>
                        <img src="/img/search.png" alt="Search" style={searchIconInside} />
                        <input 
                            type="text" 
                            className="search-bar" 
                            placeholder="Search our massive collection..." 
                            style={maxSearchInput} 
                        />
                    </div>
                ) : (
                    <h2 style={pageTitleStyle}>{title}</h2>
                )}
            </div>

            {/* RIGHT: ICONS */}
            <div style={iconGroupStyle}>
                <img 
                    src={navProfileImg} 
                    alt="Profile" 
                    style={profileIconStyle} 
                    onClick={() => navigate('/customer-profile')} 
                />
                <div style={iconBadgeWrapper}>
                    <img src="/img/notifi.png" alt="Notif" style={utilityIcon} />
                    <span style={dotBadge} />
                </div>
                <img 
                    src="/img/shopping-cart.png" 
                    alt="Cart" 
                    style={{ ...utilityIcon, cursor: 'pointer' }} 
                    onClick={() => navigate('/cart')} 
                />
                <img 
                    src="/img/logout.png" 
                    alt="Logout" 
                    style={utilityIcon} 
                    onClick={() => navigate('/')} 
                />
            </div>
        </header>
    );
};

// --- STYLES (Keeping your requested Industrial "MAX" tweaks) ---
const headerStyle: React.CSSProperties = {
    background: '#0d375b',
    padding: '45px 3%', 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
    zIndex: 1000,
    marginBottom: '-140px',
    position: 'relative' 
};

const backContainer: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    minWidth: '100px'
};

const backIconStyle: React.CSSProperties = {
    width: '25px',
    filter: 'invert(1)' 
};

const backTextStyle: React.CSSProperties = {
    color: '#fff',
    fontWeight: 700,
    fontSize: '22px' // Kept your size
};

const centerSection: React.CSSProperties = {
    flex: 3, 
    display: 'flex',
    justifyContent: 'center',
    padding: '0 40px'
};

const searchWrapper: React.CSSProperties = {
    position: 'relative',
    width: '80%', 
    maxWidth: '1100px' 
};

const searchIconInside: React.CSSProperties = {
    position: 'absolute',
    left: '25px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '22px',
    filter: 'invert(0)',
    opacity: 0.8
};

const maxSearchInput: React.CSSProperties = {
    width: '100%',
    padding: '18px 30px 18px 65px',
    borderRadius: '80px', 
    border: 'none',
    fontSize: '18px',
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
    outline: 'none',
    fontWeight: 500
};

const pageTitleStyle: React.CSSProperties = {
    color: '#fff',
    fontSize: '34px',
    fontWeight: 900,
    margin: 0
};

const iconGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '40px', 
    alignItems: 'center',
    justifyContent: 'flex-end'
};

const profileIconStyle: React.CSSProperties = {
    width: '55px', // Increased to match your visual preference
    height: '55px',
    borderRadius: '50%',
    cursor: 'pointer',
    objectFit: 'cover',
    border: '2px solid rgba(255,255,255,0.3)'
};

const utilityIcon: React.CSSProperties = {
    width: '45px', 
    height: '45px',
    filter: 'invert(0)', 
    cursor: 'pointer'
};

const iconBadgeWrapper: React.CSSProperties = {
    position: 'relative'
};

const dotBadge: React.CSSProperties = {
    position: 'absolute',
    top: '0px',
    right: '0px',
    width: '12px',
    height: '12px',
    background: '#ff4757',
    borderRadius: '50%',
    border: '2px solid #0d375b'
};

export default Header;