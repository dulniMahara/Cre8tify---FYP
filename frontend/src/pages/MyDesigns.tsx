import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/dashboard.css'; 

const API_URL = "http://localhost:5000";

interface DesignItem {
    id: number;
    title: string;
    price: number;
    image: string;
    sales: number;
    scale: number;
    description?: string;
}

const MyDesigns = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDesign, setSelectedDesign] = useState<DesignItem | null>(null);
    
    // 🟢 DYNAMIC USER STATES
    const [userName, setUserName] = useState("Designer");
    const [navProfileImg, setNavProfileImg] = useState("/img/profile-picture.png");

    // Interactive states for the modal
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState('#000000');

    // 🟢 LOAD USER DATA ON MOUNT
    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            setUserName(userObj.name || "Designer");

            if (userObj.profileImage) {
                const fullUrl = userObj.profileImage.startsWith('http') 
                    ? userObj.profileImage 
                    : `${API_URL}${userObj.profileImage.startsWith('/') ? '' : '/'}${userObj.profileImage}`;
                setNavProfileImg(fullUrl);
            }
        }
    }, []);

    // 🟢 SECURE LOGOUT
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('userInfo');
            sessionStorage.clear();
            navigate('/');
        }
    };

    const designs: DesignItem[] = [
        { 
            id: 1, title: 'Women Boxy T-shirt', price: 1350, image: '/img/shop1.png', sales: 2, scale: 1.3,
            description: "A minimal abstract representation of the Spider Lily flower, symbolizing memory and transformation. Perfect for casual streetwear."
        },
        { 
            id: 2, title: 'Dark Moon Phase', price: 1350, image: '/img/shop2.png', sales: 2, scale: 0.9,
            description: "Detailed lunar cycle illustration on a dark aesthetic background. High-quality print suitable for night outs."
        },
        { 
            id: 3, title: 'Evangelion Retro', price: 1350, image: '/img/shop3.png', sales: 2, scale: 1.0,
            description: "Retro anime style graphic featuring iconic mecha elements. A tribute to 90s classic animation."
        },
        { 
            id: 4, title: 'Wave Aesthetic', price: 1350, image: '/img/shop4.png', sales: 2, scale: 1.2,
            description: "Blue wave patterns inspired by Japanese woodblock prints. Calming and artistic."
        },
        { 
            id: 5, title: 'One Piece Blue', price: 1350, image: '/img/shop5.png', sales: 2, scale: 1.4,
            description: "Fan art concept for One Piece. Draft version."
        },
        { 
            id: 6, title: 'Glow Cross Tee', price: 1350, image: '/img/shop6.png', sales: 2, scale: 1.1,
            description: "Neon cross design with glow effects."
        },
    ];

    const filteredDesigns = designs.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const openModal = (design: DesignItem) => {
        setSelectedDesign(design);
        setSelectedSize('M'); 
        setSelectedColor('#000000');
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
                {`
                    @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-load { animation: slideUpFade 0.5s ease-out forwards; }
                    .design-card { transition: all 0.3s ease; cursor: pointer; }
                    .design-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important; }
                    .icon-btn { transition: transform 0.2s; cursor: pointer; opacity: 0.7; }
                    .icon-btn:hover { transform: scale(1.15); opacity: 1; }
                    .search-input::placeholder { color: white !important; opacity: 0.8; }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    .modal-scroll::-webkit-scrollbar { width: 6px; }
                    .modal-scroll::-webkit-scrollbar-track { background: #f1f1f1; }
                    .modal-scroll::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
                `}
            </style>

            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)' }}>
                
                {/* HEADER */}
                <div className="top-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', height: '90px' }}>
                    <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: '48px', color: 'white', letterSpacing: '1px', fontStyle: 'italic', flex: 1 }}>
                        My Designs
                    </div>

                    <div className="search-bar" style={{ 
                        flex: 2, maxWidth: '500px', display: 'flex', alignItems: 'center', 
                        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(5px)',
                        padding: '10px 20px', borderRadius: '30px', margin: '0 20px', border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <img src="/img/search.png" alt="Search" style={{ width: '20px', opacity: 0.8 }} />
                        <input 
                            className="search-input"
                            type="text" placeholder="Search here" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', marginLeft: '10px', width: '100%', fontSize: '16px' }} 
                        />
                    </div>

                    <div className="header-icons" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '30px', alignItems: 'center' }}>
                        {/* 🟢 UPDATED PROFILE ICON */}
                        <img 
                            src={navProfileImg} 
                            alt="Profile" 
                            className="nav-icon" 
                            style={{ 
                                cursor: 'pointer', width: '45px', height: '45px', 
                                borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' 
                            }} 
                            onClick={() => navigate('/profile')}
                            onError={(e) => { (e.target as HTMLImageElement).src = "/img/profile-picture.png"; }}
                        />
                        <img src="/img/notifi.png" className="nav-icon" alt="Notif" style={{ width: '25px', height: '25px' }} />
                        <img 
                            src="/img/logout.png" 
                            className="nav-icon" 
                            alt="Logout" 
                            onClick={handleLogout}
                            style={{ width: '25px', height: '25px', cursor: 'pointer' }} 
                        />
                    </div>
                </div>

                {/* CONTENT */}
                <div className="content-wrapper animate-load" style={{ padding: '40px', flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>
                            Showing <span style={{ fontWeight: '700', color: '#0f172a' }}>{filteredDesigns.length}</span> Results
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>Sort by:</span>
                            <select style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #cbd5e1', background: 'white', color: '#0f172a', fontWeight: '600', cursor: 'pointer', outline: 'none' }}>
                                <option>Newest First</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                        {filteredDesigns.map((design) => (
                            <div key={design.id} className="design-card" style={{ background: 'white', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <div style={{ height: '320px', background: '#f8fafc', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', overflow: 'hidden' }}>
                                    <img 
                                        src={design.image} 
                                        alt="T-shirt" 
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${design.scale})`, filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.08))' }} 
                                    />
                                </div>
                                <div style={{ padding: '0 5px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', fontFamily: '"Instrument Serif", serif', fontStyle: 'italic' }}>
                                            {design.title}
                                        </div>
                                        <div 
                                            onClick={() => openModal(design)}
                                            style={{ fontSize: '12px', fontStyle: 'italic', textDecoration: 'underline', color: '#64748b', cursor: 'pointer', marginTop: '4px' }}
                                        >
                                            View Details
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#ef4444', marginBottom: '15px', letterSpacing: '0.5px' }}>
                                        LKR {design.price}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                                            Sales: {design.sales.toString().padStart(2, '0')}
                                        </div>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <img src="/img/heart.png" alt="Like" className="icon-btn" style={{ width: '22px', height: '22px' }} />
                                            <img src="/img/cart.png" alt="Add to Cart" className="icon-btn" style={{ width: '22px', height: '22px' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <Footer />
            </div>

            {/* PRODUCT DETAIL MODAL */}
            {selectedDesign && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, animation: 'fadeIn 0.2s ease-out', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-scroll" style={{ background: 'white', width: '1100px', height: '85vh', borderRadius: '20px', overflowY: 'auto', display: 'flex', animation: 'scaleUp 0.3s ease-out', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <button onClick={() => setSelectedDesign(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: '1px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '50%', fontSize: '24px', cursor: 'pointer', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>&times;</button>
                        <div style={{ flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'sticky', top: 0 }}>
                            <img src={selectedDesign.image} alt={selectedDesign.title} style={{ width: '90%', maxHeight: '80%', objectFit: 'contain', transform: `scale(${selectedDesign.scale})`, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))' }} />
                        </div>
                        <div style={{ flex: 1, padding: '50px', background: 'white' }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Brand New Arrival</div>
                            <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '48px', fontStyle: 'italic', marginBottom: '10px', lineHeight: '1', color: '#0f172a' }}>{selectedDesign.title}</h1>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '30px' }}>LKR {selectedDesign.price.toLocaleString()}.00</div>
                            <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.7', marginBottom: '30px' }}>{selectedDesign.description}</p>
                            <div style={{ marginBottom: '25px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#1e293b' }}>Colors</div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    {['#000000', '#ffffff', '#1e293b', '#64748b', '#ef4444'].map((c) => (
                                        <div key={c} onClick={() => setSelectedColor(c)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: selectedColor === c ? '2px solid #0f172a' : '1px solid #e2e8f0', cursor: 'pointer', transform: selectedColor === c ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s' }}></div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#1e293b' }}>Sizes</div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                                        <div key={s} onClick={() => setSelectedSize(s)} style={{ width: '45px', height: '45px', border: selectedSize === s ? '2px solid #0f172a' : '1px solid #e2e8f0', background: selectedSize === s ? '#0f172a' : 'white', color: selectedSize === s ? 'white' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' }}>{s}</div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                                <button style={{ flex: 1, padding: '18px', background: 'white', color: '#0f172a', border: '2px solid #0f172a', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>Add to Cart</button>
                                <button style={{ flex: 1, padding: '18px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>Buy Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyDesigns;