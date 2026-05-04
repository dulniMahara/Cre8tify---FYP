import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MockupPreview from '../components/MockupPreview';
import { useCart } from '../context/CartContext';

// Import your product data to cross-reference the IDs
import { originalProducts as menProducts } from './MenCollection';
import { originalProducts as womenProducts } from './WomenCollection';
import { originalProducts as kidsProducts } from './KidsCollection';

const Favorites: React.FC = () => {
    const navigate = useNavigate();
    const [likedIds, setLikedIds] = useState<(number | string)[]>([]);
    const [dbProducts, setDbProducts] = useState<any[]>([]);
    
    const cartContext = useCart();
    const addToCart = cartContext ? cartContext.addToCart : null;

    // 1. Load likes from LocalStorage on mount
    useEffect(() => {
        const savedLikes = localStorage.getItem('wishlist');
        if (savedLikes) {
            setLikedIds(JSON.parse(savedLikes));
        }

        const fetchDbProducts = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/products');
                const data = await res.json();
                
                const mapped = data.map((p: any) => ({
                    ...p,
                    id: p._id,
                    img: (p.mockupImages && p.mockupImages.length > 0) 
                        ? (p.mockupImages[0].startsWith('/uploads') ? `http://localhost:5000${p.mockupImages[0]}` : p.mockupImages[0]) 
                        : (p.displayImage || '/img/placeholder.png'),
                    isDesignerProduct: true
                }));
                
                setDbProducts(mapped);
            } catch (err) {
                console.error("Error fetching favorites products:", err);
            }
        };
        fetchDbProducts();
    }, []);

    // 2. Combine all products and find the matches
    const allProducts = [...menProducts, ...womenProducts, ...kidsProducts, ...dbProducts];
    const favoriteProducts = allProducts.filter(p => likedIds.includes(p.id));

    const removeFavorite = (id: number | string) => {
        const updated = likedIds.filter(favId => favId !== id);
        setLikedIds(updated);
        localStorage.setItem('wishlist', JSON.stringify(updated));
    };

    const handleAddToCart = (item: any) => {
        if (!addToCart) return;
        addToCart({
            ...item,
            image: item.img,
            quantity: 1,
            size: 'M', // Default size for wishlist items
            selected: true
        });
        alert(`${item.title} added to cart! 🛒`);
    };
    return (
        <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', background: 'white' }}>
            <Sidebar variant="customer" />
            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header mode="title" title="MY FAVORITES" />
                
                <div className="content-wrapper" style={contentWrapperStyle}>
                    {/* Favorites Content Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                        <div>
                            <p style={subtitleStyle}>Designs you have saved for later.</p>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#0d375b', background: '#f0f9ff', padding: '4px 12px', borderRadius: '15px' }}>
                                    {favoriteProducts.length} Items Saved
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Sort by:</span>
                            <select style={{ 
                                padding: '8px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', 
                                fontSize: '12px', fontWeight: '600', color: '#0d375b', outline: 'none', cursor: 'pointer' 
                            }}>
                                <option>Recently Liked</option>
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>Price: Low to High</option>
                            </select>
                        </div>
                    </div>

                    {favoriteProducts.length > 0 ? (
                        <div style={gridStyle}>
                            {favoriteProducts.map((item) => (
                                <div key={item.id} className="product-card" style={favCardStyle}>
   
                                    <div style={imgBoxStyle} onClick={() => navigate(`/product/${item.id}`)}>
                                        {item.isDesignerProduct ? (
                                            <MockupPreview 
                                                mockupSrc="/img/womenfront-mockup.png"
                                                maskSrc="/img/womenfront-mockup.png"
                                                tshirtColor={item.tshirtColor || '#ffffff'}
                                                printArea={item.frontPrintArea || { top: '56%', left: '49%', width: '30%', height: '27%', rotation: 0 }}
                                                designSrc={item.frontDesign}
                                                canvasState={item.canvasState}
                                                overallScale={1.5}
                                                designScale={item.frontDesignScale || 1.0}
                                            />
                                        ) : (
                                            <img 
                                                src={item.img} 
                                                alt={item.title} 
                                                style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.1))' }} 
                                            />
                                        )}
                                    </div>
                                    
                                    <div style={{ padding: '15px' }}>
                                        <h3 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 5px 0', color: '#1e293b' }}>{item.title}</h3>
                                        <div style={{ color: '#ef4444', fontWeight: '900', fontSize: '12px', marginBottom: '15px' }}>
                                            LKR {item.price.toLocaleString()}.00
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => handleAddToCart(item)}
                                                style={cartBtnStyle}
                                            >
                                                Add to Cart
                                            </button>
                                            <button 
                                                onClick={() => removeFavorite(item.id)}
                                                style={removeBtnStyle}
                                                title="Remove"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* CENTERED EMPTY STATE WITH ANIMATION */
                        <div style={emptyStateContainer}>
                            <div className="animated-heart" style={heartIconStyle}>💔</div>
                            <p style={emptyTextStyle}>Your wishlist is currently empty.</p>
                            <button onClick={() => navigate('/customer-dashboard')} style={shopNowBtn}>
                                Discover Designs
                            </button>
                        </div>
                    )}
                </div>
                <Footer />
            </div>

            {/* CSS FOR HEART ANIMATION */}
            <style>{`
                @keyframes heartBreak {
                    0% { transform: scale(1); }
                    25% { transform: scale(1.1); }
                    50% { transform: scale(1); }
                    75% { transform: scale(1.1) rotate(5deg); }
                    100% { transform: scale(1); }
                }
                .animated-heart {
                    animation: heartBreak 2s infinite ease-in-out;
                    display: inline-block;
                }
                /* Adjusted padding-top to bring the title UP */
                .content-wrapper {
                    margin-top: 0 !important;
                    padding-top: 40px !important;  /* Balanced spacing */
                }
            `}</style>
        </div>
    );
};

// --- UPDATED STYLE CONSTANTS ---

const contentWrapperStyle: React.CSSProperties = {
    padding: '0 40px 40px 40px',
    background: 'white', // Pure white screen as requested
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
};

const subtitleStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '5px'
};

const emptyStateContainer: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '-60px' // Centers it visually within the remaining white space
};

const heartIconStyle: React.CSSProperties = {
    fontSize: '60px',
    marginBottom: '20px',
    cursor: 'default'
};

const emptyTextStyle: React.CSSProperties = {
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '25px'
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginTop: '20px'
};

const favCardStyle: React.CSSProperties = { 
    background: 'white', 
    borderRadius: '16px', 
    overflow: 'hidden', 
    boxShadow: '0 8px 20px rgba(0,0,0,0.04)', 
    border: '1px solid #f1f5f9',
    transition: 'transform 0.2s ease'
};

const imgBoxStyle: React.CSSProperties = { 
    background: '#f1f5f9', 
    height: '180px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer' 
};

const cartBtnStyle: React.CSSProperties = { 
    flex: 1, 
    padding: '10px', 
    background: '#0d375b', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    fontSize: '10px', 
    fontWeight: '800', 
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(13, 55, 91, 0.2)'
};

const removeBtnStyle: React.CSSProperties = { 
    padding: '10px 14px', 
    background: '#fee2e2', 
    color: '#ef4444', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontWeight: 'bold'
};

const shopNowBtn: React.CSSProperties = { 
    marginTop: '20px', 
    padding: '12px 30px', 
    background: '#93c5fd', 
    color: '#0d375b',
    border: 'none', 
    borderRadius: '25px', 
    fontWeight: '900', 
    fontSize: '11px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

export default Favorites;