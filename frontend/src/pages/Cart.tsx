import React, { useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { useCart } from '../context/CartContext'; // 🚀 Import the global hook
import Header from '../components/Header'; 
import Footer from '../components/Footer';
import MockupPreview from '../components/MockupPreview';

const Cart = () => {
    const navigate = useNavigate();
    
    // 🚀 Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    
    // 🟢 Pull everything from the Global Context
    const { 
        cartItems, 
        toggleSelect, 
        toggleAll, 
        updateQuantity, 
        removeItem 
    } = useCart();

    // 🟢 CALCULATIONS based on global cartItems
    const selectedItems = cartItems.filter((item: any) => item.selected);
    const subtotal = selectedItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const deliveryFee = selectedItems.some((item: any) => item.type === 'physical') ? 300 : 0;
    const total = subtotal + deliveryFee;

    const animationStyle = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-cart { animation: fadeInUp 0.8s ease-out forwards; }
        .btn-hover:hover { transform: scale(1.05); background-color: #164e7a !important; transition: 0.3s; }
    `;

    return (
        <div style={pageWrapper}>
            {/* 🚀 This style tag injects the animation for the empty state */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(40px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-cart-content { 
                    animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; 
                }
                .shopping-btn:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(13, 55, 91, 0.3) !important;
                    background-color: #164e7a !important;
                    transition: all 0.3s ease;
                }
                .header-nudge-wrapper {
                    width: 100%;
                    background-color: #0d375b; /* Ensure the blue background spans full width */
                }
            ` }} />

            {/* --- BLUE HEADER --- */}
            <div style={{ width: '100%', background: '#0d375b' }}>
                <div style={{ paddingLeft: '0px' }}> {/* 🚀 This nudges only the Title/Back button */}
                    <Header mode="title" title="MY CART" />
                </div>
            </div>

            <div style={contentContainer}>
                {/* 🛒 PHYSICAL SECTION */}
                {cartItems.some((i: any) => i.type === 'physical') && (
                    <div style={{ marginBottom: '60px' }}>
                        <div style={blueTableHeader}>
                            <div style={{ flex: 0.4 }}></div> 
                            <div style={{ flex: 3 }}>Product </div>
                            <div style={{ flex: 1.5, textAlign: 'center' }}>Quantity</div>
                            <div style={{ flex: 1, textAlign: 'right' }}>Subtotal</div>
                        </div>
                        <div style={sectionWrapper}>
                            {cartItems.filter((i: any) => i.type === 'physical').map((item: any) => (
                                <div key={item.id + item.size} style={itemRow}>
                                    <div style={checkCell}>
                                        <input type="checkbox" checked={item.selected} onChange={() => toggleSelect(item.id)} style={customCheck} />
                                    </div>
                                    <div style={productCell}>
                                    <div style={{ ...productThumb, overflow: 'hidden', position: 'relative' }}>
                                        {item.frontDesign || item.canvasState ? (
                                            <MockupPreview
                                                mockupSrc={(item.baseImages && item.baseImages[0]) || item.image}
                                                maskSrc={(item.baseImages && item.baseImages[0]) || item.image}
                                                tshirtColor={item.tshirtColor || '#ffffff'}
                                                printArea={item.frontPrintArea}
                                                designSrc={item.frontDesign}
                                                canvasState={item.canvasState}
                                                designScale={item.frontDesignScale || 1.0}
                                                overallScale={1.5} // 🚀 Increased T-shirt size slightly
                                            />
                                        ) : (
                                            <img 
                                                src={
                                                    (item.image || item.img) ? (
                                                        (item.image || item.img).startsWith('/img/') 
                                                            ? (item.image || item.img) 
                                                            : `/img/${item.image || item.img}`
                                                    ) : "/img/placeholder.png"
                                                } 
                                                style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.1)' }} 
                                                alt={item.title} 
                                                onError={(e) => {
                                                    console.error("Failed to load image for:", item.title);
                                                    e.currentTarget.src = "https://via.placeholder.com/150?text=Fix+Path";
                                                }}
                                            />
                                        )}
                                    </div>
                                        
                                        <div style={productInfo}>
                                            <h3 style={itemTitle}>{item.title}</h3>
                                            
                                            {/* 🎨 COLOR: Clickable if not chosen */}
                                            <p style={itemMeta}>
                                                Color: {' '}
                                                <span 
                                                    onClick={() => item.color === 'Choose Color' && navigate(`/product/${item.id}`)}
                                                    style={{ 
                                                        color: item.color === 'Choose Color' ? '#ef4444' : '#64748B',
                                                        fontWeight: item.color === 'Choose Color' ? '800' : '500',
                                                        cursor: item.color === 'Choose Color' ? 'pointer' : 'default',
                                                        textDecoration: item.color === 'Choose Color' ? 'underline' : 'none'
                                                    }}
                                                >
                                                    {item.color}
                                                </span>
                                            </p>

                                            {/* Size Display in Cart.tsx */}
                                                <p style={itemMeta}>
                                                    Size: {' '}
                                                    <span 
                                                        onClick={() => {
                                                            if (item.size === 'Choose Size') {
                                                                // 🚀 This takes the user to the SPECIFIC shirt's page
                                                                navigate(`/product/${item.id}`); 
                                                            }
                                                        }}
                                                        style={{ 
                                                            color: item.size === 'Choose Size' ? '#ef4444' : '#64748B',
                                                            cursor: item.size === 'Choose Size' ? 'pointer' : 'default',
                                                            textDecoration: item.size === 'Choose Size' ? 'underline' : 'none',
                                                            fontWeight: item.size === 'Choose Size' ? '800' : '500'
                                                        }}
                                                    >
                                                        {item.size}
                                                    </span>
                                                </p>
                                            <button 
                                                style={removeLink} 
                                                onClick={() => removeItem(item.id, item.size, item.color)} // 👈 Pass all three!
                                            >
                                                Remove Item
                                            </button>
                                        </div>
                                    </div>
                                    <div style={qtyCell}>
                                        <div style={qtyBox}>
                                            <button onClick={() => updateQuantity(item.id, -1)} style={qtyAction}>-</button>
                                            <span style={qtyValue}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} style={qtyAction}>+</button>
                                        </div>
                                    </div>
                                    <div style={subtotalCell}>LKR {(item.price * item.quantity).toLocaleString()}.00</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                

                {/* 📁 DIGITAL SECTION */}
                {cartItems.some((i: any) => i.type === 'digital') && (
                    <div style={{ marginBottom: '60px' }}>
                        <div style={blueTableHeader}>
                            <div style={{ flex: 0.4 }}></div>
                            <div style={{ flex: 3 }}>Digital Designs (Instant Download)</div>
                            <div style={{ flex: 2.5, textAlign: 'right' }}>Subtotal</div>
                        </div>
                        <div style={sectionWrapper}>
                            {cartItems.filter((i: any) => i.type === 'digital').map((item: any) => (
                                <div key={item.id} style={itemRow}>
                                    <div style={checkCell}>
                                        <input type="checkbox" checked={item.selected} onChange={() => toggleSelect(item.id)} style={customCheck} />
                                    </div>
                                    <div style={productCell}>
                                        <img src={item.image} style={productThumb} alt="Design" />
                                        <img src="/img/pdf.png" style={{ width: '45px', margin: '0 30px' }} alt="PDF" />
                                        <div style={productInfo}>
                                            <h3 style={itemTitle}>{item.title}</h3>
                                            <p style={itemMeta}>High Resolution PNG/SVG Bundle</p>
                                            <button style={removeLink} onClick={() => removeItem(item.id)}>Remove</button>
                                        </div>
                                    </div>
                                    <div style={subtotalCell}>LKR {item.price.toLocaleString()}.00</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

               {/* 🛑 EMPTY STATE (Stacked Layout) */}
                {cartItems.length === 0 && (
                    <div className="animate-cart-content" style={emptyStateWrapper}>
                        {/* 🚀 Using your original local image */}
                        <img 
                            src="/img/empty-cart.png" 
                            alt="Empty Cart" 
                            style={emptyIconAnim} 
                        />
                        
                        <h2 style={emptyTitle}>Your cart is empty</h2>
                        
                        <p style={emptyDesc}>
                            Looks like you haven't added anything to your cart yet. <br />
                            Go ahead and explore our latest designs!
                        </p>
                        
                        <button 
                            className="shopping-btn" 
                            style={startShoppingBtn} 
                            onClick={() => navigate('/customer-dashboard')}
                        >
                            Start Shopping
                        </button>
                    </div>
                )}

                {/* 💰 SUMMARY FOOTER AREA */}
                {cartItems.length > 0 && (
                    <div style={cartSummaryArea}>
                        <div style={selectAllControl}>
                            <input 
                                type="checkbox" 
                                checked={cartItems.length > 0 && cartItems.every((i: any) => i.selected)} 
                                onChange={(e) => toggleAll(e.target.checked)} 
                                style={customCheck} 
                            />
                            <span style={{ fontWeight: 800, fontSize: '16px', marginLeft: '12px', color: '#0d375b' }}>Select All Items</span>
                        </div>
                        <div style={summaryCalculationBox}>
                            <div style={summaryLine}><span>Subtotal ({selectedItems.length} items)</span> <span>LKR {subtotal.toLocaleString()}.00</span></div>
                            <div style={summaryLine}><span>Delivery Fee</span> <span>LKR {deliveryFee.toLocaleString()}.00</span></div>
                            <div style={totalLine}><span>Grand Total</span> <span>LKR {total.toLocaleString()}.00</span></div>
                            <button 
                                style={proceedBtn} 
                                onClick={() => {
                                    // 🛑 Check if ANY selected item still says "Choose"
                                    const hasIncompleteItems = selectedItems.some(
                                        (item: any) => item.size === 'Choose Size' || item.color === 'Choose Color'
                                    );

                                    if (hasIncompleteItems) {
                                        alert("Please select a Size and Color for all items before checking out!");
                                        return;
                                    }

                                    navigate('/checkout', { state: { selectedItems, total } });
                                }}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

// --- STYLES ---
const pageWrapper: React.CSSProperties = { background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", overflowY: 'visible', position: 'relative' };
const contentContainer: React.CSSProperties = { width: '85%', maxWidth: '1200px', margin: '40px auto', flex: '1 0 auto'};
const parallelEmptyWrapper: React.CSSProperties = { display: 'flex',  alignItems: 'center',  justifyContent: 'center',  width: '100%',  gap: '40px', paddingTop: '30px' };

// Image Style
const emptyIconParallel: React.CSSProperties = { width: '220px',  height: 'auto', opacity: 0.9 };
const emptyTextSide: React.CSSProperties = { textAlign: 'left', maxWidth: '400px' };
const emptyTitleParallel: React.CSSProperties = {  fontSize: '32px',   fontWeight: 900,   color: '#0d375b',  marginBottom: '15px', letterSpacing: '-0.5px' };
const emptyDescParallel: React.CSSProperties = { fontSize: '15px',   color: '#64748B',  lineHeight: '1.6',  marginBottom: '30px' };
const startShoppingBtnParallel: React.CSSProperties = { background: '#0d375b', color: '#fff',  padding: '15px 40px',  borderRadius: '10px',  fontSize: '16px', fontWeight: 800,  border: 'none',  cursor: 'pointer',  boxShadow: '0 10px 25px rgba(13, 55, 91, 0.2)'};

const blueHeader: React.CSSProperties = { padding: '20px 8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', background: '#0d375b'};
const backArea: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: '#0d375b' };
const backIcon: React.CSSProperties = { width: '18px', filter: 'brightness(0.2)' };
const cartHeading: React.CSSProperties = { fontSize: '28px', fontWeight: 900, margin: 0, color: '#0d375b', letterSpacing: '-1px' };
const headerIconGroup: React.CSSProperties = { display: 'flex', gap: '20px' };
const headerNudgeStyle: React.CSSProperties = { width: '100%', paddingLeft: '30px', background: '#0d375b'};
const navIcon: React.CSSProperties = { width: '30px', height: '30px', cursor: 'pointer', objectFit: 'contain' };
const blueTableHeader: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '15px 30px', display: 'flex', fontSize: '15px', fontWeight: 700, borderRadius: '12px 12px 0 0' };
const sectionWrapper: React.CSSProperties = { marginBottom: '40px', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 12px 12px', background: '#fff' };
const itemRow: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid #f1f5f9' };
const checkCell: React.CSSProperties = { flex: 0.4 };
const customCheck: React.CSSProperties = { width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0d375b' };
const productCell: React.CSSProperties = { flex: 3, display: 'flex', alignItems: 'center' };
const productThumb: React.CSSProperties = { width: '100px', height: '100px', objectFit: 'contain', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' };
const productInfo: React.CSSProperties = { paddingLeft: '30px' };
const itemTitle: React.CSSProperties = { fontSize: '18px', fontWeight: 800, margin: '0 0 5px', color: '#0d375b' };
const itemMeta: React.CSSProperties = {  fontSize: '13px',  margin: '3px 0',  fontWeight: 500, transition: 'color 0.3s ease' };
const removeLink: React.CSSProperties = { color: '#ef4444', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', fontWeight: 700, marginTop: '10px', padding: 0 };
const qtyCell: React.CSSProperties = { flex: 1.5, display: 'flex', justifyContent: 'center' };
const qtyBox: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px', border: '1.5px solid #e2e8f0', padding: '6px 15px', borderRadius: '8px' };
const qtyAction: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 600, color: '#0d375b' };
const qtyValue: React.CSSProperties = { fontSize: '15px', fontWeight: 800, minWidth: '20px', textAlign: 'center' };
const subtotalCell: React.CSSProperties = { flex: 1, textAlign: 'right', fontWeight: 900, fontSize: '16px', color: '#0d375b' };
const cartSummaryArea: React.CSSProperties = { marginTop: '40px', display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f1f5f9', paddingTop: '40px', paddingBottom: '60px' };
const selectAllControl: React.CSSProperties = { display: 'flex', alignItems: 'flex-start', paddingTop: '8px' };
const summaryCalculationBox: React.CSSProperties = { width: '380px', background: '#f8fafc', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0' };
const summaryLine: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: '#64748B' };
const totalLine: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '22px', fontWeight: 900, color: '#0d375b', borderTop: '2px dashed #cbd5e1', paddingTop: '15px' };
const proceedBtn: React.CSSProperties = { width: '100%', background: '#0d375b', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '16px', fontWeight: 800, marginTop: '25px', cursor: 'pointer', transition: '0.3s' };
const emptyStateWrapper: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 0',};
const emptyIconAnim: React.CSSProperties = { width: '150px', marginBottom: '15px', opacity: 0.9, };
const emptyTitle: React.CSSProperties = { fontSize: '28px', fontWeight: 900, color: '#0d375b', marginBottom: '15px'};
const emptyDesc: React.CSSProperties = { fontSize: '14px', color: '#64748B', maxWidth: '350px', lineHeight: '1.6', marginBottom: '30px'};
const startShoppingBtn: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '15px 40px', borderRadius: '30px', fontSize: '16px', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(13, 55, 91, 0.2)',};
const siteFooter: React.CSSProperties = { background: '#0d375b', padding: '40px 8%', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px' };
const footerLinksGroup: React.CSSProperties = { display: 'flex', gap: '30px', fontWeight: 600 };

export default Cart;