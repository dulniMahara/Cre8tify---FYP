import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CartItem {
    id: string;
    title: string;
    designer: string;
    price: number;
    quantity: number;
    image: string;
    type: 'physical' | 'digital';
    size: string;
    color: string;
    selected: boolean;
}

const Cart = () => {
    const navigate = useNavigate();
    
    const [cartItems, setCartItems] = useState<CartItem[]>([
        { id: '1', title: 'Purple Butterfly T-shirt', designer: 'Artisa LK', price: 1300, quantity: 1, image: '/img/shop1.png', type: 'physical', size: 'M', color: 'Black', selected: true },
        { id: '2', title: 'Purple Butterfly T-shirt', designer: 'Artisa LK', price: 1300, quantity: 1, image: '/img/shop2.png', type: 'physical', size: 'M', color: 'Black', selected: false },
        { id: '3', title: 'Purple Butterfly T-shirt', designer: 'Artisa LK', price: 1300, quantity: 1, image: '/img/shop1.png', type: 'digital', size: 'M', color: 'Black', selected: true },
    ]);

    // 🟢 CALCULATIONS
    const selectedItems = cartItems.filter(item => item.selected);
    const subtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = selectedItems.some(item => item.type === 'physical') ? 300 : 0;
    const serviceCharge = selectedItems.length > 0 ? 100 : 0;
    const total = subtotal + deliveryFee + serviceCharge;

    // 🟢 HANDLERS
    const toggleSelect = (id: string) => {
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
    };

    const toggleAll = (checked: boolean) => {
        setCartItems(prev => prev.map(item => ({ ...item, selected: checked })));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCartItems(prev => prev.map(item => 
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };

    const removeItem = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div style={pageWrapper}>
            {/* 🟢 MAXIMIZED WHITE HEADER */}
            <header style={whiteHeader}>
                <div style={backArea} onClick={() => navigate(-1)}>
                    <img src="/img/back.png" alt="Back" style={backIcon} />
                    <span>Back</span>
                </div>
                <h1 style={cartHeading}>My Cart</h1>
                <div style={headerIconGroup}>
                    <img src="/img/profile-picture.png" alt="Profile" style={navIcon} />
                    <img src="/img/notifi.png" alt="Notifications" style={navIcon} />
                    <img src="/img/shopping-cart.png" alt="Cart" style={navIcon} />
                    <img src="/img/logout.png" alt="Logout" style={navIcon} />
                </div>
            </header>

            <div style={contentContainer}>
                {/* 🟢 BLUE TABLE HEADER */}
                <div style={blueTableHeader}>
                    <div style={{ flex: 0.4 }}></div> 
                    <div style={{ flex: 3 }}>Product</div>
                    <div style={{ flex: 1.5, textAlign: 'center' }}>Quantity</div>
                    <div style={{ flex: 1, textAlign: 'right' }}>Subtotal</div>
                </div>

                {/* PHYSICAL PRODUCTS */}
                <div style={sectionWrapper}>
                    {cartItems.filter(i => i.type === 'physical').map(item => (
                        <div key={item.id} style={itemRow}>
                            <div style={checkCell}>
                                <input type="checkbox" checked={item.selected} onChange={() => toggleSelect(item.id)} style={customCheck} />
                            </div>
                            <div style={productCell}>
                                <img src={item.image} style={productThumb} alt="Shirt" />
                                <div style={productInfo}>
                                    <h3 style={itemTitle}>{item.title}</h3>
                                    <p style={itemMeta}>Color: {item.color}</p>
                                    <p style={itemMeta}>Size: {item.size}</p>
                                    <button style={removeLink} onClick={() => removeItem(item.id)}>Remove</button>
                                </div>
                            </div>
                            <div style={qtyCell}>
                                <div style={qtyBox}>
                                    <button onClick={() => updateQuantity(item.id, -1)} style={qtyAction}>-</button>
                                    <span style={qtyValue}>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} style={qtyAction}>+</button>
                                </div>
                            </div>
                            <div style={subtotalCell}>LKR {item.price * item.quantity}.00</div>
                        </div>
                    ))}
                </div>

                {/* DIGITAL DESIGNS */}
                <div style={blueTableHeader}>
                    <div style={{ flex: 0.4 }}></div>
                    <div style={{ flex: 3 }}>Digital Designs</div>
                    <div style={{ flex: 2.5, textAlign: 'right' }}>Subtotal</div>
                </div>

                <div style={sectionWrapper}>
                    {cartItems.filter(i => i.type === 'digital').map(item => (
                        <div key={item.id} style={itemRow}>
                            <div style={checkCell}>
                                <input type="checkbox" checked={item.selected} onChange={() => toggleSelect(item.id)} style={customCheck} />
                            </div>
                            <div style={productCell}>
                                <img src={item.image} style={productThumb} alt="Design" />
                                <img src="/img/pdf.png" style={{ width: '45px', margin: '0 30px' }} alt="PDF" />
                                <div style={productInfo}>
                                    <h3 style={itemTitle}>{item.title}</h3>
                                    <button style={removeLink} onClick={() => removeItem(item.id)}>Remove</button>
                                </div>
                            </div>
                            <div style={subtotalCell}>LKR {item.price}.00</div>
                        </div>
                    ))}
                </div>

                {/* SUMMARY FOOTER AREA */}
                <div style={cartSummaryArea}>
                    <div style={selectAllControl}>
                        <input 
                            type="checkbox" 
                            checked={cartItems.length > 0 && cartItems.every(i => i.selected)} 
                            onChange={(e) => toggleAll(e.target.checked)} 
                            style={customCheck} 
                        />
                        <span style={{ fontWeight: 800, fontSize: '22px', marginLeft: '10px' }}>All</span>
                    </div>
                    
                    <div style={summaryCalculationBox}>
                        <div style={summaryLine}>
                            <span>Subtotal ({selectedItems.length} items)</span> 
                            <span>LKR {subtotal}.00</span>
                        </div>
                        <div style={summaryLine}>
                            <span>Delivery Fee</span> 
                            <span>LKR {deliveryFee}.00</span>
                        </div>
                        <div style={summaryLine}>
                            <span>Service Charge</span> 
                            <span>LKR {serviceCharge}.00</span>
                        </div>
                        <div style={totalLine}>
                            <span>Total</span> 
                            <span>LKR {total}.00</span>
                        </div>

                        {/* 🟢 NAVIGATION BUTTON TO OrderConfirmation */}
                        <button 
                            style={proceedBtn} 
                            onClick={() => {
                                if (selectedItems.length === 0) {
                                    alert("Please select at least one item to proceed to checkout!");
                                    return;
                                }
                                navigate('/checkout', { 
                                    state: { 
                                        selectedItems: selectedItems,
                                        totals: { subtotal, deliveryFee, serviceCharge, total }
                                    } 
                                });
                            }}
                        >
                            Proceed to checkout
                        </button>
                    </div>
                </div>
            </div>

            {/* 🟢 MAXIMIZED FOOTER */}
            <footer style={siteFooter}>
                <span>Cre8tify • Wear Your Imaginations</span>
                <div style={footerLinksGroup}>
                    <span>Privacy Policy</span> | <span>Terms & Conditions</span> | <span>FAQ</span>
                </div>
                <span>© 2025 Cre8tify</span>
            </footer>
        </div>
    );
};

// --- STYLES (Your Custom Maximized Values) ---
const pageWrapper: React.CSSProperties = { background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' };
const whiteHeader: React.CSSProperties = { padding: '30px 8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #eee' };
const backArea: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '18px', color: '#333' };
const backIcon: React.CSSProperties = { width: '22px' };
const cartHeading: React.CSSProperties = { fontSize: '38px', fontWeight: 900, margin: 0, color: '#333', letterSpacing: '-1px' };
const headerIconGroup: React.CSSProperties = { display: 'flex', gap: '30px' };
const navIcon: React.CSSProperties = { width: '38px', height: '38px', cursor: 'pointer', objectFit: 'contain' };
const contentContainer: React.CSSProperties = { width: '80%', margin: '60px auto', flex: 1 };
const blueTableHeader: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '20px 35px', display: 'flex', fontSize: '22px', fontWeight: 700, borderRadius: '8px 8px 0 0', letterSpacing: '0.5px' };
const sectionWrapper: React.CSSProperties = { marginBottom: '50px', border: '1.5px solid #eee', borderTop: 'none', borderRadius: '0 0 12px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' };
const itemRow: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: '40px 35px', borderBottom: '1px solid #f0f0f0' };
const checkCell: React.CSSProperties = { flex: 0.4 };
const customCheck: React.CSSProperties = { width: '28px', height: '28px', cursor: 'pointer', accentColor: '#0d375b' };
const productCell: React.CSSProperties = { flex: 3, display: 'flex', alignItems: 'center' };
const productThumb: React.CSSProperties = { width: '130px', height: '130px', objectFit: 'contain', background: '#fcfcfc', borderRadius: '12px' };
const productInfo: React.CSSProperties = { paddingLeft: '35px' };
const itemTitle: React.CSSProperties = { fontSize: '24px', fontWeight: 800, margin: '0 0 8px', color: '#0d375b' };
const itemMeta: React.CSSProperties = { fontSize: '16px', color: '#666', margin: '4px 0', fontWeight: 500 };
const removeLink: React.CSSProperties = { color: '#e74c3c', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px', fontWeight: 700, padding: '10px 0' };
const qtyCell: React.CSSProperties = { flex: 1.5, display: 'flex', justifyContent: 'center' };
const qtyBox: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '20px', border: '1.5px solid #ddd', padding: '8px 20px', borderRadius: '4px' };
const qtyAction: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', fontWeight: 600, color: '#333' };
const qtyValue: React.CSSProperties = { fontSize: '20px', fontWeight: 700, minWidth: '25px', textAlign: 'center' };
const subtotalCell: React.CSSProperties = { flex: 1, textAlign: 'right', fontWeight: 800, fontSize: '22px', color: '#0d375b' };
const cartSummaryArea: React.CSSProperties = { marginTop: '60px', display: 'flex', justifyContent: 'space-between', borderTop: '3px solid #f0f0f0', paddingTop: '60px' };
const selectAllControl: React.CSSProperties = { display: 'flex', alignItems: 'center' };
const summaryCalculationBox: React.CSSProperties = { width: '500px' };
const summaryLine: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '22px', fontWeight: 600, color: '#1e1e1e' };
const totalLine: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '30px', fontWeight: 900, color: '#0d375b', borderTop: '1px solid #dedcdc', paddingTop: '15px' };
const proceedBtn: React.CSSProperties = { width: '100%', background: '#0d375b', color: '#fff', border: 'none', padding: '22px', borderRadius: '60px', fontSize: '25px', fontWeight: 700, marginTop: '35px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(13, 55, 91, 0.2)' };
const siteFooter: React.CSSProperties = { background: '#0d375b', padding: '60px 8%', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '25px' };
const footerLinksGroup: React.CSSProperties = { display: 'flex', gap: '35px', fontWeight: 500 };

export default Cart;

