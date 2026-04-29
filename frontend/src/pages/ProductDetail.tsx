import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/dashboard.css';
import { originalProducts as menProducts } from './MenCollection';
import { originalProducts as womenProducts } from './WomenCollection';
import { originalProducts as kidsProducts } from './KidsCollection';
import { useCart } from '../context/CartContext';

// 🟢 Styles for the Purchase Modal
const modalOptionStyle: React.CSSProperties = {
    padding: '15px 20px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: '0.3s'
};

const closeButtonStyle: React.CSSProperties = {
    marginTop: '20px',
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer'
};

//  HELPER COMPONENTS

const ActionButton = ({ text, onClick }: { text: string; onClick?: () => void }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
            onMouseDown={() => setIsActive(true)}
            onMouseUp={() => setIsActive(false)}
            style={{
                padding: '12px 20px',
                background: isActive ? '#3B82F6' : (isHovered ? '#D1E8FF' : '#E0EEFF'),
                border: 'none',
                borderRadius: '50px', // Pill shape
                fontSize: '14px',
                fontWeight: '900',
                color: '#000',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isActive ? 'scale(0.95)' : 'scale(1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '55px',
                lineHeight: '1.2'
            }}
        >
            {text}
        </button>
    );
};

// --- DESIGNER CARD COMPONENT (Dynamic) ---
const DesignerCard = ({ name, shopName, bio, profileImage, onClick }: { name: string; shopName: string; bio: string; profileImage: string; onClick: () => void }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

    return (
        <div style={{
            background: '#E0EEFF', borderRadius: '24px', padding: '20px', width: '100%',
            display: 'flex', gap: '20px', alignItems: 'center', position: 'relative',
            boxShadow: '0 4px 25px rgba(0,0,0,0.06)',
        }}>
            <div style={{ flexShrink: 0 }}>
                <img src={profileImage || "/img/designer1_profile.png"} alt="Designer" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>

            <div style={{ width: '2px', height: '180px', background: '#3B82F6', opacity: 0.3 }}></div>

            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0d375b' }}>Designer Profile</h4>
                        <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', color: '#475569' }}>{name}</p>
                    </div>
                    <button
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
                        onMouseDown={() => setIsActive(true)}
                        onMouseUp={() => setIsActive(false)}
                        onClick={onClick}
                        style={{
                            padding: '8px 20px',
                            background: isActive ? '#1D4ED8' : (isHovered ? '#3B82F6' : '#000'),
                            color: '#fff', border: 'none', borderRadius: '12px',
                            fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                            transition: '0.3s ease',
                            transform: isActive ? 'scale(0.96)' : 'scale(1)'
                        }}
                    >
                        Visit Shop
                    </button>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0d375b' }}>Shop Name</h4>
                    <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', color: '#475569' }}>{shopName}</p>
                </div>

                <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0d375b' }}>Bio</h4>
                    <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.6', color: '#475569' }}>{bio}</p>
                </div>
            </div>
        </div>
    );
};

//  MAIN COMPONENT

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, addToCart } = useCart();

    // 🟢 1. First, catch data from the click (Dashboard flow)
    let incoming = location.state?.product;
    const isDesignerPreview = location.state?.fromDesignerPreview || false;

    // 🕵️ 2. IF COMING FROM CART (location.state is empty)
    if (!incoming && id) {
        // A) Check the Cart first (for those unpredictable user designs)
        const inCart = cartItems.find((item: any) => String(item.id) === String(id));

        if (inCart) {
            incoming = inCart;
        } else {
            // 🚀 B) NEW: Search through EVERY collection!
            // This combines all your "Internet T-shirts" into one searchable list
            const allShopProducts = [
                ...(typeof menProducts !== 'undefined' ? menProducts : []),
                ...(typeof womenProducts !== 'undefined' ? womenProducts : []),
                ...(typeof kidsProducts !== 'undefined' ? kidsProducts : [])
            ];

            incoming = allShopProducts.find((p: any) => String(p.id) === String(id));
        }
    }

    const API_URL = "http://localhost:5000";
    const [availableColors, setAvailableColors] = useState<string[]>([]);
    const [availableSizes, setAvailableSizes] = useState<string[]>([]);

    // 🚀 STEP 1: Identify the Front Image (e.g., "/img/shop1.png")
    const frontImg = incoming?.img || incoming?.image || (incoming?.baseImages ? incoming.baseImages[0] : '/img/mockups/shop1_base_front.png');

    // 🚀 STEP 2: Automatically create the Back Image link
    // This looks for the dot (like .png or .jpg) and inserts "back" before it
    const backImg = frontImg.replace(/(\.[\w\d]+)$/, 'back$1');

    // 🚀 1. Define the "Dictionary" FIRST (Outside the object)
    const colorNames: any = {
        '#FFFFFF': 'White',
        '#8fa749': 'Kiwi',
        '#fadfa6': 'Yellow Haze',
        '#f7ef8f': 'Cornsilk',
        '#d6e6f7': 'Light Blue',
        '#fee0eb': 'Light Pink',
        '#2C2C2C': 'Charcoal',
        '#F0E68C': 'Khaki',
        '#E0FFFF': 'Baby Blue',
        '#E6E6FA': 'Lavender',
        '#F5F5DC': 'Beige',
        '#808080': 'Standard Grey',
        '#C0C0C0': 'Silver',
        '#FFA07A': 'Light Salmon',
        '#87CEFA': 'Sky Blue',
        '#AFEEEE': 'Pale Turquoise',
        '#DDA0DD': 'Plum Light',
        '#98FB98': 'Mint Green'
    };

    // 🟢 2. THE SMART UNPACKER (Clean and error-free)
    const product = {
        id: incoming?.id || id,
        title: incoming?.title || 'Custom Design',
        isKids: incoming?.isKids || false,
        hasBackView: incoming?.hasBackView || false,

        // Keeping your price formatting logic
        price: typeof incoming?.price === 'string'
            ? (incoming.price.includes(',')
                ? (incoming.price.includes('.00') ? incoming.price : `${incoming.price}.00`)
                : `${incoming.price.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.00`)
            : `LKR ${incoming?.price?.toLocaleString() || '1,200'}.00`,

        displayImage: frontImg,
        img: frontImg,
        baseImages: (incoming?.frontDesign)
            ? ["/img/womenfront-mockup.png", "/img/womenback-mockup.png"]
            : (incoming?.baseImages || [frontImg, backImg]),

        // 🎨 Use the keys from our dictionary for the color dots
        colors: (incoming?.frontDesign) ? Object.keys(colorNames) : (incoming?.colors || Object.keys(colorNames).slice(0, 7)),

        sizes: incoming?.sizes || ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
        descriptionPara1: incoming?.description || "Experience the perfect blend of style...",
        basePrice: incoming?.basePrice || 650,
        designerCharge: incoming?.designerCharge || 350,
        serviceCharge: incoming?.serviceCharge || 200,
        designerName: Number(incoming?.id || id) <= 99 ? 'Ishara Deen' : (incoming?.designer?.name || incoming?.designerName || 'Designer'),
        designerBio: Number(incoming?.id || id) <= 99
            ? 'Ishara is a self-taught designer from Colombo who specializes in minimal line art and soft pastel aesthetics.'
            : (incoming?.designer?.bio || incoming?.designerBio || 'A creative designer on Cre8tify.'),
        designerImg: Number(incoming?.id || id) <= 99
            ? '/img/designer1_profile.png'
            : (incoming?.designer?.profileImage ? (incoming.designer.profileImage.startsWith('http') ? incoming.designer.profileImage : `http://localhost:5000${incoming.designer.profileImage.startsWith('/') ? '' : '/'}${incoming.designer.profileImage}`) : (incoming?.designerImg || '/img/profile-picture.png')),
        shopName: Number(incoming?.id || id) <= 99 ? 'Artisa LK' : (incoming?.designer?.shopName || incoming?.shopName || 'Cre8tify Studio'),

        // 🟢 Designer Design Data
        frontDesign: incoming?.frontDesign,
        frontPrintArea: incoming?.frontPrintArea,
        backDesign: incoming?.backDesign,
        backPrintArea: incoming?.backPrintArea,
        tshirtColor: incoming?.tshirtColor,
        baseProduct: incoming?.baseProduct,
        allowCustomization: incoming?.allowCustomization ?? true,
        allowEditRequests: true // 🟢 Force true as requested
    };

    // 3. Selection States
    const [selectedColor, setSelectedColor] = useState(incoming?.selectedColor || product.tshirtColor || '#FFFFFF');
    const [selectedSize, setSelectedSize] = useState('M');
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);

    // 🚀 Scroll to top when product changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // 🚀 Fetch Base Product Info (Colors/Sizes from Admin)
    useEffect(() => {
        if (product.baseProduct) {
            fetch(`${API_URL}/api/base-products/${encodeURIComponent(product.baseProduct)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.colors && data.colors.length > 0) setAvailableColors(data.colors);
                    if (data.sizes && data.sizes.length > 0) setAvailableSizes(data.sizes);
                })
                .catch(err => console.error("Error fetching base product", err));
        }
    }, [product.baseProduct]);

    const isWomenOrDashboard = Number(product.id) <= 99;

    // 4. Recommended Products
    const recommendedProducts = [
        { id: 101, title: 'Abstract Lines', price: '1,450', bgColor: '#F1F5F9', img: '/img/shop1.png' },
        { id: 102, title: 'Nature Bloom', price: '1,200', bgColor: '#E0EEFF', img: '/img/shop2.png' },
        { id: 103, title: 'Midnight Echo', price: '1,300', bgColor: '#F1F5F9', img: '/img/shop3.png' },
        { id: 104, title: 'Sunset Minimal', price: '1,100', bgColor: '#E0EEFF', img: '/img/shop4.png' }
    ];


    return (
        <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <Sidebar variant={isDesignerPreview ? undefined : "customer"} />
            <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', width: 'calc(100% - 200px)' }}>
                <Header mode="title" title={product.title} userRole="customer" />
                {/* --- MAIN PRODUCT INFO SECTION --- */}
                <div className="content-wrapper" style={{ padding: '0 25px 25px 25px', background: 'white' }}>
                    {/* TOP GRID: LEFT (T-SHIRT) vs RIGHT (DETAILS) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start', marginBottom: '10px' }}>

                        {/* --- LEFT VISUALS (Sticky) --- */}
                        <div style={{ position: 'sticky', top: '60px' }}>
                            <div style={{
                                borderRadius: '20px', width: '100%', height: '400px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', position: 'relative', background: '#f8fafc',
                                border: '1px solid #e2e8f0', padding: '10px'
                            }}>
                                {/* 🚀 LOGIC: Use Mask/Color Layer for Designer Products (including Kids) or Men/Women Base Products */}
                                {(!product.isKids || product.frontDesign) ? (
                                    <div style={{
                                        display: 'grid',
                                        placeItems: 'center',
                                        width: product.frontDesign ? '115%' : (isWomenOrDashboard ? '75%' : '75%'),
                                        height: product.frontDesign ? '115%' : (isWomenOrDashboard ? '75%' : '75%'),
                                        position: 'relative',
                                        transform: product.frontDesign
                                            ? (isWomenOrDashboard ? 'translateY(-20px) scale(1.1)' : 'translateY(-30px) scale(1.1)')
                                            : (isWomenOrDashboard ? 'translateY(-40px)' : 'translateY(-50px)')
                                    }}>
                                        <div style={{
                                            gridArea: '1 / 1',
                                            width: '100%', height: '100%',
                                            backgroundColor: selectedColor,
                                            transition: 'background-color 0.3s ease',
                                            WebkitMaskImage: `url(${product.baseImages[currentImgIndex]})`,
                                            maskImage: `url(${product.baseImages[currentImgIndex]})`,
                                            WebkitMaskSize: 'contain', maskSize: 'contain',
                                            WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                                            WebkitMaskPosition: 'center', maskPosition: 'center',
                                            zIndex: 0
                                        }} />
                                        <img
                                            src={product.baseImages[currentImgIndex]}
                                            alt=""
                                            style={{
                                                gridArea: '1 / 1',
                                                width: '100%', height: '100%',
                                                objectFit: 'contain',
                                                position: 'relative',
                                                zIndex: 1,
                                                mixBlendMode: 'multiply',
                                                filter: 'contrast(1.0) brightness(0.95) saturate(0)'
                                            }}
                                        />

                                        {/* 🎨 DESIGN OVERLAY LAYER (For Designer Products) */}
                                        {((currentImgIndex === 0 && product.frontDesign) || (currentImgIndex === 1 && product.backDesign)) && (
                                            <div style={{
                                                gridArea: '1 / 1',
                                                width: '100%', height: '100%',
                                                position: 'relative',
                                                zIndex: 2,
                                                pointerEvents: 'none',
                                                // We mask the design with the same T-shirt mask to ensure it doesn't spill over
                                                WebkitMaskImage: `url(${product.baseImages[currentImgIndex]})`,
                                                maskImage: `url(${product.baseImages[currentImgIndex]})`,
                                                WebkitMaskSize: 'contain',
                                                WebkitMaskPosition: 'center',
                                                WebkitMaskRepeat: 'no-repeat'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: currentImgIndex === 0 ? (product.frontPrintArea?.top || '50%') : (product.backPrintArea?.top || '50%'),
                                                    left: currentImgIndex === 0 ? (product.frontPrintArea?.left || '51%') : (product.backPrintArea?.left || '51%'),
                                                    width: currentImgIndex === 0 ? (product.frontPrintArea?.width || '30%') : (product.backPrintArea?.width || '30%'),
                                                    height: currentImgIndex === 0 ? (product.frontPrintArea?.height || '27%') : (product.backPrintArea?.height || '27%'),
                                                    transform: `translate(-50%, -50%) rotate(${currentImgIndex === 0 ? (product.frontPrintArea?.rotation || 0) : (product.backPrintArea?.rotation || 0)}deg)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden'
                                                }}>
                                                    <img
                                                        src={currentImgIndex === 0 ? product.frontDesign : product.backDesign}
                                                        alt="Design"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain',
                                                            transform: 'scale(1.0)',
                                                            transformOrigin: 'center center'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* 🚀 Kids Section (Handles Designer Products too) */
                                    <div style={{
                                        width: product.frontDesign ? '115%' : '100%',
                                        height: product.frontDesign ? '115%' : '100%',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transform: product.frontDesign ? 'translateY(-20px) scale(1.1)' : 'none'
                                    }}>
                                        {product.frontDesign ? (
                                            <>
                                                {/* Base Image */}
                                                <img
                                                    src="/img/mockups/kids_base_front.png"
                                                    alt={product.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                                {/* Design Overlay */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: product.frontPrintArea?.top || '50%',
                                                    left: product.frontPrintArea?.left || '51%',
                                                    width: product.frontPrintArea?.width || '30%',
                                                    height: product.frontPrintArea?.height || '27%',
                                                    transform: `translate(-50%, -50%) rotate(${product.frontPrintArea?.rotation || 0}deg)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden'
                                                }}>
                                                    <img
                                                        src={product.frontDesign}
                                                        alt="Design"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain',
                                                            transform: 'scale(1.0)',
                                                            transformOrigin: 'center center'
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <img
                                                src={product.displayImage}
                                                alt={product.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 🛑 DOTS: Only show for Men/Women (where back view is available) */}
                            {!product.isKids && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px', marginBottom: '50px' }}>
                                    <div
                                        onClick={() => setCurrentImgIndex(0)}
                                        style={{ width: '16px', height: '16px', borderRadius: '50%', background: currentImgIndex === 0 ? '#000' : '#CBD5E1', cursor: 'pointer' }}
                                    />
                                    <div
                                        onClick={() => setCurrentImgIndex(1)}
                                        style={{ width: '16px', height: '16px', borderRadius: '50%', background: currentImgIndex === 1 ? '#000' : '#CBD5E1', cursor: 'pointer' }}
                                    />
                                </div>
                            )}

                            {/* Size Reference Guide */}
                            <div style={{ textAlign: 'center', marginTop: product.isKids ? '50px' : '0' }}>
                                <h4 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '15px', color: '#64748B' }}>Size Reference Guide</h4>
                                <div style={{ borderRadius: '24px', border: '1px solid #f1f5f9', background: '#fff', padding: '15px', display: 'flex', justifyContent: 'center' }}>
                                    <img
                                        src={product.isKids ? "/img/kids_sizechart.png" : "/img/sizechart.png"}
                                        alt="Size Chart"
                                        style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT DETAILS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ marginTop: '5px' }}>
                                <h1 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 2px 0', lineHeight: 1.1 }}>{product.title}</h1>
                                <p style={{ fontSize: '14px', color: '#64748B', fontStyle: 'italic', marginBottom: '10px' }}>by {product.shopName || "Artisa"}</p>
                                <div style={{ fontSize: '24px', fontWeight: '900', color: '#fb0606' }}>
                                    {product.price.startsWith('LKR') ? product.price : `LKR ${product.price}`}
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div style={{ fontSize: '15px', color: '#94A3B8', lineHeight: '1.6', background: '#f8fafc', padding: '15px', borderRadius: '18px' }}>
                                Base T-shirt: <span style={{ color: '#475569', fontWeight: '600' }}>- LKR {product.basePrice.toLocaleString()}.00</span><br />
                                Designer charge: <span style={{ color: '#475569', fontWeight: '600' }}>- LKR {product.designerCharge.toLocaleString()}.00</span><br />
                                Service charge: <span style={{ color: '#475569', fontWeight: '600' }}>- LKR {product.serviceCharge.toLocaleString()}.00</span>
                            </div>

                            {/* Description */}
                            <div>

                                <div style={{ fontSize: '13px', color: '#475569', background: '#f1f5f9', padding: '15px', borderRadius: '12px' }}>
                                    <h5 style={{ color: '#0d375b', margin: '0 0 10px 0', fontSize: '14px' }}>🛠 Product Specifications & Quality Assurance</h5>
                                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, lineHeight: '1.6' }}>
                                        <li><strong>Material:</strong> Premium Heavyweight 100% Combed Ring-Spun Cotton.</li>
                                        <li><strong>Fabric Weight:</strong> 240 GSM for a substantial, premium feel.</li>
                                        <li><strong>Finish:</strong> Bio-washed and Pre-shrunk to maintain fit.</li>
                                        <li><strong>Fit:</strong> Contemporary Relaxed Street-Style Fit with dropped shoulders.</li>
                                        <li><strong>Durability:</strong> Double-needle stitched neck and hems.</li>
                                    </ul>
                                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #cbd5e1' }}>
                                        <strong>🧺 Care Instructions:</strong> Machine wash cold inside out. Tumble dry low or hang dry. Do not iron directly on print.
                                    </div>
                                </div>
                            </div>

                            {/* Color Selection (Restored) */}
                            {(!product.isKids || product.frontDesign) && (
                                <div style={{ marginTop: '5px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '10px' }}>Change Color</h4>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {(availableColors.length > 0 ? availableColors : product.colors).map((c: string, index: number) => (
                                            <div
                                                key={index}
                                                onClick={() => setSelectedColor(c)}
                                                style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    background: c, cursor: 'pointer',
                                                    border: selectedColor === c ? '3px solid #3b82f6' : '1px solid #cbd5e1'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size/Age Selection */}
                            <div>
                                <h4 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '12px', marginTop: '15px' }}>{product.isKids ? "Select Age Group" : "Select Size"}</h4>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    {(availableSizes.length > 0 ? availableSizes : product.sizes).map((size: string) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            style={{
                                                padding: '8px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '800',
                                                backgroundColor: selectedSize === size ? '#000' : '#fff',
                                                color: selectedSize === size ? '#fff' : '#000',
                                                border: '2px solid #e2e8f0', minWidth: '80px', cursor: 'pointer'
                                            }}
                                        >
                                            {size.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Buttons with Correct Text & Navigation (Horizontal Layout) */}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', marginBottom: '10px' }}>
                                {(() => {
                                    const latestProduct = {
                                        ...product,
                                        colors: availableColors.length > 0 ? availableColors : product.colors,
                                        sizes: (availableSizes.length > 0 ? availableSizes : product.sizes).map((s: string) => s.toUpperCase())
                                    };
                                    return (
                                        <>
                                            <div style={{ flex: 1 }}><ActionButton text="Try Live Preview" onClick={() => navigate('/live-preview', { state: { product: latestProduct, selectedColor, selectedSize } })} /></div>
                                            <div style={{ flex: 1 }}><ActionButton text="Customize Design" onClick={() => navigate('/design-tool', { state: { product: latestProduct } })} /></div>
                                            <div style={{ flex: 1 }}><ActionButton text="Request Designer Edit" onClick={() => navigate(`/request-edit/${product.id}`, { state: { product: latestProduct, selectedColor, selectedSize } })} /></div>
                                        </>
                                    );
                                })()}
                            </div>

                            {!isDesignerPreview && (
                                <button onClick={() => setShowPurchaseModal(true)} style={{ width: '100%', padding: '16px', background: '#000', color: 'white', border: 'none', borderRadius: '50px', fontWeight: '900', fontSize: '18px', cursor: 'pointer', marginTop: '10px', transition: '0.3s' }}>
                                    Choose purchase option
                                </button>
                            )}

                            <DesignerCard
                                name={product.designerName}
                                shopName={product.shopName}
                                bio={product.designerBio}
                                profileImage={product.designerImg}
                                onClick={() => navigate(`/my-shop`)}
                            />
                        </div>
                    </div>

                    {/* --- REVIEWS SECTION --- */}
                    <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '40px', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>Reviews</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                            <span style={{ fontSize: '20px', fontWeight: '800' }}>5.0</span>
                            <div style={{ color: '#000', fontSize: '18px' }}>★★★★★</div>
                        </div>

                        {[
                            { name: "Ramindi Suhurya", date: "Oct 19, 2025", color: "Off White", text: "Loved the design and the soft color blend." },
                            { name: "S. Sachini", date: "Oct 19, 2025", color: "Black", text: "Loved the design and the soft color blend." },
                            { name: "Thiseja Lochi", date: "Oct 19, 2025", color: "Pearl Blue", text: "Loved the design and the soft color blend." }
                        ].map((rev, index) => (
                            <div key={index} style={{ marginBottom: '25px', maxWidth: '800px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '5px' }}>
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#CBD5E1' }}></div>
                                    <span style={{ fontWeight: '800', fontSize: '16px' }}>{rev.name}</span>
                                    <span style={{ color: '#94A3B8', fontSize: '12px' }}>on {rev.date}</span>
                                </div>
                                <div style={{ color: '#FACC15', fontSize: '14px' }}>{'★★★★★'}</div>
                                <p style={{ margin: '5px 0', fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>Purchased: {rev.color}</p>
                                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>{rev.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* --- 🟢 YOU MAY ALSO LIKE (CENTERED, RESPONSIVE & CLICKABLE) --- */}
                    {!isDesignerPreview && (
                        <div style={{
                            marginTop: '60px',
                            borderTop: '2px solid #e2e8f0',
                            paddingTop: '50px',
                            textAlign: 'center',
                            paddingBottom: '60px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
                                {/* Left Line: Shorter and slightly lighter for elegance */}
                                <div style={{ width: '80px', height: '2px', background: 'linear-gradient(to left, #cbd5e1, transparent)' }}></div>

                                <h2 style={{
                                    fontSize: '20px',
                                    fontWeight: '900',
                                    color: '#64748B',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    margin: 0
                                }}>
                                    You May Also Like
                                </h2>

                                {/* Right Line */}
                                <div style={{ width: '80px', height: '2px', background: 'linear-gradient(to right, #cbd5e1, transparent)' }}></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', flexWrap: 'nowrap', width: '100%' }}>
                                {recommendedProducts.map((prod: any) => (
                                    <div
                                        key={prod.id}
                                        onClick={() => {
                                            navigate(`/product/${prod.id}`, { state: { product: prod } });
                                            window.scrollTo(0, 0);
                                        }}
                                        style={{
                                            background: prod.bgColor,
                                            borderRadius: '20px',
                                            padding: '15px',
                                            width: '220px',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                            e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                                        }}
                                    >
                                        <div style={{
                                            background: '#fff',
                                            borderRadius: '15px',
                                            padding: '10px',
                                            marginBottom: '12px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            height: '160px'
                                        }}>
                                            <img src={prod.img} alt={prod.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <h4 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0', color: '#1e293b' }}>{prod.title}</h4>
                                        <p style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>by Artisa</p>
                                        <p style={{ fontSize: '18px', fontWeight: '900', color: '#000', marginTop: '10px' }}>
                                            LKR {prod.price.includes('.00') ? prod.price : `${prod.price}.00`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- FULL WIDTH FOOTER --- */}
                <div style={{ width: '100%', background: '#000', marginTop: 'auto' }}>
                    <Footer />
                </div>
            </div>

            {/* MODAL */}
            {showPurchaseModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '24px', width: '450px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '25px' }}>Purchase Options</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                            {/* 👕 OPTION 1: PHYSICAL T-SHIRT (Updates the Cart with Size/Color) */}
                            <div
                                onClick={() => {
                                    const updatedProduct = {
                                        ...product,
                                        id: product.id,
                                        title: product.title,
                                        price: product.price,
                                        image: product.baseImages[0],
                                        type: 'physical',
                                        color: colorNames[selectedColor] || 'Custom Color',
                                        size: selectedSize,
                                        quantity: 1,
                                        selected: true
                                    };
                                    addToCart(updatedProduct); // 🚀 This saves it!
                                    setShowPurchaseModal(false);
                                    navigate('/cart');
                                }}
                                style={modalOptionStyle}
                            >
                                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Buy Full T-shirt</h4>
                                <p style={{ margin: '3px 0', color: '#64748b', fontSize: '12px' }}>Selected: {selectedSize} / {selectedColor}</p>
                                <span style={{ fontWeight: '900', color: '#fb0606', fontSize: '16px' }}>{product.price}</span>
                            </div>

                            {/* 💻 OPTION 2: DIGITAL DESIGN */}
                            <div
                                onClick={() => {
                                    const digitalProduct = {
                                        id: `digital-${product.id}`,
                                        title: `${product.title} (Digital)`,
                                        price: product.designerCharge,
                                        image: '/img/digital_download_icon.png',
                                        type: 'digital',
                                        quantity: 1,
                                        selected: true
                                    };
                                    addToCart(digitalProduct); // 🚀 This saves it!
                                    setShowPurchaseModal(false);
                                    navigate('/cart');
                                }}
                                style={modalOptionStyle}
                            >
                                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Digital Design Only</h4>
                                <span style={{ fontWeight: '900', color: '#fb0606', fontSize: '16px' }}>LKR {product.designerCharge}.00</span>
                            </div>

                        </div>
                        <button onClick={() => setShowPurchaseModal(false)} style={closeButtonStyle}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;