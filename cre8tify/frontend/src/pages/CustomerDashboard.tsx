import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; 
import Footer from '../components/Footer'; 
import Header from '../components/Header'; // 🟢 Importing the Smart Header
import '../styles/dashboard.css';            

const CustomerDashboard = () => {
    const navigate = useNavigate();
    
    // --- 1. DYNAMIC STATE FOR GREETING ---
    const [greeting, setGreeting] = useState("Welcome");

    // --- 2. EFFECT TO HANDLE PERSONALIZATION & SYNC ---
    useEffect(() => {
        const handleSync = () => {
            const storedUser = localStorage.getItem('userInfo');
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                const name = userObj.name || "Customer";
                
                // Handle Greeting Logic based on user's name
                const createdAt = new Date(userObj.createdAt || Date.now()).getTime();
                const currentTime = new Date().getTime();
                const isBrandNew = (currentTime - createdAt) < 120000;

                if (isBrandNew) {
                    setGreeting(`Welcome, ${name}.`);
                } else {
                    setGreeting(`Welcome back, ${name}.`);
                }
            }
        };

        handleSync();
        // 🟢 Listen for changes from the Profile Page update
        window.addEventListener('storage', handleSync);
        return () => window.removeEventListener('storage', handleSync);
    }, []);

    const products = [
        { id: 1, title: 'Women Boxy T-shirt', price: 'LKR 1350', sales: '02', img: '/img/shop1.png', tag: 'New', customScale: '1.4'},
        { id: 2, title: 'Moon Child Tee', price: 'LKR 1450', sales: '15', img: '/img/shop2.png', tag: 'Hot', customScale: '1.0'},
        { id: 3, title: 'Retro Vibe Print', price: 'LKR 1250', sales: '08', img: '/img/shop3.png', customScale: '1.1' },
        { id: 4, title: 'Abstract Art Tee', price: 'LKR 1600', sales: '05', img: '/img/shop4.png', customScale: '1.3' },
        { id: 5, title: 'Minimalist Line', price: 'LKR 1350', sales: '12', img: '/img/shop1.png', customScale: '1.4' },
        { id: 6, title: 'Dark Soul Edition', price: 'LKR 1550', sales: '09', img: '/img/shop2.png', customScale: '1.0' },
        { id: 7, title: 'Urban Streetwear', price: 'LKR 1400', sales: '20', img: '/img/shop3.png', tag: 'Sale' , customScale: '1.1'},
        { id: 8, title: 'Classic White', price: 'LKR 1150', sales: '30', img: '/img/shop4.png' , customScale: '1.3'},
    ];

    return (
        <div className="dashboard-container">
            <Sidebar variant="customer" />

            <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* 🟢 REPLACED MANUAL HEADER WITH SMART HEADER 
                    This handles the navProfileImg sync automatically now. */}
                <Header mode="search" />

                {/* --- CONTENT AREA --- */}
                {/* Added 140px margin to clear the Industrial Header overlap */}
                <div className="content-wrapper" style={{ padding: '40px', overflowX: 'hidden', marginTop: '140px' }}>
                    
                    {/* GREETING BANNER */}
                    <div style={bannerStyle}>
                        <h1 style={greetingTextStyle}>
                            {greeting}
                        </h1>
                        <p style={{ fontSize: '22px', opacity: 0.9, letterSpacing: '1px', fontWeight: '300', margin: 0 }}>
                            Wear Your Imagination.
                        </p>
                    </div>

                    {/* CATEGORY CIRCLES */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '100px', marginBottom: '90px' }}>
                        <CategoryCircle title="MEN" img="/img/men.png" position="top" onClick={() => navigate('/men-collection')} />
                        <CategoryCircle title="WOMEN" img="/img/women.png" position="top 20%" scale="1.15" onClick={() => navigate('/women-collection')} />
                        <CategoryCircle title="KIDS" img="/img/kids.png" position="top" onClick={() => navigate('/kids-collection')} />
                    </div>

                    {/* NEW ARRIVALS STRIPE */}
                    <div style={newArrivalsStripe}>
                        <div style={zigzagStyle}></div>
                        <div style={stripeLabel}>New Arrivals</div>
                        <div style={zigzagStyle}></div>
                    </div>

                    {/* PRODUCT GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' }}>
                        {products.map((item, index) => (
                            <div key={index} className="product-card" style={cardStyle}>
                                {item.tag && <div style={tagStyle}>{item.tag}</div>}

                                <div style={imgWrapperStyle}>
                                    <img 
                                        src={item.img} 
                                        alt={item.title} 
                                        style={{ 
                                            maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', 
                                            transform: `scale(${item.customScale || 1})`,
                                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.12))'
                                        }} 
                                    />
                                </div>
                                
                                <div style={{ padding: '0 5px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{item.title}</h4>
                                        <span onClick={() => navigate(`/product/${item.id}`)} style={detailsLink}>
                                            View Details
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ color: '#ef4444', fontWeight: '800', fontSize: '20px' }}>{item.price}</div>
                                            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Sales {item.sales}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <img src="/img/heart.png" alt="Like" style={{ width: '24px', opacity: 0.7 }} />
                                            <img src="/img/cart.png" alt="Add" style={{ width: '24px', opacity: 0.7 }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* EXPLORE MORE BUTTON */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', marginBottom: '50px' }}>
                        <button style={exploreBtn} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            Explore More ➜
                        </button>
                    </div>

                </div>
                <Footer />
            </div>
        </div>
    );
};

// --- STYLES (Preserving your specific design tweaks) ---
const bannerStyle: React.CSSProperties = { 
    background: 'linear-gradient(135deg, #0d375b 0%, #1e40af 100%)', 
    borderRadius: '30px', padding: '50px 60px', color: 'white', 
    marginBottom: '80px', display: 'flex', flexDirection: 'column', 
    boxShadow: '0 20px 40px rgba(13, 55, 91, 0.25)' 
};

const greetingTextStyle: React.CSSProperties = { 
    fontFamily: '"Instrument Serif", serif', fontSize: '64px', 
    margin: '0 0 10px 0', fontStyle: 'italic', lineHeight: '1' 
};

const newArrivalsStripe: React.CSSProperties = { 
    display: 'flex', alignItems: 'center', marginBottom: '70px', 
    marginLeft: '-40px', marginRight: '-40px', width: 'calc(100% + 80px)' 
};

const zigzagStyle: React.CSSProperties = { 
    height: '32px', flex: 1, 
    background: 'repeating-linear-gradient(45deg, #0d375b 0, #0d375b 20px, transparent 20px, transparent 40px)' 
};

const stripeLabel: React.CSSProperties = { 
    background: '#0d375b', color: 'white', padding: '12px 60px', 
    fontWeight: 'bold', fontSize: '24px', letterSpacing: '4px', textTransform: 'uppercase' 
};

const cardStyle: React.CSSProperties = { 
    background: 'white', padding: '20px', borderRadius: '25px', 
    boxShadow: '0 12px 30px rgba(0,0,0,0.06)', position: 'relative', 
    cursor: 'pointer', width: '100%' 
};

const tagStyle: React.CSSProperties = { 
    position: 'absolute', top: '15px', right: '15px', background: '#0d375b', 
    color: 'white', fontSize: '11px', fontWeight: '700', padding: '6px 12px', 
    borderRadius: '12px', textTransform: 'uppercase', zIndex: 100 
};

const imgWrapperStyle: React.CSSProperties = { 
    height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
    marginBottom: '25px', background: '#f1f5f9', borderRadius: '20px', 
    position: 'relative', overflow: 'hidden' 
};

const detailsLink: React.CSSProperties = { 
    fontSize: '13px', color: '#64748b', fontStyle: 'italic', 
    cursor: 'pointer', textDecoration: 'underline' 
};

const exploreBtn: React.CSSProperties = { 
    padding: '18px 60px', borderRadius: '50px', background: '#93c5fd', 
    color: '#0f172a', border: 'none', fontWeight: '700', fontSize: '20px', 
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', 
    boxShadow: '0 8px 25px rgba(147, 197, 253, 0.5)', transition: 'transform 0.2s' 
};

const CategoryCircle = ({ title, img, position = 'center', scale = '1', onClick }: any) => (
    <div
        onClick={onClick}
        style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
        onMouseOver={(e) => e.currentTarget.style.transform='scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform='scale(1)'}
    >
        <div style={{ 
            width: '220px', height: '220px', borderRadius: '50%', overflow: 'hidden', 
            marginBottom: '25px', border: '6px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, transform: `scale(${scale})` }} />
        </div>
        <div style={{ fontWeight: '800', fontSize: '22px', letterSpacing: '1px', color: '#334155' }}>{title}</div>
    </div>
);

export default CustomerDashboard;