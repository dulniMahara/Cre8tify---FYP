import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/dashboard.css';

const API_URL = "http://localhost:5000";

interface DesignItem {
    id: string | number;
    title: string;
    price: number | string;
    image: string;
    sales: number;
    likes: number;
    status: string;
    description?: string;
}

const MyDesigns = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [allDesigns, setAllDesigns] = useState<DesignItem[]>([]);

    // 🟢 DYNAMIC USER STATES
    const [userName, setUserName] = useState("Artisa LK");
    const [navProfileImg, setNavProfileImg] = useState("/img/profile-picture.png");

    const fallbackDesigns: DesignItem[] = [
        { id: 1, title: 'Taste & See Minimal', price: 1200, image: '/img/shop1.png', sales: 6, likes: 56, status: 'Approved' },
        { id: 2, title: 'Abstract Line Art', price: 1450, image: '/img/shop2.png', sales: 12, likes: 32, status: 'Approved' },
        { id: 3, title: 'Vintage Oversized', price: 1350, image: '/img/shop3.png', sales: 24, likes: 89, status: 'Submitted' },
        { id: 4, title: 'Neon Genesis Print', price: 1600, image: '/img/shop4.png', sales: 8, likes: 45, status: 'Approved' },
    ];

    // 🟢 LOAD USER DESIGN DATA ON MOUNT
    useEffect(() => {
        const fetchMyDesigns = async () => {
            const storedUser = localStorage.getItem('userInfo');
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                setUserName(userObj.name || "Artisa LK");

                if (userObj.profileImage) {
                    const fullUrl = userObj.profileImage.startsWith('http')
                        ? userObj.profileImage
                        : `${API_URL}${userObj.profileImage.startsWith('/') ? '' : '/'}${userObj.profileImage}`;
                    setNavProfileImg(fullUrl);
                }

                // API LOGIC
                try {
                    const response = await fetch(`${API_URL}/api/products/my-designs`, {
                        headers: { 'Authorization': `Bearer ${userObj.token}` }
                    });
                    const data = await response.json();

                    const formattedDB = data.map((item: any) => ({
                        id: item._id,
                        title: item.title,
                        price: item.price,
                        image: item.mockupImages && item.mockupImages.length > 0 ? item.mockupImages[0] : '/img/placeholder.png',
                        status: item.status === 'Pending' ? 'Submitted' : item.status,
                        sales: item.salesCount || 0,
                        likes: item.likes || 0,
                        description: item.description ? item.description.replace(/<[^>]*>?/gm, '') : '',
                    }));

                    // 🟢 Only Approved and Submitted designs are shown
                    const filtered = formattedDB.filter((d: any) => d.status === 'Approved' || d.status === 'Submitted');

                    setAllDesigns(filtered.length > 0 ? filtered : fallbackDesigns);
                } catch (error) {
                    console.error("Failed to fetch designs", error);
                    setAllDesigns(fallbackDesigns);
                }
            } else {
                setAllDesigns(fallbackDesigns);
            }
        };

        fetchMyDesigns();
    }, []);

    // 🟢 SECURE LOGOUT
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('userInfo');
            sessionStorage.clear();
            navigate('/');
        }
    };

    const filteredDesigns = allDesigns.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));

    // 🟢 NAVIGATE DIRECTLY TO CUSTOMER OVERVIEW
    const handleNavigate = (item: DesignItem) => {
        navigate(`/product/${item.id}`, {
            state: {
                product: {
                    ...item,
                    img: item.image, // Product page anticipates 'img'
                    price: typeof item.price === 'string' && item.price.includes('LKR')
                        ? item.price
                        : `LKR ${Number(item.price).toLocaleString()}.00`
                },
                fromDesignerPreview: true
            }
        });
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <style>
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
                {`
                    @keyframes slideUpFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-load { animation: slideUpFade 0.5s ease-out forwards; }
                    .design-card { transition: all 0.3s ease; }
                    .design-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; }
                    .icon-btn { transition: transform 0.2s; cursor: pointer; opacity: 0.7; }
                    .icon-btn:hover { transform: scale(1.15); opacity: 1; }
                    .search-input::placeholder { color: white !important; opacity: 0.8; }
                `}
            </style>

            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)' }}>

                {/* HEADER */}
                <div className="top-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', height: '45px' }}>
                    <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: '24px', color: 'white', letterSpacing: '1px', fontStyle: 'italic', flex: 1 }}>
                        My Designs
                    </div>

                    <div className="search-bar" style={{
                        flex: 2, maxWidth: '250px', display: 'flex', alignItems: 'center',
                        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(3px)',
                        padding: '5px 10px', borderRadius: '15px', margin: '0 10px', border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <img src="/img/search.png" alt="Search" style={{ width: '10px', opacity: 0.8 }} />
                        <input
                            className="search-input"
                            type="text" placeholder="Search here" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', marginLeft: '5px', width: '100%', fontSize: '8px' }}
                        />
                    </div>

                    <div className="header-icons" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '15px', alignItems: 'center' }}>
                        {/* 🟢 PROFILE ICON */}
                        <img
                            src={navProfileImg}
                            alt="Profile"
                            className="nav-icon"
                            style={{
                                cursor: 'pointer', width: '23px', height: '23px',
                                borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.3)'
                            }}
                            onClick={() => navigate('/profile')}
                            onError={(e) => { (e.target as HTMLImageElement).src = "/img/profile-picture.png"; }}
                        />
                        <img src="/img/notifi.png" className="nav-icon" alt="Notif" style={{ width: '13px', height: '13px' }} />
                        <img
                            src="/img/logout.png"
                            className="nav-icon"
                            alt="Logout"
                            onClick={handleLogout}
                            style={{ width: '13px', height: '13px', cursor: 'pointer' }}
                        />
                    </div>
                </div>

                {/* CONTENT */}
                <div className="content-wrapper animate-load" style={{ padding: '20px', flex: 1, maxWidth: '700px', margin: '0 auto', width: '100%' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ fontSize: '8px', color: '#64748b', fontWeight: '500' }}>
                            Showing <span style={{ fontWeight: '700', color: '#0f172a' }}>{filteredDesigns.length}</span> Results
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '7px', color: '#64748b' }}>Sort by:</span>
                            <select style={{ padding: '4px 8px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', color: '#0f172a', fontWeight: '600', cursor: 'pointer', outline: 'none' }}>
                                <option>Newest First</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* PRODUCT GRID - UPDATED TO MATCH CUSTOMER COLLECTION */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                        {filteredDesigns.map((item) => (
                            <div key={item.id} className="product-card design-card" style={{ background: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', position: 'relative' }}>

                                {/* CLICKABLE IMAGE WRAPPER */}
                                <div
                                    onClick={() => handleNavigate(item)}
                                    style={{
                                        background: '#f8fafc',
                                        borderRadius: '9px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        marginBottom: '8px',
                                        height: '170px',
                                        alignItems: 'center',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        padding: '8px'
                                    }}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        style={{
                                            maxWidth: '85%',
                                            maxHeight: '85%',
                                            objectFit: 'contain',
                                            filter: 'drop-shadow(0 8px 13px rgba(0,0,0,0.08))'
                                        }}
                                    />
                                </div>

                                <div style={{ padding: '0 5px' }}>
                                    {/* Header: Brand & View Details */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '6px', fontStyle: 'italic', color: '#94a3b8', marginBottom: '1px' }}>{userName}</div>
                                            <h3
                                                onClick={() => handleNavigate(item)}
                                                style={{ fontSize: '13px', fontWeight: '800', margin: '0', color: '#1e293b', lineHeight: '1.2', cursor: 'pointer' }}
                                            >
                                                {item.title}
                                            </h3>
                                        </div>
                                        <span
                                            onClick={() => handleNavigate(item)}
                                            style={{ fontSize: '6px', color: '#64748b', fontStyle: 'italic', textDecoration: 'underline', cursor: 'pointer', marginLeft: '5px' }}
                                        >
                                            View Details
                                        </span>
                                    </div>

                                    {/* FOOTER: Price Left, Icons Right */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderTop: '1px solid #f1f5f9',
                                        paddingTop: '8px',
                                        marginTop: '6px'
                                    }}>
                                        {/* Formatted Price */}
                                        <div style={{ fontSize: '9px', fontWeight: '900', color: '#ef4444' }}>
                                            {typeof item.price === 'string' && item.price.includes('LKR') ? item.price : `LKR ${Number(item.price).toLocaleString()}.00`}
                                        </div>

                                        {/* Icons */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <img src="/img/heart.png" alt="Likes" style={{ width: '9px', opacity: 0.6 }} />
                                                <span style={{ fontSize: '6px', color: '#64748b', fontWeight: '700' }}>
                                                    {item.likes}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <img src="/img/cart.png" alt="Sales" style={{ width: '9px', opacity: 0.7 }} />
                                                <span style={{ fontSize: '6px', color: '#64748b', fontWeight: '700' }}>
                                                    {item.sales}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default MyDesigns;