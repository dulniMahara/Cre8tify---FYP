import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Header from '../components/Header'; 
import CollectionHero from '../components/CollectionHero';
import { useCart } from '../context/CartContext';
import '../styles/dashboard.css';

// --- 🟢 SHARED MOCKUP PREVIEW COMPONENT ---
type PrintArea = { top: string; left: string; width: string; height: string; rotation?: number };
type MockupPreviewProps = {
    mockupSrc: string;
    maskSrc: string;
    maskSize: string;
    maskPosition: string;
    tshirtColor: string;
    printArea?: PrintArea;
    designSrc?: string;
    areaScale?: number;
    designScale?: number;
    overallScale?: number;
};

const MockupPreview = ({
    mockupSrc,
    maskSrc,
    maskSize,
    maskPosition,
    tshirtColor,
    printArea,
    designSrc,
    areaScale = 1.0,
    designScale = 1.0,
    overallScale = 1.0
}: MockupPreviewProps) => {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', transform: `scale(${overallScale})`, transformOrigin: 'center center', position: 'relative' }}>
                {/* 1. Color Layer (Bottom) */}
                {tshirtColor && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: tshirtColor,
                        WebkitMaskImage: `url(${maskSrc || mockupSrc})`, maskImage: `url(${maskSrc || mockupSrc})`,
                        WebkitMaskSize: maskSize || 'contain', WebkitMaskPosition: maskPosition || 'center',
                        WebkitMaskRepeat: 'no-repeat', pointerEvents: 'none', zIndex: 0
                    }}></div>
                )}

                {/* 2. Mockup Image with Shadows (Top) */}
                <img 
                    src={mockupSrc} 
                    alt="Mockup" 
                    style={{ 
                        width: '100%', height: '100%', objectFit: 'contain', 
                        position: 'relative', zIndex: 1,
                        mixBlendMode: 'multiply',
                        filter: 'contrast(1.0) brightness(0.95) saturate(0)'
                    }} 
                />
                {printArea && designSrc && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        WebkitMaskImage: `url(${maskSrc || mockupSrc})`, maskImage: `url(${maskSrc || mockupSrc})`,
                        WebkitMaskSize: maskSize || 'contain', WebkitMaskPosition: maskPosition || 'center',
                        WebkitMaskRepeat: 'no-repeat', zIndex: 3, pointerEvents: 'none'
                    }}>
                        <div style={{
                            position: 'absolute', top: printArea.top, left: printArea.left,
                            width: `calc(${printArea.width} * ${areaScale})`,
                            height: `calc(${printArea.height} * ${areaScale})`,
                            transform: `translate(-50%, -50%) rotate(${printArea.rotation || 0}deg)`,
                            transformOrigin: 'center center', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', overflow: 'hidden'
                        }}>
                            <img src={designSrc} alt="Design" style={{
                                width: '100%', height: '100%', objectFit: 'contain',
                                transform: `scale(${designScale})`, transformOrigin: 'center center'
                            }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Collection data
export const originalProducts = [
        { id: 1, title: 'Cotton Summer Tee', price: 1200, likes: 24, sales: 8, img: '/img/shop1.png', scale: 1.3, material: 'Premium Cotton' },
        { id: 2, title: 'Linen Comfort Top', price: 1550, likes: 18, sales: 5, img: '/img/shop2.png', scale: 0.9, material: 'Linen Blend' },
        { id: 3, title: 'Silk Dream Blouse', price: 2100, likes: 45, sales: 12, img: '/img/shop3.png', scale: 1.0, material: 'Pure Silk' },
        { id: 4, title: 'Boho Chic Tunic', price: 1400, likes: 32, sales: 10, img: '/img/shop4.png', scale: 1.2, material: 'Cotton Mix' },
        { id: 5, title: 'Velvet Evening Tee', price: 1750, likes: 55, sales: 15, img: '/img/shop5.png', scale: 1.4, material: 'Soft Velvet' },
        { id: 6, title: 'Denim Style Top', price: 1300, likes: 21, sales: 7, img: '/img/shop6.png', scale: 1.1, material: 'Light Denim' },
];

const WomenCollection = () => {
    const navigate = useNavigate();
    
    // 🛡️ 1. Grab the context for Cart Sync
    const cartContext = useCart();
    const addToCart = cartContext ? cartContext.addToCart : null;
    const cartItems = cartContext ? cartContext.cartItems : [];

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

    // 🟢 UI STATES
    const [heroImageIndex, setHeroImageIndex] = useState(0);
    const heroImages = ['/img/womencollect1.png', '/img/womencollect2.png', '/img/womencollect3.png'];
    const [likedProducts, setLikedProducts] = useState<any[]>([]);
    const [sortOpen, setSortOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('Newest');
    const [filterBy, setFilterBy] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [backendProducts, setBackendProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🟢 FETCH APPROVED PRODUCTS FROM BACKEND
    useEffect(() => {
        const fetchDesignerProducts = async () => {
            try {
                // Load existing wishlist from localStorage
                const savedLikes = localStorage.getItem('wishlist');
                if (savedLikes) {
                    setLikedProducts(JSON.parse(savedLikes));
                }

                const response = await fetch('http://localhost:5000/api/products?category=women');
                const data = await response.json();
                
                // Map backend products and ensure strict category filtering
                const mapped = data.filter((p: any) => p.category.toLowerCase() === 'women' || p.category.toLowerCase() === 'unisex').map((p: any) => ({
                    ...p,
                    id: p._id,
                    title: p.title,
                    price: p.price,
                    likes: Math.floor(Math.random() * 50),
                    sales: p.salesCount || 0,
                    description: typeof p.description === 'string' ? p.description.replace(/&nbsp;/g, ' ') : '',
                    img: (p.mockupImages && p.mockupImages.length > 0) ? (p.mockupImages[0].startsWith('/uploads') ? `http://localhost:5000${p.mockupImages[0]}` : p.mockupImages[0]) : '/img/shop1.png',
                    frontDesign: p.frontDesign ? (p.frontDesign.startsWith('/uploads') ? `http://localhost:5000${p.frontDesign}` : p.frontDesign) : '',
                    backDesign: p.backDesign ? (p.backDesign.startsWith('/uploads') ? `http://localhost:5000${p.backDesign}` : p.backDesign) : '',
                    scale: 1.0,
                    material: 'Designer Edition',
                    isDesignerProduct: true,
                    designer: p.designer
                }));
                
                setBackendProducts(mapped);
            } catch (error) {
                console.error("Error fetching designer products:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDesignerProducts();
    }, []);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

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
        // 🟢 COMBINE ORIGINAL MOCK DATA + REAL DESIGNER PRODUCTS
        let products = [...backendProducts, ...originalProducts];
        
        if (filterBy !== 'All') products = products.filter(p => p.material === filterBy || p.isDesignerProduct);
        if (sortBy === 'Price: Low to High') products.sort((a, b) => a.price - b.price);
        else if (sortBy === 'Price: High to Low') products.sort((a, b) => b.price - a.price);
        else if (sortBy === 'Best Selling') products.sort((a, b) => b.sales - a.sales);
        
        const lastIdx = currentPage * itemsPerPage;
        const firstIdx = lastIdx - itemsPerPage;
        return { paginated: products.slice(firstIdx, lastIdx), total: products.length };
    };

    const { paginated: displayProducts, total: totalFiltered } = getProcessedProducts();
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);

    return (
        <div className="dashboard-container">
            <Sidebar variant="customer" />
            <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <Header mode="search" userRole="customer" />

                <div className="content-wrapper collection-content" style={{ padding: '0', background: '#f8fafc', marginTop: '0px' }}>
                    <CollectionHero 
                        title="WOMEN COLLECTION" 
                        subtitle="Elegance meets comfort in every thread" 
                        image={heroImages[heroImageIndex]} 
                    />

                    <div style={{ padding: '0 30px 40px 30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '5px 3px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '500' }}>
                                Showing <span style={{ fontWeight: '800', color: '#0d375b' }}>{displayProducts.length}</span> of {totalFiltered} Designs
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ position: 'relative' }}>
                                    <FilterButton icon="/img/icon-filter.png" text={filterBy === 'All' ? "Filter" : filterBy} onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }} active={filterOpen || filterBy !== 'All'} />
                                    {filterOpen && (
                                        <div style={{ position: 'absolute', top: '30px', right: 0, width: '120px', background: 'white', borderRadius: '10px', boxShadow: '0 10px 25px rgba(13, 55, 91, 0.15)', padding: '10px', zIndex: 100, border: '1px solid #e2e8f0' }}>
                                            <DropdownItem text="Premium Cotton" onClick={() => { setFilterBy('Premium Cotton'); setCurrentPage(1); setFilterOpen(false); }} />
                                            <DropdownItem text="Pure Silk" onClick={() => { setFilterBy('Pure Silk'); setCurrentPage(1); setFilterOpen(false); }} />
                                            <DropdownItem text="Soft Velvet" onClick={() => { setFilterBy('Soft Velvet'); setCurrentPage(1); setFilterOpen(false); }} />
                                            <DropdownItem text="Designer Edition" onClick={() => { setFilterBy('Designer Edition'); setCurrentPage(1); setFilterOpen(false); }} />
                                            <div style={{ height: '1px', background: '#f1f5f9', margin: '8px 0' }}></div>
                                            <DropdownItem text="Reset All" onClick={() => { setFilterBy('All'); setCurrentPage(1); setFilterOpen(false); }} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <FilterButton icon="/img/icon-sort.png" text={`Sort: ${sortBy}`} onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }} active={sortOpen} />
                                    {sortOpen && (
                                        <div style={{ position: 'absolute', top: '30px', right: 0, width: '120px', background: 'white', borderRadius: '10px', boxShadow: '0 10px 25px rgba(13, 55, 91, 0.15)', padding: '6px', zIndex: 100, border: '1px solid #e2e8f0' }}>
                                            <DropdownItem text="Newest" onClick={() => { setSortBy('Newest'); setSortOpen(false); }} />
                                            <DropdownItem text="Best Selling" onClick={() => { setSortBy('Best Selling'); setSortOpen(false); }} />
                                            <DropdownItem text="Price: Low to High" onClick={() => { setSortBy('Price: Low to High'); setSortOpen(false); }} />
                                            <DropdownItem text="Price: High to Low" onClick={() => { setSortBy('Price: High to Low'); setSortOpen(false); }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                            {displayProducts.map((item: any) => {
                                // 🚀 LIVE CART SYNC: Find current quantity in cart context
                                const quantityInCart = cartItems?.find((c: any) => c.id === item.id)?.quantity || 0;

                                const handleNavigate = () => {
                                    navigate(`/product/${item.id}`, { state: { product: { ...item, price: `LKR ${item.price}` } } });
                                };

                                return (
                                    <div key={item.id} className="product-card" style={{ background: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', width: '100%', position: 'relative' }}>
                                        <div onClick={handleNavigate} style={{ background: '#f8fafc', borderRadius: '9px', display: 'flex', justifyContent: 'center', marginBottom: '8px', height: '210px', alignItems: 'center', overflow: 'hidden', cursor: 'pointer', position: 'relative', padding: item.isDesignerProduct ? '0' : '8px' }}>
                                            {item.isDesignerProduct && item.frontDesign ? (
                                                <MockupPreview 
                                                    mockupSrc="/img/womenfront-mockup.png"
                                                    maskSrc="/img/womenfront-mockup.png"
                                                    maskSize="contain"
                                                    maskPosition="center"
                                                    tshirtColor={item.tshirtColor || '#ffffff'}
                                                    printArea={item.frontPrintArea || { top: '50%', left: '51%', width: '30%', height: '27%', rotation: 0 }}
                                                    designSrc={item.frontDesign}
                                                    overallScale={1.7}
                                                />
                                            ) : (
                                                <img src={item.img} alt={item.title} style={{ maxWidth: item.isDesignerProduct ? '100%' : '85%', maxHeight: item.isDesignerProduct ? '100%' : '85%', objectFit: 'contain', filter: item.isDesignerProduct ? 'none' : 'drop-shadow(0 8px 13px rgba(0,0,0,0.08))', transform: `scale(${item.scale || 1})` }} />
                                            )}
                                        </div>

                                        <div style={{ padding: '0 5px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '6px', fontStyle: 'italic', color: '#94a3b8' }}>{item.designer?.shopName || 'Artisa LK'}</div>
                                                    <h3 onClick={handleNavigate} style={{ fontSize: '13px', fontWeight: '800', margin: '0', color: '#1e293b', lineHeight: '1.2', cursor: 'pointer' }}>{item.title}</h3>
                                                </div>
                                                <span onClick={handleNavigate} style={{ fontSize: '6px', color: '#64748b', fontStyle: 'italic', textDecoration: 'underline', cursor: 'pointer' }}>View Details</span>
                                            </div>

                                            <div style={{ fontSize: '9px', fontWeight: '800', color: '#ef4444', margin: '6px 0' }}>LKR {item.price.toLocaleString()}.00</div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '6px', gap: '8px' }}>
                                                {/* --- LIVE LIKE SYNC --- */}
                                                <div onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <img src="/img/heart.png" alt="" style={{ width: '9px', filter: likedProducts.includes(item.id) ? 'invert(15%) sepia(95%) saturate(6932%) hue-rotate(358deg) brightness(95%) contrast(112%)' : 'none', opacity: likedProducts.includes(item.id) ? 1 : 0.7 }} />
                                                    <span style={{ fontSize: '6px', color: '#64748b', fontWeight: '600' }}>{likedProducts.includes(item.id) ? item.likes + 1 : item.likes}</span>
                                                </div>

                                                {/* --- LIVE CART SYNC --- */}
                                                <div onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <img src="/img/cart.png" alt="" style={{ width: '9px', opacity: 0.7 }} />
                                                    <span style={{ fontSize: '6px', color: '#64748b', fontWeight: '600' }}>{quantityInCart}</span>
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

const FilterButton = ({ icon, text, onClick, active }: any) => (
    <button onClick={onClick} style={{ padding: '6px 12px', background: active ? '#0d375b' : 'white', color: active ? 'white' : '#1e293b', border: '1px solid #e2e8f0', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '7px', fontWeight: '600', transition: 'all 0.2s', minWidth: '70px', justifyContent: 'center' }}>
        <img src={icon} alt="" style={{ width: '8px', opacity: active ? 1 : 0.7, filter: active ? 'invert(1)' : 'none' }} /> {text}
    </button>
);

const DropdownItem = ({ text, onClick }: any) => (
    <div onClick={onClick} style={{ padding: '5px 8px', borderRadius: '5px', fontSize: '7px', color: '#334155', cursor: 'pointer', fontWeight: '500' }}>{text}</div>
);

const PaginationBtn = ({ text, active, onClick }: any) => (
    <button onClick={onClick} style={{ width: '23px', height: '23px', borderRadius: '6px', border: 'none', background: active ? '#0d375b' : 'white', color: active ? 'white' : '#64748b', fontSize: '8px', fontWeight: '600', cursor: 'pointer' }}>{text}</button>
);

export default WomenCollection;