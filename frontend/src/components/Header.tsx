import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    mode?: 'search' | 'title';
    title?: string;
    showCart?: boolean;
    showSearch?: boolean;
    onSearch?: (query: string) => void;
    userRole?: 'customer' | 'designer' | 'admin';
}

const Header: React.FC<HeaderProps> = ({ 
    mode = 'search', 
    title = "Cre8tify", 
    showCart = true, 
    showSearch = true,
    onSearch,
    userRole: propRole
}) => {
    const navigate = useNavigate();
    const API_URL = "http://localhost:5000";

    const [navProfileImg, setNavProfileImg] = useState("/img/profile-picture.png");
    const [userRole, setUserRole] = useState('buyer');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // 🟢 2. Sync Logic: Refresh the header when profile changes
    useEffect(() => {
        const handleSync = () => {
            const savedData = localStorage.getItem('userInfo');
            if (savedData) {
                const userObj = JSON.parse(savedData);
                
                const sessionRole = userObj.role || 'buyer';
                const effectiveRole = propRole || sessionRole;

                // Helper to handle image URL prefixing
                const getImageUrl = (img: string | undefined) => {
                    if (!img || img === "/img/profile-picture.png") return "/img/profile-picture.png";
                    if (img.startsWith('data:') || img.startsWith('http')) return img;
                    return `${API_URL}${img.startsWith('/') ? '' : '/'}${img}`;
                };

                // 🟢 Context-aware profile picture selection
                if (effectiveRole === 'designer' || effectiveRole === 'admin') {
                    setNavProfileImg(getImageUrl(userObj.profileImage));
                } else {
                    setNavProfileImg(getImageUrl(userObj.image || userObj.profileImage));
                }
                
                if (userObj.role) {
                    setUserRole(userObj.role);
                }
            }
        };

        // Run once on load
        handleSync();
        fetchNotifications();

        // 🟢 3. Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        // Listen for the 'storage' event triggered by CustomerProfile
        window.addEventListener('storage', handleSync);

        return () => {
            window.removeEventListener('storage', handleSync);
            clearInterval(interval);
        };
    }, []);

    const fetchNotifications = async () => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        try {
            const res = await fetch('http://localhost:5000/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.isRead).length);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const markAsRead = async () => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        try {
            await fetch('http://localhost:5000/api/notifications/read-all', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUnreadCount(0);
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark notifications as read", err);
        }
    };

    const toggleNotifications = () => {
        if (!showNotifications) {
            fetchNotifications(); // Refresh on open 🟢
            if (unreadCount > 0) {
                markAsRead();
            }
        }
        setShowNotifications(!showNotifications);
    };

    return (
        <header style={headerStyle}>
            {/* LEFT: BACK BUTTON */}
            <div onClick={() => navigate(-1)} style={backContainer}>
                <img src="/img/back.png" alt="Back" style={backIconStyle} />
                <span style={backTextStyle}>Back</span>
            </div>

            {/* CENTER: SEARCH OR TITLE */}
            <div style={centerSection}>
                {mode === 'search' && showSearch ? (
                    <div style={searchWrapper}>
                        <img src="/img/search.png" alt="Search" style={searchIconInside} />
                        <input 
                            type="text" 
                            className="search-bar" 
                            placeholder="Search our massive collection..." 
                            style={maxSearchInput} 
                            onChange={(e) => onSearch && onSearch(e.target.value)}
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
                    onClick={() => {
                        const savedData = localStorage.getItem('userInfo');
                        const sessionRole = savedData ? JSON.parse(savedData).role : 'buyer';
                        const effectiveRole = propRole || sessionRole;
                        
                        navigate(effectiveRole === 'designer' || effectiveRole === 'admin' ? '/designer-profile' : '/customer-profile');
                    }}
                    onError={(e) => { (e.target as HTMLImageElement).src = "/img/profile-picture.png"; }}
                />
                <div style={iconBadgeWrapper}>
                    <img 
                        src="/img/notifi.png" 
                        alt="Notif" 
                        style={utilityIcon} 
                        onClick={toggleNotifications}
                    />
                    {unreadCount > 0 && <span style={dotBadge} />}
                    
                    {/* 🟢 NOTIFICATION DROPDOWN */}
                    {showNotifications && (
                        <div style={notificationDropdown}>
                            <div style={notifHeader}>
                                <h4 style={{ margin: 0, fontSize: '14px' }}>Notifications</h4>
                                <button onClick={() => setShowNotifications(false)} style={closeBtn}>×</button>
                            </div>
                            <div style={notifBody}>
                                {notifications.length > 0 ? (
                                    notifications.map((n: any) => (
                                        <div key={n._id} style={notifItem}>
                                            <div style={notifTitle}>{n.title}</div>
                                            <div style={notifMsg}>{n.message}</div>
                                            <div style={notifTime}>{new Date(n.createdAt).toLocaleString()}</div>
                                            {(n.type === 'order_placed' || n.type === 'order_received' || n.type === 'status_update') && (
                                                <button 
                                                    style={viewNotifBtn}
                                                    onClick={() => {
                                                        setShowNotifications(false);
                                                        if (n.type === 'order_placed') {
                                                            navigate('/my-orders');
                                                        } else if (n.type === 'order_received') {
                                                            navigate('/my-sales');
                                                        } else if (n.type === 'status_update') {
                                                            navigate('/my-shop');
                                                        }
                                                    }}
                                                >
                                                    View Details
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                                        No new notifications
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {showCart && (
                    <img 
                        src="/img/shopping-cart.png" 
                        alt="Cart" 
                        style={{ ...utilityIcon, cursor: 'pointer' }} 
                        onClick={() => navigate('/cart')} 
                    />
                )}
                <img 
                    src="/img/logout.png" 
                    alt="Logout" 
                    style={utilityIcon} 
                    onClick={() => {
                        if (window.confirm("Are you sure you want to logout?")) {
                            localStorage.removeItem('userInfo');
                            localStorage.removeItem('token');
                            sessionStorage.clear();
                            navigate('/');
                        }
                    }} 
                />
            </div>
        </header>
    );
};

// --- STYLES (Keeping your requested Industrial "MAX" tweaks) ---
const headerStyle: React.CSSProperties = {
    background: '#0d375b',
    padding: '22px 3%', 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
    zIndex: 1000,
    marginBottom: '0px',
    position: 'relative' 
};

const backContainer: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
    minWidth: '50px'
};

const backIconStyle: React.CSSProperties = {
    width: '15px',
    filter: 'invert(1)' 
};

const backTextStyle: React.CSSProperties = {
    color: '#fff',
    fontWeight: 700,
    fontSize: '14px'
};

const centerSection: React.CSSProperties = {
    flex: 3, 
    display: 'flex',
    justifyContent: 'center',
    padding: '0 20px'
};

const searchWrapper: React.CSSProperties = {
    position: 'relative',
    width: '80%', 
    maxWidth: '450px' 
};

const searchIconInside: React.CSSProperties = {
    position: 'absolute',
    left: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '11px',
    filter: 'invert(0)',
    opacity: 0.8
};

const maxSearchInput: React.CSSProperties = {
    width: '100%',
    padding: '9px 15px 9px 33px',
    borderRadius: '40px', 
    border: 'none',
    fontSize: '9px',
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
    outline: 'none',
    fontWeight: 500
};

const pageTitleStyle: React.CSSProperties = {
    color: '#fff',
    fontSize: '17px',
    fontWeight: 900,
    margin: 0
};

const iconGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px', 
    alignItems: 'center',
    justifyContent: 'flex-end'
};

const profileIconStyle: React.CSSProperties = {
    width: '28px', // Increased to match your visual preference
    height: '28px',
    borderRadius: '50%',
    cursor: 'pointer',
    objectFit: 'cover',
    border: '1px solid rgba(255,255,255,0.3)'
};

const utilityIcon: React.CSSProperties = {
    width: '27px', 
    height: '27px',
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
    width: '6px',
    height: '6px',
    background: '#ff4757',
    borderRadius: '50%',
    border: '1px solid #0d375b',
    pointerEvents: 'none'
};

const notificationDropdown: React.CSSProperties = {
    position: 'absolute',
    top: '40px',
    right: '0px',
    width: '300px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    zIndex: 2000,
    overflow: 'hidden',
    border: '1px solid #e2e8f0'
};

const notifHeader: React.CSSProperties = {
    padding: '15px 20px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#0d375b'
};

const closeBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#64748b'
};

const notifBody: React.CSSProperties = {
    maxHeight: '400px',
    overflowY: 'auto'
};

const notifItem: React.CSSProperties = {
    padding: '15px 20px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'default'
};

const notifTitle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 800,
    color: '#0d375b',
    marginBottom: '4px'
};

const notifMsg: React.CSSProperties = {
    fontSize: '12px',
    color: '#475569',
    lineHeight: '1.4'
};

const notifTime: React.CSSProperties = {
    fontSize: '10px',
    color: '#94a3b8',
    marginTop: '6px'
};

const viewNotifBtn: React.CSSProperties = {
    marginTop: '10px',
    background: '#0d375b',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: '0.2s'
};

export default Header;