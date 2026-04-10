import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom'; 
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/dashboard.css';
import { originalProducts as menProducts } from './MenCollection';
import { originalProducts as womenProducts } from './WomenCollection';
import { originalProducts as kidsProducts } from './KidsCollection';
import { useCart } from '../context/CartContext';

// 🟢 Styles for the Purchase Modal
const modalOptionStyle: React.CSSProperties = {
    padding: '25px', 
    border: '2px solid #E2E8F0', 
    borderRadius: '20px', 
    cursor: 'pointer', 
    textAlign: 'left' as const, 
    transition: '0.3s'
};

const closeButtonStyle: React.CSSProperties = {
    marginTop: '30px', 
    background: 'none', 
    border: 'none', 
    color: '#94A3B8', 
    fontWeight: '700', 
    fontSize: '18px', 
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
                padding: '24px 15px',
                background: isActive ? '#3B82F6' : (isHovered ? '#C0DFFF' : '#E0EEFF'),
                border: 'none', 
                borderRadius: '45px', 
                fontSize: '22px', 
                fontWeight: '900', 
                color: isActive ? '#FFFFFF' : '#000', 
                cursor: 'pointer',
                transition: 'all 0.2s ease', 
                transform: isActive ? 'scale(0.95)' : 'scale(1)', 
            }}
        >
            {text}
        </button>
    );
};

const DesignerCard = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

    return (
        <div style={{ 
            background: '#E0EEFF', borderRadius: '32px', padding: '50px', width: '100%', 
            display: 'flex', gap: '50px', alignItems: 'center', position: 'relative',
            boxShadow: '0 4px 25px rgba(0,0,0,0.06)',
        }}>
            <div style={{ flexShrink: 0 }}>
                <img src="/img/designer1_profile.png" alt="Designer" style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            
            <div style={{ width: '2px', height: '220px', background: '#3B82F6', opacity: 0.3 }}></div>

            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#0d375b' }}>Designer Name</h4>
                        <p style={{ margin: 0, fontSize: '24px', fontStyle: 'italic', color: '#475569' }}>Ishara Deen</p>
                    </div>
                    <button 
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
                        onMouseDown={() => setIsActive(true)}
                        onMouseUp={() => setIsActive(false)}
                        style={{ 
                            padding: '16px 35px', 
                            background: isActive ? '#1D4ED8' : (isHovered ? '#3B82F6' : '#000'), 
                            color: '#fff', border: 'none', borderRadius: '15px', 
                            fontWeight: '800', fontSize: '18px', cursor: 'pointer',
                            transition: '0.3s ease',
                            transform: isActive ? 'scale(0.96)' : 'scale(1)'
                        }}
                    >
                        Visit Shop
                    </button>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#0d375b' }}>Shop Name</h4>
                    <p style={{ margin: 0, fontSize: '24px', fontStyle: 'italic', color: '#475569' }}>Studio Bloom</p>
                </div>
                
                <div>
                    <h4 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#0d375b' }}>Bio</h4>
                    <p style={{ margin: 0, fontSize: '22px', lineHeight: '1.6', color: '#475569' }}>
                        Ishara is a self-taught designer from Colombo who specializes in minimal line art and soft pastel aesthetics. 
                        Her work blends simplicity with emotion, creating wearable art inspired by nature and everyday moments.
                    </p>
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
    
    // 🚀 STEP 1: Identify the Front Image (e.g., "/img/shop1.png")
    const frontImg = incoming?.img || incoming?.image || (incoming?.baseImages ? incoming.baseImages[0] : '/img/mockups/shop1_base_front.png');

    // 🚀 STEP 2: Automatically create the Back Image link
    // This looks for the dot (like .png or .jpg) and inserts "back" before it
    const backImg = frontImg.replace(/(\.[\w\d]+)$/, 'back$1');

   // 🚀 1. Define the "Dictionary" FIRST (Outside the object)
    const colorNames: any = {
        '#E5D3C0': 'Light Cream',
        '#FFFFFF': 'White',
        '#E0D7FF': 'Lavender',
        '#c7d4ee': 'Light Blue',
        '#b0c7a8': 'Sage Green',
        '#fb7185': 'Soft Rose',
        '#475569': 'Slate Gray'
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
            
        shopName: incoming?.shopName || 'Artisa LK',
        displayImage: frontImg,
        img: frontImg, 
        baseImages: incoming?.baseImages || [frontImg, backImg],

        // 🎨 Use the keys from our dictionary for the color dots
        colors: incoming?.colors || Object.keys(colorNames),

        sizes: incoming?.sizes || ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
        descriptionPara1: incoming?.description || "Experience the perfect blend of style...",
        basePrice: incoming?.basePrice || 650,
        designerCharge: incoming?.designerCharge || 350,
        serviceCharge: incoming?.serviceCharge || 200
    };

        // 3. Selection States
        const [selectedColor, setSelectedColor] = useState(incoming?.selectedColor || '#FFFFFF');
        const [selectedSize, setSelectedSize] = useState('M');
        const [currentImgIndex, setCurrentImgIndex] = useState(0);
        const [showPurchaseModal, setShowPurchaseModal] = useState(false);

        // 4. Recommended Products
        const recommendedProducts = [
            { id: 101, title: 'Abstract Lines', price: '1,450', bgColor: '#F1F5F9', img: '/img/shop1.png' }, 
            { id: 102, title: 'Nature Bloom', price: '1,200', bgColor: '#E0EEFF', img: '/img/shop2.png' }, 
            { id: 103, title: 'Midnight Echo', price: '1,300', bgColor: '#F1F5F9', img: '/img/shop3.png' }, 
            { id: 104, title: 'Sunset Minimal', price: '1,100', bgColor: '#E0EEFF', img: '/img/shop4.png' }
        ];

        const handleUpdateCart = () => {
            console.log("Product DNA check:", product);
            // 🛠️ 1. Prepare the updated data
            // This takes the 'product' (Classic Urban Fit) and adds your NEW choices
            const updatedProduct = {
                ...product, // ID, Title, Price, etc.
                _id: (product as any)._id,
                size: selectedSize,   // The 'M', 'L', or 'XL' you just clicked
                color: selectedColor, // The color circle you just clicked
                quantity: 1,
                selected: true
        };

        
        addToCart(updatedProduct);

        //  User Feedback & Redirect
        alert(`Selection saved! Size: ${selectedSize}, Color: ${selectedColor}`);
        navigate('/cart');
    };

    return (
        <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <Sidebar variant="customer" />
            
            <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', width: 'calc(100% - 280px)' }}>
                {/* --- TOP HEADER (Sticky with Back Option) --- */}
                <header className="top-header" style={{ padding: '20px 60px', background: '#0d375b', borderBottom: '1px solid #e2e8f0', width: '100%', position: 'sticky', top: 0, zIndex: 100 }}>
                    <div className="header-left" onClick={() => navigate(-1)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/img/back.png" alt="Back" style={{ width: '27px', filter: 'invert(1)' }} />
                        <span style={{ fontSize: '25px', fontWeight: '400' }}>Back</span>
                    </div>
                </header>

                {/* --- MAIN PRODUCT INFO SECTION --- */}
                <div className="content-wrapper" style={{ padding: '60px', background: 'white' }}>
                    
                    {/* TOP GRID: LEFT (T-SHIRT) vs RIGHT (DETAILS) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start', marginBottom: '60px' }}>
                        
                       {/* --- LEFT VISUALS (Sticky) --- */}
                        <div style={{ position: 'sticky', top: '100px' }}>
                            <div style={{ 
                                borderRadius: '32px', width: '100%', height: '750px', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                overflow: 'hidden', position: 'relative', background: '#f8fafc', 
                                border: '1px solid #e2e8f0', padding: '40px'
                            }}>
                                {/* 🚀 LOGIC: Use Mask/Color Layer ONLY for Men/Women. Kids show original clean image. */}
                                {!product.isKids ? (
                                    <>
                                        <div style={{
                                            position: 'absolute', width: '85%', height: '85%',
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
                                            style={{ width: '95%', height: '95%', objectFit: 'contain', position: 'relative', zIndex: 1, mixBlendMode: 'multiply', filter: 'contrast(1.05) brightness(1.05)' }} 
                                        />
                                    </>
                                ) : (
                                    /* 🚀 Standard Image for Kids (No Mask) */
                                    <img 
                                        src={product.displayImage} 
                                        alt={product.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                    />
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
                            <div>
                                <h1 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 10px 0', lineHeight: 1.1 }}>{product.title}</h1>
                                <p style={{ fontSize: '24px', color: '#64748B', fontStyle: 'italic', marginBottom: '35px' }}>by {product.shopName}</p>
                                <div style={{ fontSize: '48px', fontWeight: '900', color: '#fb0606' }}>
                                   {product.price.startsWith('LKR') ? product.price : `LKR ${product.price}`}
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div style={{ fontSize: '20px', color: '#94A3B8', lineHeight: '1.8', background: '#f8fafc', padding: '25px', borderRadius: '24px' }}>
                                Base T-shirt: <span style={{ color: '#475569', fontWeight: '600' }}>- LKR {product.basePrice.toLocaleString()}.00</span><br />
                                Designer charge: <span style={{ color: '#475569', fontWeight: '600' }}>- LKR {product.designerCharge.toLocaleString()}.00</span><br />
                                Service charge: <span style={{ color: '#475569', fontWeight: '600' }}>- LKR {product.serviceCharge.toLocaleString()}.00</span>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '15px' }}>Product Description</h4>
                                <p style={{ fontSize: '24px', color: '#64748b', lineHeight: '1.7', textAlign: 'justify' }}>{product.descriptionPara1}</p>
                            </div>

                            {/* Color Selection (Restored) */}
                            {!product.isKids && (
                                <div style={{ marginTop: '10px' }}>
                                    <h4 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '25px' }}>Change Color</h4>
                                    <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                                        {product.colors.map((c: string, index: number) => (
                                            <div 
                                                key={index} 
                                                onClick={() => setSelectedColor(c)} 
                                                style={{ 
                                                    width: '45px', height: '45px', borderRadius: '50%', 
                                                    background: c, cursor: 'pointer',
                                                    border: selectedColor === c ? '4px solid #3b82f6' : '1px solid #cbd5e1'
                                                }} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size/Age Selection */}
                            <div>
                                <h4 style={{ fontSize: '30px', fontWeight: '900', marginBottom: '25px', marginTop: '35px' }}>{product.isKids ? "Select Age Group" : "Select Size"}</h4>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    {product.sizes.map((size: string) => (
                                        <button 
                                            key={size} 
                                            onClick={() => setSelectedSize(size)} 
                                            style={{ 
                                                padding: '18px 35px', borderRadius: '20px', fontSize: '20px', fontWeight: '800', 
                                                backgroundColor: selectedSize === size ? '#000' : '#fff', 
                                                color: selectedSize === size ? '#fff' : '#000',
                                                border: '2px solid #e2e8f0', minWidth: '120px', cursor: 'pointer'
                                            }}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Buttons with Correct Text & Navigation */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }}>
                                <ActionButton text="Try Live Preview" onClick={() => navigate('/live-preview', { state: { product, selectedColor, selectedSize } })} />
                                <ActionButton text="Customize Design" />
                                <ActionButton text="Request Designer Edit" onClick={() => navigate(`/request-edit/${product.id}`)} />
                            </div>

                            <button onClick={() => setShowPurchaseModal(true)} style={{ width: '100%', padding: '28px', background: '#000', color: 'white', border: 'none', borderRadius: '24px', fontWeight: '900', fontSize: '26px', cursor: 'pointer', marginTop: '20px' }}>
                                Choose purchase option
                            </button>

                            <DesignerCard />
                        </div>
                    </div>

                   {/* --- REVIEWS SECTION --- */}
                    <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '80px', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '30px' }}>Reviews</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '50px' }}>
                            <span style={{ fontSize: '38px', fontWeight: '800' }}>5.0</span>
                            <div style={{ color: '#000', fontSize: '30px' }}>★★★★★</div>
                        </div>

                        {[
                            { name: "Ramindi Suhurya", date: "Oct 19, 2025", color: "Off White", text: "Loved the design and the soft color blend." },
                            { name: "S. Sachini", date: "Oct 19, 2025", color: "Black", text: "Loved the design and the soft color blend." },
                            { name: "Thiseja Lochi", date: "Oct 19, 2025", color: "Pearl Blue", text: "Loved the design and the soft color blend." }
                        ].map((rev, index) => (
                            <div key={index} style={{ marginBottom: '50px', maxWidth: '1000px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#CBD5E1' }}></div>
                                    <span style={{ fontWeight: '800', fontSize: '24px' }}>{rev.name}</span>
                                    <span style={{ color: '#94A3B8', fontSize: '18px' }}>on {rev.date}</span>
                                </div>
                                <div style={{ color: '#FACC15', fontSize: '22px' }}>{'★★★★★'}</div>
                                <p style={{ margin: '10px 0', fontSize: '18px', color: '#94A3B8', fontStyle: 'italic' }}>Purchased: {rev.color}</p>
                                <p style={{ margin: 0, fontSize: '22px', color: '#475569', lineHeight: '1.6' }}>{rev.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* --- 🟢 YOU MAY ALSO LIKE (CENTERED, RESPONSIVE & CLICKABLE) --- */}
                    <div style={{ 
                        marginTop: '120px', 
                        borderTop: '2px solid #e2e8f0', 
                        paddingTop: '100px', 
                        textAlign: 'center', 
                        paddingBottom: '120px' // Extra space before footer
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', marginBottom: '80px' }}>
                            {/* Left Line: Shorter and slightly lighter for elegance */}
                            <div style={{ width: '150px', height: '2px', background: 'linear-gradient(to left, #cbd5e1, transparent)' }}></div>
                            
                            <h2 style={{ 
                                fontSize: '32px', 
                                fontWeight: '900', 
                                color: '#64748B', 
                                textTransform: 'uppercase', 
                                letterSpacing: '4px',
                                margin: 0
                            }}>
                                You May Also Like
                            </h2>
                            
                            {/* Right Line */}
                            <div style={{ width: '150px', height: '2px', background: 'linear-gradient(to right, #cbd5e1, transparent)' }}></div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'nowrap', width: '100%' }}>
                            {recommendedProducts.map((prod: any) => (
                                <div 
                                    key={prod.id} 
                                    onClick={() => {
                                        // 🚀 Navigate and scroll to top so the new product is visible
                                        navigate(`/product/${prod.id}`, { state: { product: prod } });
                                        window.scrollTo(0, 0);
                                    }} 
                                    style={{ 
                                        background: prod.bgColor, 
                                        borderRadius: '28px', 
                                        padding: '30px', 
                                        width: '320px', 
                                        textAlign: 'left', 
                                        cursor: 'pointer',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.05)', 
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-12px)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.05)';
                                    }}
                                >
                                    <div style={{ 
                                        background: '#fff', 
                                        borderRadius: '20px', 
                                        padding: '20px', 
                                        marginBottom: '20px', 
                                        display: 'flex', 
                                        justifyContent: 'center',
                                        height: '240px' // Fixed height for alignment
                                    }}>
                                        <img src={prod.img} alt={prod.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <h4 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 5px 0', color: '#1e293b' }}>{prod.title}</h4>
                                    <p style={{ fontSize: '18px', color: '#64748B', fontStyle: 'italic' }}>by Artisa LK</p>
                                    <p style={{ fontSize: '26px', fontWeight: '900', color: '#000', marginTop: '15px' }}>
                                        LKR {prod.price.includes('.00') ? prod.price : `${prod.price}.00`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- FULL WIDTH FOOTER --- */}
                <div style={{ width: '100%', background: '#000', marginTop: 'auto' }}>
                    <Footer />
                </div>
            </div>

                {/* MODAL */}
            {showPurchaseModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: 'white', padding: '50px', borderRadius: '32px', width: '600px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '40px' }}>Purchase Options</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
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
                                <h4 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>Buy Full T-shirt</h4>
                                <p style={{ margin: '5px 0', color: '#64748b' }}>Selected: {selectedSize} / {selectedColor}</p>
                                <span style={{ fontWeight: '900', color: '#fb0606', fontSize: '20px' }}>{product.price}</span>
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
                                <h4 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>Digital Design Only</h4>
                                <span style={{ fontWeight: '900', color: '#fb0606', fontSize: '20px' }}>LKR {product.designerCharge}.00</span>
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