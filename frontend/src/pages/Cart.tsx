import React from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { useCart } from '../context/CartContext'; // 🚀 Import the global hook
import Header from '../components/Header'; 
import Footer from '../components/Footer';

const Cart = () => {
    const navigate = useNavigate();
    
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
    const serviceCharge = selectedItems.length > 0 ? 100 : 0;
    const total = subtotal + deliveryFee + serviceCharge;

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
                                        <img 
                                            src={
                                                // 1. Try the full path if it exists
                                                (item.image || item.img) ? (
                                                    // If the path already starts with /img/, use it. 
                                                    // If not, add /img/ to the start.
                                                    (item.image || item.img).startsWith('/img/') 
                                                        ? (item.image || item.img) 
                                                        : `/img/${item.image || item.img}`
                                                ) : "/img/placeholder.png"
                                            } 
                                            style={productThumb} 
                                            alt={item.title} 
                                            onError={(e) => {
                                                // Absolute fallback to show which filename is failing
                                                console.error("Failed to load image for:", item.title);
                                                e.currentTarget.src = "https://via.placeholder.com/150?text=Fix+Path";
                                            }}
                                        />
                                        
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
                            <span style={{ fontWeight: 800, fontSize: '22px', marginLeft: '15px', color: '#0d375b' }}>Select All Items</span>
                        </div>
                        <div style={summaryCalculationBox}>
                            <div style={summaryLine}><span>Subtotal ({selectedItems.length} items)</span> <span>LKR {subtotal.toLocaleString()}.00</span></div>
                            <div style={summaryLine}><span>Delivery Fee</span> <span>LKR {deliveryFee.toLocaleString()}.00</span></div>
                            <div style={summaryLine}><span>Service Charge</span> <span>LKR {serviceCharge.toLocaleString()}.00</span></div>
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
            
            <Footer/>
        </div>
    );
};

// --- STYLES ---
const pageWrapper: React.CSSProperties = { background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", overflowY: 'visible', position: 'relative' };
const contentContainer: React.CSSProperties = { width: '85%', maxWidth: '1400px', margin: '220px auto', flex: '1 0 auto'};
const parallelEmptyWrapper: React.CSSProperties = { display: 'flex',  alignItems: 'center',  justifyContent: 'center',  width: '100%',  gap: '60px', paddingTop: '40px' };

// Image Style
const emptyIconParallel: React.CSSProperties = { width: '320px',  height: 'auto', opacity: 0.9 };
const emptyTextSide: React.CSSProperties = { textAlign: 'left', maxWidth: '550px' };
const emptyTitleParallel: React.CSSProperties = {  fontSize: '48px',   fontWeight: 900,   color: '#0d375b',  marginBottom: '20px', letterSpacing: '-1px' };
const emptyDescParallel: React.CSSProperties = { fontSize: '22px',   color: '#64748B',  lineHeight: '1.6',  marginBottom: '40px' };
const startShoppingBtnParallel: React.CSSProperties = { background: '#0d375b', color: '#fff',  padding: '22px 60px',  borderRadius: '12px',  fontSize: '22px', fontWeight: 800,  border: 'none',  cursor: 'pointer',  boxShadow: '0 10px 25px rgba(13, 55, 91, 0.2)'};

const blueHeader: React.CSSProperties = { padding: '30px 8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', background: '#0d375b'};
const backArea: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '18px', color: '#0d375b' };
const backIcon: React.CSSProperties = { width: '22px', filter: 'brightness(0.2)' };
const cartHeading: React.CSSProperties = { fontSize: '42px', fontWeight: 900, margin: 0, color: '#0d375b', letterSpacing: '-1.5px' };
const headerIconGroup: React.CSSProperties = { display: 'flex', gap: '30px' };
const headerNudgeStyle: React.CSSProperties = { width: '100%', paddingLeft: '40px', background: '#0d375b'};
const navIcon: React.CSSProperties = { width: '38px', height: '38px', cursor: 'pointer', objectFit: 'contain' };
const blueTableHeader: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '24px 40px', display: 'flex', fontSize: '22px', fontWeight: 700, borderRadius: '16px 16px 0 0' };
const sectionWrapper: React.CSSProperties = { marginBottom: '50px', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 16px 16px', background: '#fff' };
const itemRow: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: '40px', borderBottom: '1px solid #f1f5f9' };
const checkCell: React.CSSProperties = { flex: 0.4 };
const customCheck: React.CSSProperties = { width: '28px', height: '28px', cursor: 'pointer', accentColor: '#0d375b' };
const productCell: React.CSSProperties = { flex: 3, display: 'flex', alignItems: 'center' };
const productThumb: React.CSSProperties = { width: '150px', height: '150px', objectFit: 'contain', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' };
const productInfo: React.CSSProperties = { paddingLeft: '40px' };
const itemTitle: React.CSSProperties = { fontSize: '26px', fontWeight: 800, margin: '0 0 10px', color: '#0d375b' };
const itemMeta: React.CSSProperties = {  fontSize: '18px',  margin: '5px 0',  fontWeight: 500, transition: 'color 0.3s ease' };
const removeLink: React.CSSProperties = { color: '#ef4444', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '16px', fontWeight: 700, marginTop: '15px', padding: 0 };
const qtyCell: React.CSSProperties = { flex: 1.5, display: 'flex', justifyContent: 'center' };
const qtyBox: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '25px', border: '2px solid #e2e8f0', padding: '10px 25px', borderRadius: '12px' };
const qtyAction: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '26px', fontWeight: 600, color: '#0d375b' };
const qtyValue: React.CSSProperties = { fontSize: '22px', fontWeight: 800, minWidth: '30px', textAlign: 'center' };
const subtotalCell: React.CSSProperties = { flex: 1, textAlign: 'right', fontWeight: 900, fontSize: '24px', color: '#0d375b' };
const cartSummaryArea: React.CSSProperties = { marginTop: '80px', display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f1f5f9', paddingTop: '60px', paddingBottom: '100px' };
const selectAllControl: React.CSSProperties = { display: 'flex', alignItems: 'flex-start', paddingTop: '10px' };
const summaryCalculationBox: React.CSSProperties = { width: '550px', background: '#f8fafc', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const summaryLine: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginBottom: '18px', fontSize: '20px', fontWeight: 600, color: '#64748B' };
const totalLine: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginTop: '25px', fontSize: '32px', fontWeight: 900, color: '#0d375b', borderTop: '2px dashed #cbd5e1', paddingTop: '20px' };
const proceedBtn: React.CSSProperties = { width: '100%', background: '#0d375b', color: '#fff', border: 'none', padding: '24px', borderRadius: '16px', fontSize: '24px', fontWeight: 800, marginTop: '40px', cursor: 'pointer', transition: '0.3s' };
const emptyStateWrapper: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '200px',};
const emptyIconAnim: React.CSSProperties = { width: '220px', marginBottom: '20px', opacity: 0.9, };
const emptyTitle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, color: '#0d375b', marginBottom: '20px'};
const emptyDesc: React.CSSProperties = { fontSize: '20px', color: '#64748B', maxWidth: '500px', lineHeight: '1.6', marginBottom: '50px'};
const startShoppingBtn: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '22px 60px', borderRadius: '50px', fontSize: '22px', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(13, 55, 91, 0.2)',};
const siteFooter: React.CSSProperties = { background: '#0d375b', padding: '60px 8%', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '22px' };
const footerLinksGroup: React.CSSProperties = { display: 'flex', gap: '40px', fontWeight: 600 };

export default Cart;