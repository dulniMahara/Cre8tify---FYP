import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; 
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer'; 
import Header from '../components/Header';
import '../styles/dashboard.css';            

// 1. Static Product Data
const productsData = [
    { id: 1, title: 'Women Boxy T-shirt', price: 1350, sales: '02', likes: 12, img: '/img/shop1.png', tag: 'New' },
    { id: 2, title: 'Moon Child Tee', price: 1450, sales: '15', likes: 18, img: '/img/shop2.png', tag: 'Hot', scale: 1.0 },
    { id: 3, title: 'Retro Vibe Print', price: 1250, sales: '08', likes: 22, img: '/img/shop3.png', scale: 1.0 },
    { id: 4, title: 'Abstract Art Tee', price: 1600, sales: '05', likes: 18, img: '/img/shop4.png' },
    { id: 5, title: 'Minimalist Line', price: 1350, sales: '12', likes: 30, img: '/img/shop1.png' },
    { id: 6, title: 'Dark Soul Edition', price: 1550, sales: '09', likes: 27, img: '/img/shop2.png', scale: 1.0 },
    { id: 7, title: 'Urban Streetwear', price: 1400, sales: '20', likes: 56, img: '/img/shop3.png', tag: 'Sale', scale: 1.0 },
    { id: 8, title: 'Classic White', price: 1150, sales: '30', likes: 16, img: '/img/shop4.png' },
];

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState("Welcome");
    const [likedProducts, setLikedProducts] = useState<number[]>([]);

    // 🛡️ Cart Context Setup
    const cartContext = useCart();
    const addToCart = cartContext ? cartContext.addToCart : null;

    // 🚀 Handle Add to Cart (Increases quantityInCart)
    const handleAddToCart = (item: any) => {
        if (!item || !addToCart) return;

        const productWithDefaults = {
            id: item.id, 
            title: item.title,
            price: item.price,
            image: item.img,
            size: 'Choose Size', 
            color: 'Choose Color',
            quantity: 1, 
            selected: true,
            type: 'physical'
        };

        addToCart(productWithDefaults);
        alert(`${item.title} added! 🛒`);
    };

    // 💖 Toggle Like Logic
    const toggleLike = (id: any) => { 
        setLikedProducts((prev: any) => {
            const updated = prev.includes(id) 
                ? prev.filter((item: any) => item !== id) 
                : [...prev, id];
            
            // SAVE TO LOCAL STORAGE
            localStorage.setItem('wishlist', JSON.stringify(updated));
            return updated;
        });
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            setGreeting(`Welcome back, ${userObj.name || "Customer"}.`);
        }
    }, []);

    const getSmartScale = (imgName: string) => {
        return (imgName.includes('shop1.png') || imgName.includes('shop4.png')) ? 1.05 : 1.1;
    };

    return (
        <div className="dashboard-container">
            <Sidebar variant="customer" />
            <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <Header mode="search" />
                <div className="content-wrapper customer-content" style={{ overflowX: 'hidden', marginTop: '0px', paddingTop: '25px' }}>
                    
                    <div style={bannerStyle}>
                        <h1 style={greetingTextStyle}>{greeting}</h1>
                        <p style={{ fontSize: '11px', opacity: 0.9, letterSpacing: '1px', fontWeight: '300', margin: 0 }}>Wear Your Imagination.</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '45px', marginBottom: '35px' }}>
                        <CategoryCircle title="MEN" img="/img/men.png" scale="1.0" position="top" onClick={() => navigate('/men-collection')} />
                        <CategoryCircle title="WOMEN" img="/img/women.png" scale="1.3" position="center" onClick={() => navigate('/women-collection')} />
                        <CategoryCircle title="KIDS" img="/img/kids.png" scale="1.0" position="top"  onClick={() => navigate('/kids-collection')} />
                    </div>

                    <div style={newArrivalsStripe}>
                        <div style={zigzagStyle}></div>
                        <div style={stripeLabel}>New Arrivals</div>
                        <div style={zigzagStyle}></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                        {productsData.map((item) => {
                            // LIVE SYNC: Checks context for real-time quantity
                            const quantityInCart = cartContext?.cartItems?.find((c: any) => c.id === item.id)?.quantity || 0;

                            return (
                                <div key={item.id} className="product-card" style={cardStyle}>
                                    {item.tag && <div style={tagStyle}>{item.tag}</div>}
                                    <div style={imgWrapperStyle} onClick={() => navigate(`/product/${item.id}`, { state: { product: item } })}>
                                        <img src={item.img} alt={item.title} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', transform: `scale(${(item as any).scale || getSmartScale(item.img)})`, filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.12))' }} />
                                    </div>
                                    <div style={{ padding: '0 3px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                                            <h4 style={{ margin: '0', fontSize: '10px', fontWeight: '800', color: '#1e293b' }}>{item.title}</h4>
                                            <span style={detailsLink} onClick={() => navigate(`/product/${item.id}`, { state: { product: item } })}>View Details</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ color: '#ef4444', fontWeight: '800', fontSize: '10px' }}>LKR {item.price.toLocaleString()}</div>
                                                <div style={{ fontSize: '7px', color: '#94a3b8' }}>Sales {item.sales}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <div onClick={() => toggleLike(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                                                    <img src="/img/heart.png" style={{ width: '10px', filter: likedProducts.includes(item.id) ? 'invert(15%) sepia(95%) saturate(6932%) hue-rotate(358deg) brightness(95%) contrast(112%)' : 'none', opacity: likedProducts.includes(item.id) ? 1 : 0.7 }} alt="" />
                                                    <span style={{ fontSize: '7px', color: '#64748b', fontWeight: '600' }}>{likedProducts.includes(item.id) ? (item.likes + 1) : item.likes}</span>
                                                </div>
                                                <div onClick={() => handleAddToCart(item)} style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                                                    <img src="/img/cart.png" style={{ width: '10px', opacity: 0.7 }} alt="" />
                                                    <span style={{ fontSize: '7px', color: '#64748b', fontWeight: '600' }}>{quantityInCart}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', marginBottom: '20px' }}>
                        <button style={exploreBtn} onClick={() => navigate('/men-collection')}>Explore More ➜</button>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

// ==================== STYLES & SUB-COMPONENTS ====================

const CategoryCircle = ({ title, img, position = 'center', scale = '1', onClick }: any) => (
    <div onClick={onClick} style={{ textAlign: 'center', cursor: 'pointer' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', marginBottom: '12px', border: '2px solid white', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, transform: `scale(${scale})` }} />
        </div>
        <div style={{ fontWeight: '800', fontSize: '11px', letterSpacing: '1px', color: '#334155' }}>{title}</div>
    </div>
);

const bannerStyle: React.CSSProperties = { 
    background: 'linear-gradient(135deg, #0d375b 0%, #1e40af 100%)', 
    borderRadius: '12px', padding: '25px 35px', color: 'white', 
    marginBottom: '35px', display: 'flex', flexDirection: 'column', 
    boxShadow: '0 10px 20px rgba(13, 55, 91, 0.25)' 
};

const greetingTextStyle: React.CSSProperties = { 
    fontFamily: '"Instrument Serif", serif', fontSize: '30px', margin: '0 0 5px 0', fontStyle: 'italic', lineHeight: '1' 
};

const newArrivalsStripe: React.CSSProperties = { 
    display: 'flex', alignItems: 'center', marginBottom: '25px', marginLeft: '-20px', marginRight: '-20px', width: 'calc(100% + 40px)' 
};

const zigzagStyle: React.CSSProperties = { 
    height: '16px', flex: 1, background: 'repeating-linear-gradient(45deg, #0d375b 0, #0d375b 10px, transparent 10px, transparent 20px)' 
};

const stripeLabel: React.CSSProperties = { 
    background: '#0d375b', color: 'white', padding: '6px 30px', fontWeight: 'bold', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' 
};

const cardStyle: React.CSSProperties = { 
    background: 'white', padding: '10px', borderRadius: '13px', boxShadow: '0 6px 15px rgba(0,0,0,0.06)', position: 'relative'
};

const tagStyle: React.CSSProperties = { 
    position: 'absolute', top: '8px', right: '8px', background: '#0d375b', color: 'white', fontSize: '6px', fontWeight: '700', padding: '3px 6px', borderRadius: '6px', textTransform: 'uppercase', zIndex: 100 
};

const imgWrapperStyle: React.CSSProperties = { 
    height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '13px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer'
};

const detailsLink: React.CSSProperties = { 
    fontSize: '7px', color: '#64748b', fontStyle: 'italic', cursor: 'pointer', textDecoration: 'underline' 
};

const exploreBtn: React.CSSProperties = { 
    padding: '9px 30px', borderRadius: '25px', background: '#93c5fd', color: '#0f172a', border: 'none', fontWeight: '700', fontSize: '10px', cursor: 'pointer', boxShadow: '0 4px 13px rgba(147, 197, 253, 0.5)'
};

export default CustomerDashboard;