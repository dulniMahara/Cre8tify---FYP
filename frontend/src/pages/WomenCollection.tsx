import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import CollectionHero from '../components/CollectionHero';
import '../styles/dashboard.css';

const API_URL = "http://localhost:5000";

export const originalProducts = [
        { id: 1, title: 'Taste & See Minimal', price: 1200, likes: 56, sales: 6, img: '/img/shop1.png', scale: 1.5, fit: 'Regular Fit' },
        { id: 2, title: 'Abstract Line Art', price: 1450, likes: 32, sales: 12, img: '/img/shop2.png', scale: 1.1, fit: 'Oversized Fit' },
        { id: 3, title: 'Vintage Oversized', price: 1350, likes: 89, sales: 24, img: '/img/shop3.png', scale: 1.2, fit: 'Oversized Fit' },
        { id: 4, title: 'Neon Genesis Print', price: 1600, likes: 45, sales: 8, img: '/img/shop4.png', scale: 1.4, fit: 'Boxy Fit' },
        { id: 5, title: 'Cherry Blossom Tee', price: 1250, likes: 120, sales: 40, img: '/img/shop1.png', scale: 1.5, fit: 'Regular Fit' },
        { id: 6, title: 'Dark Soul Graphic', price: 1550, likes: 67, sales: 15, img: '/img/shop2.png', scale: 1.1, fit: 'Boxy Fit' },
        { id: 7, title: 'Cyberpunk City', price: 1750, likes: 210, sales: 55, img: '/img/shop3.png', scale: 1.2, fit: 'Regular Fit' },
        { id: 8, title: 'Retro Wave', price: 1300, likes: 44, sales: 9, img: '/img/shop4.png', scale: 1.4, fit: 'Oversized Fit' },
        // ... (Rest of your originalProducts array remains exactly the same)
    ];

const WomenCollection = () => { 
    const navigate = useNavigate();
    const [navProfileImg, setNavProfileImg] = useState<string>('/img/profile.png');
    
    // 🛡️ 1. Grab the context (Including cartItems for live sync)
    const cartContext = useCart();
    const addToCart = cartContext ? cartContext.addToCart : null;
    const cartItems = cartContext ? cartContext.cartItems : [];

    // 🚀 2. Enhanced handleAddToCart
    const handleAddToCart = (item: any) => {
        if (!item || !addToCart) {
            console.error("Cart error");
            return;
        }

        const productWithDefaults = {
            id: item.id, 
            title: item.title,
            price: item.price,
            image: item.img ? (item.img.startsWith('/img/') ? item.img : `/img/${item.img}`) : "/img/placeholder.png",
            size: 'Choose Size', 
            color: 'Choose Color',
            quantity: 1, 
            selected: true,
            type: 'physical'
        };

        addToCart(productWithDefaults);
        alert(`${item.title} added to your cart! 🛒`);
    };

    const [heroImageIndex, setHeroImageIndex] = useState(0);
    const heroImages = ['/img/womencollect1.png', '/img/womencollect2.png', '/img/womencollect3.png'];

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 3000);

        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            if (userObj.profileImage) {
                const fullUrl = userObj.profileImage.startsWith('http') 
                    ? userObj.profileImage 
                    : `${API_URL}${userObj.profileImage.startsWith('/') ? '' : '/'}${userObj.profileImage}`;
                setNavProfileImg(fullUrl);
            }
        }
        
        return () => clearInterval(interval);
    }, [heroImages.length]);

    const [likedProducts, setLikedProducts] = useState<any[]>([]);
    const [sortOpen, setSortOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('Newest');
    const [filterBy, setFilterBy] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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

    const getProcessedProducts = () => {
        let products = [...originalProducts];
        if (filterBy !== 'All' && !filterBy.includes('LKR')) products = products.filter(p => p.fit === filterBy);
        if (filterBy === 'Under LKR 1,500') products = products.filter(p => p.price < 1500);
        else if (filterBy === 'Above LKR 1,500') products = products.filter(p => p.price >= 1500);

        if (sortBy === 'Price: Low to High') products.sort((a, b) => a.price - b.price);
        else if (sortBy === 'Price: High to Low') products.sort((a, b) => b.price - a.price);
        else if (sortBy === 'Best Selling') products.sort((a, b) => b.sales - a.sales);

        const lastIdx = currentPage * itemsPerPage;
        const firstIdx = lastIdx - itemsPerPage;
        return {
            paginated: products.slice(firstIdx, lastIdx),
            totalFiltered: products.length
        };
    };

    const { paginated: displayProducts, totalFiltered } = getProcessedProducts();
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);

    return (
        <div className="dashboard-container">
            <Sidebar variant="customer" />
            <div className="main-content">
               <Header mode="search" />
                <div className="content-wrapper collection-content" style={{ padding: '0', marginTop: '0px', overflowX: 'hidden'}}>
                    <CollectionHero title="WOMEN COLLECTION" subtitle="Designed to match your vibe and comfort" image={heroImages[heroImageIndex]} />

                    <div style={{ padding: '0 30px 40px 30px' }}>
                        {/* ... (Filter and Sort UI remains the same) ... */}
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                            {displayProducts.map((item: any) => {
                                
                                // 🚀 LIVE SYNC LOGIC: Find quantity of this specific item in the cart
                                const quantityInCart = cartItems?.find((c: any) => c.id === item.id)?.quantity || 0;

                                const handleNavigate = () => {
                                    navigate(`/product/${item.id}`, { 
                                        state: { 
                                            product: {
                                                ...item,
                                                price: item.price.toString().includes('LKR') ? item.price : `LKR ${item.price.toLocaleString()}`
                                            } 
                                        } 
                                    });
                                };

                               return (
                            <div key={item.id} className="product-card" style={{ background: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', width: '100%', position: 'relative' }}>
                                
                                <div onClick={handleNavigate} style={{ background: '#f8fafc', borderRadius: '9px', display: 'flex', justifyContent: 'center', marginBottom: '8px', height: '170px', alignItems: 'center', overflow: 'hidden', cursor: 'pointer', padding: '8px' }}>
                                    <img 
                                        src={item.img} 
                                        alt={item.title} 
                                        style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain', filter: 'drop-shadow(0 8px 13px rgba(0,0,0,0.08))', transform: `scale(${item.scale || 1.2})` }} 
                                    />
                                </div>

                                <div style={{ padding: '0 5px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '6px', fontStyle: 'italic', color: '#94a3b8' }}>Artisa LK</div>
                                            <h3 onClick={handleNavigate} style={{ fontSize: '13px', fontWeight: '800', margin: '0', color: '#1e293b', lineHeight: '1.2', cursor: 'pointer' }}>{item.title}</h3>
                                        </div>
                                        <span onClick={handleNavigate} style={{ fontSize: '6px', color: '#64748b', fontStyle: 'italic', textDecoration: 'underline', cursor: 'pointer' }}>View Details</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '6px' }}>
                                        <div style={{ fontSize: '9px', fontWeight: '900', color: '#ef4444' }}>
                                            LKR {item.price.toLocaleString()}.00
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {/* Like Section */}
                                            <div onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <img src="/img/heart.png" alt="" style={{ width: '9px', filter: likedProducts.includes(item.id) ? 'invert(15%) sepia(95%) saturate(6932%) hue-rotate(358deg) brightness(95%) contrast(112%)' : 'none', opacity: likedProducts.includes(item.id) ? 1 : 0.6 }} />
                                                <span style={{ fontSize: '6px', color: '#64748b', fontWeight: '700' }}>
                                                    {likedProducts.includes(item.id) ? (item.likes || 0) + 1 : (item.likes || 0)}
                                                </span>
                                            </div>

                                            {/* 🟢 DYNAMIC CART SECTION */}
                                            <div onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <img src="/img/cart.png" alt="" style={{ width: '9px', opacity: 0.7 }} />
                                                <span style={{ fontSize: '6px', color: '#64748b', fontWeight: '700' }}>
                                                    {quantityInCart}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                               );
                            })}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px' }}>
                            <PaginationBtn text="<" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} />
                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationBtn key={i} text={(i + 1).toString()} active={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)} />
                            ))}
                            <PaginationBtn text=">" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} />
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

// ==================== SUB-COMPONENTS ====================
const FilterButton = ({ icon, text, onClick, active }: any) => (
    <button onClick={onClick} style={{ padding: '6px 12px', background: active ? '#0d375b' : 'white', color: active ? 'white' : '#1e293b', border: '1px solid #e2e8f0', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '7px', fontWeight: '600', boxShadow: '0 2px 5px rgba(0,0,0,0.03)', transition: 'all 0.2s', minWidth: '70px', justifyContent: 'center' }}>
        <img src={icon} alt="" style={{ width: '8px', opacity: active ? 1 : 0.7, filter: active ? 'invert(1)' : 'none' }} /> {text}
    </button>
);

const DropdownItem = ({ text, onClick }: any) => (
    <div onClick={onClick} style={{ padding: '5px 8px', borderRadius: '5px', fontSize: '7px', color: '#334155', cursor: 'pointer', transition: 'background 0.2s', fontWeight: '500' }} onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>{text}</div>
);

const PaginationBtn = ({ text, active, onClick }: any) => (
    <button onClick={onClick} style={{ width: '23px', height: '23px', borderRadius: '6px', border: 'none', background: active ? '#0d375b' : 'white', color: active ? 'white' : '#64748b', fontSize: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>{text}</button>
);

export default WomenCollection;