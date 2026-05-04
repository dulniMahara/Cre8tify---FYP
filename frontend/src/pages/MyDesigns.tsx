import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Header from '../components/Header';
import MockupPreview from '../components/MockupPreview';
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
    frontDesign?: string;
    frontPrintArea?: any;
    tshirtColor?: string;
    canvasState?: {
        imageLayers: any[];
        textLayers: any[];
    };
    frontDesignScale?: number;
}

const MyDesigns = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [allDesigns, setAllDesigns] = useState<DesignItem[]>([]);
    const [shopName, setShopName] = useState("Cre8tify Studio");

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
                setShopName(userObj.shopName || "Cre8tify Studio");

                // API LOGIC
                try {
                    const response = await fetch(`${API_URL}/api/products/my-designs`, {
                        headers: { 'Authorization': `Bearer ${userObj.token}` }
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();

                    if (!Array.isArray(data)) {
                        throw new Error("Invalid data format received from server");
                    }

                    const formattedDB = data.map((item: any) => ({
                        id: item._id,
                        title: item.title,
                        price: item.price,
                        image: (item.mockupImages && item.mockupImages.length > 0) ? (item.mockupImages[0].startsWith('/uploads') ? `http://localhost:5000${item.mockupImages[0]}` : item.mockupImages[0]) : '/img/placeholder.png',
                        status: item.status === 'Pending' ? 'Submitted' : item.status,
                        sales: item.salesCount || 0,
                        likes: item.likes || 0,
                        description: typeof item.description === 'string' ? item.description.replace(/&nbsp;/g, ' ') : '',
                        frontDesign: item.frontDesign,
                        frontPrintArea: item.frontPrintArea,
                        backDesign: item.backDesign,
                        backPrintArea: item.backPrintArea,
                        tshirtColor: item.tshirtColor,
                        canvasState: item.canvasState,
                        frontDesignScale: item.frontDesignScale,
                        allowCustomization: item.allowCustomization,
                        allowEditRequests: item.allowEditRequests,
                        baseProduct: item.baseProduct,
                        designer: item.designer
                    }));

                    // 🟢 Only Approved designs are shown to customers/public
                    const filtered = formattedDB.filter((d: any) => d.status === 'Approved');

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
        window.scrollTo(0, 0);
    }, []);


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
                    .content-wrapper.designer-designs-content {
                        margin-top: 0px !important;
                        padding-top: 20px !important;
                    }
                `}
            </style>

            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)' }}>

                <Header showCart={false} onSearch={setSearchQuery} userRole="designer" />

                {/* CONTENT */}
                <div className="content-wrapper animate-load designer-designs-content" style={{ padding: '20px', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>
                            Showing <span style={{ fontWeight: '700', color: '#0f172a' }}>{filteredDesigns.length}</span> Results
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>Sort by:</span>
                            <select style={{ padding: '4px 12px', borderRadius: '15px', border: '1px solid #cbd5e1', background: 'white', color: '#0f172a', fontWeight: '600', cursor: 'pointer', outline: 'none', fontSize: '9px', fontFamily: '"Outfit", sans-serif' }}>
                                <option style={{ fontSize: '12px' }}>Newest First</option>
                                <option style={{ fontSize: '12px' }}>Price: Low to High</option>
                                <option style={{ fontSize: '12px' }}>Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* PRODUCT GRID - UPDATED TO 3 COLUMNS FOR LARGER MOCKUPS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {filteredDesigns.map((item) => (
                            <div key={item.id} className="product-card design-card" style={{ background: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', position: 'relative' }}>

                                <div
                                    onClick={() => handleNavigate(item)}
                                    style={{ height: '230px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden', padding: '10px', position: 'relative', cursor: 'pointer' }}
                                >
                                    <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', maxHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        {!item.frontDesign ? (
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
                                        ) : (
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
                                        )}
                                    </div>
                                </div>

                                <div style={{ padding: '0 5px' }}>
                                    {/* TOP ROW: Brand and View Details */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#94a3b8' }}>{shopName}</div>
                                        <span onClick={() => handleNavigate(item)} style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', textDecoration: 'underline', cursor: 'pointer' }}>View Details</span>
                                    </div>

                                    {/* MIDDLE ROW: Title */}
                                    <h3 onClick={() => handleNavigate(item)} style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a', lineHeight: '1.2', cursor: 'pointer', fontFamily: '"Outfit", sans-serif' }}>
                                        {item.title}
                                    </h3>

                                    {/* PRICE ROW */}
                                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#ef4444', marginBottom: '10px' }}>
                                        {typeof item.price === 'string' && item.price.includes('LKR') ? item.price : `LKR ${Number(item.price).toLocaleString()}.00`}
                                    </div>

                                    {/* FOOTER: Icons on right of border */}
                                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <img src="/img/heart.png" alt="Likes" style={{ width: '12px', opacity: 0.6 }} />
                                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{item.likes}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <img src="/img/cart.png" alt="Sales" style={{ width: '12px', opacity: 0.7 }} />
                                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{item.sales}</span>
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
