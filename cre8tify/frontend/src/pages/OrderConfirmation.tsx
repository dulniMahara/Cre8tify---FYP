import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // 🟢 Dynamic Items from Cart
    const { selectedItems = [] } = location.state || {};
    const [items, setItems] = useState<any[]>(selectedItems);

    // 🟢 Customer & Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [customer, setCustomer] = useState({ 
        name: "Dilara Perera", 
        phone: "+94 771188225", 
        address: "230/9, Pitipana North, Homagama.",
        deliveryDate: "Dec 10 - 17" 
    });
    const [tempDetails, setTempDetails] = useState({ ...customer });
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

    // 🟢 Card Input States with Masking
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [savedCard, setSavedCard] = useState<string | null>(null);

    // 🟢 Input Handlers (Masking & Limits)
    const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 16);
        setCardNumber(val.replace(/(\d{4})(?=\d)/g, '$1 ')); // Format 0000 0000...
    };

    const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
        setExpiry(val);
    };

    const handleCvv = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCvv(e.target.value.replace(/\D/g, '').substring(0, 4));
    };

    // 🟢 Logic Handlers
    const updateItemQuantity = (id: string, delta: number) => {
        setItems(prev => prev.map(item => 
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };

    const handleEditSave = () => {
        setCustomer({ ...tempDetails });
        setIsEditModalOpen(false);
    };

    const handleAddCard = () => {
        if (cardNumber.length < 19) { // 16 digits + 3 spaces
            alert("Please enter a valid card number.");
            return;
        }
        setSavedCard(`Visa ending in ${cardNumber.slice(-4)}`);
        setPaymentMethod('card');
        setIsCardModalOpen(false);
    };

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = items.some(i => i.type === 'physical') ? 300 : 0;
    const serviceCharge = items.length > 0 ? 100 : 0;
    const total = subtotal + deliveryFee + serviceCharge;

    return (
        <>
            <div style={{ ...pageWrapper, filter: (isEditModalOpen || isCardModalOpen) ? 'blur(10px)' : 'none' }}>
                <header style={blueHeader}>
                    <div style={backArea} onClick={() => navigate('/cart')}>
                        <img src="/img/back.png" alt="Back" style={backIcon} />
                        <span>Back</span>
                    </div>
                    <h1 style={headerTitle}>Order Confirmation</h1>
                    <div style={headerIconGroup}>
                        <img src="/img/profile-picture.png" style={navIcon} alt="Profile" />
                        <img src="/img/notifi.png" style={navIcon} alt="Notif" />
                        <img src="/img/shopping-cart.png" style={navIcon} alt="Cart" />
                        <img src="/img/logout.png" style={navIcon} alt="Logout" />
                    </div>
                </header>

                <div style={contentContainer}>
                    <section style={detailsSection}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={customerName}>{customer.name}   {customer.phone}</h3>
                                <p style={customerAddress}>{customer.address}</p>
                                <p style={deliveryEstimate}>Estimated Delivery : {customer.deliveryDate}</p>
                            </div>
                            <button style={editDetailsBtn} onClick={() => setIsEditModalOpen(true)}>Edit Details</button>
                        </div>
                    </section>

                    <div style={mainWhiteCard}>
                        <h2 style={cardHeading}>Items' Details</h2>
                        <div style={itemsGrid}>
                            {items.map((item: any) => (
                                <div key={item.id} style={itemSmallCard}>
                                    <div style={stockBadge}>In Stock</div>
                                    <img src={item.image} style={itemImage} alt={item.title} />
                                    <p style={gridPrice}>LKR {item.price}.00</p>
                                    <div style={gridQtyBox}>
                                        <button style={qtyAction} onClick={() => updateItemQuantity(item.id, -1)}>-</button>
                                        <span style={{fontSize: '20px', fontWeight: 700}}>{item.quantity}</span>
                                        <button style={qtyAction} onClick={() => updateItemQuantity(item.id, 1)}>+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={paymentSummaryWrapper}>
                            <div style={leftPanel}>
                                <h3 style={subHeading}><img src="/img/atm.png" style={iconSmall} alt="Payment" /> Payment Method</h3>
                                <div style={radioGroup}>
                                    <label style={radioLabel}>
                                        <input type="radio" name="payment" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} style={radioInput} /> 
                                        Bank Deposit
                                    </label>
                                    <label style={radioLabel}>
                                        <input type="radio" name="payment" checked={paymentMethod === 'sandbox'} onChange={() => setPaymentMethod('sandbox')} style={radioInput} /> 
                                        Sandbox
                                    </label>
                                    <label style={radioLabel}>
                                        <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => !savedCard ? setIsCardModalOpen(true) : setPaymentMethod('card')} style={radioInput} /> 
                                        {savedCard ? `Saved (${savedCard})` : "Add new card"}
                                        {savedCard && <span onClick={() => setIsCardModalOpen(true)} style={editInline}>Edit</span>}
                                    </label>
                                </div>

                                <div style={{marginTop: '60px'}}>
                                    <h3 style={subHeading}><img src="/img/checkout.png" style={iconSmall} alt="Summary" /> Summary</h3>
                                    <div style={summaryTable}>
                                        <div style={sumRow}><span>Subtotal ({items.length} items) :</span> <span>LKR {subtotal}.00</span></div>
                                        <div style={sumRow}><span>Delivery Fee :</span> <span>LKR {deliveryFee}.00</span></div>
                                        <div style={sumRow}><span>Service Charge :</span> <span>LKR {serviceCharge}.00</span></div>
                                        <div style={totalRow}><span>Total :</span> <span>LKR {total}.00</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                      <div style={{ textAlign: 'center', marginTop: '150px' }}>
                            <button 
                                style={placeOrderBtn} 
                                onClick={() => {
                                    if (!paymentMethod) {
                                        alert("Please select a payment method");
                                        return;
                                    }
                                    // 🟢 Pass the current customer address and name to the Success page
                                    navigate('/order-success', { 
                                        state: { 
                                            address: customer.address, 
                                            customerName: customer.name 
                                        } 
                                    }); 
                                }}
                            >
                                Confirm & Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🟢 ADD NEW CARD MODAL */}
            {isCardModalOpen && (
                <div style={modalOverlay}>
                    <div style={cardModalContent}>
                        <button style={closeX} onClick={() => setIsCardModalOpen(false)}>×</button>
                        <h2 style={cardModalTitle}>Add a new card</h2>
                        <p style={cardSubtitle}>All data is safeguarded</p>

                        <div style={inputGroup}>
                            <label style={fieldLabel}>*Card number</label>
                            <div style={iconInputWrapper}>
                                <img src="/img/credit.png" style={leftIcon} alt="card" />
                                <input type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={handleCardNumber} style={borderlessInput} />
                                <img src="/img/security.png" style={rightIcon} alt="secure" />
                            </div>
                        </div>

                        <div style={{display: 'flex', gap: '30px', marginBottom: '30px'}}>
                            <div style={{flex: 1}}>
                                <label style={fieldLabel}>*Expiration Date</label>
                                <input type="text" placeholder="MM/YY" value={expiry} onChange={handleExpiry} style={borderedInput} />
                            </div>
                            <div style={{flex: 1}}>
                                <label style={fieldLabel}>*CVV</label>
                                <div style={iconInputWrapper}>
                                    <input type="text" placeholder="000" value={cvv} onChange={handleCvv} style={borderlessInput} />
                                    <img src="/img/padlock.png" style={rightIcon} alt="lock" />
                                </div>
                            </div>
                        </div>

                        <div style={billingSection}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <label style={fieldLabel}>*Billing Address</label>
                                <span style={editLinkSmall} onClick={() => { setIsCardModalOpen(false); setIsEditModalOpen(true); }}>Edit</span>
                            </div>
                            <p style={billingText}>{customer.name}, {customer.address}</p>
                        </div>

                        <button style={addCardBtn} onClick={handleAddCard}>{savedCard ? "Update Card" : "Add your card"}</button>
                    </div>
                </div>
            )}

            {/* 🟢 EDIT DETAILS MODAL */}
            {isEditModalOpen && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <h2 style={{color: '#0d375b', marginBottom: '25px', fontSize: '26px', fontWeight: 800}}>Edit Delivery Details</h2>
                        <label style={modalLabel}>Phone Number</label>
                        <input style={modalInput} value={tempDetails.phone} onChange={(e)=>setTempDetails({...tempDetails, phone: e.target.value})} />
                        <label style={modalLabel}>Delivery Address</label>
                        <textarea style={{...modalInput, height: '120px', resize: 'none'}} value={tempDetails.address} onChange={(e)=>setTempDetails({...tempDetails, address: e.target.value})} />
                        <div style={{display: 'flex', gap: '20px', marginTop: '30px'}}>
                            <button style={saveBtn} onClick={handleEditSave}>Save Changes</button>
                            <button style={cancelBtn} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// --- STYLES ---
const pageWrapper: React.CSSProperties = { background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', transition: 'filter 0.3s ease' };
const blueHeader: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '50px 8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const backArea: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: 700, fontSize: '22px' };
const backIcon: React.CSSProperties = { width: '25px', filter: 'brightness(0) invert(1)' };
const headerTitle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, margin: 0 };
const headerIconGroup: React.CSSProperties = { display: 'flex', gap: '30px' };
const navIcon: React.CSSProperties = { width: '40px', height: '40px', filter: 'invert(0)', objectFit: 'contain' };
const contentContainer: React.CSSProperties = { width: '80%', margin: '60px auto', flex: 1 };
const detailsSection: React.CSSProperties = { marginBottom: '50px', borderLeft: '6px solid #3498db', paddingLeft: '25px' };
const customerName: React.CSSProperties = { fontSize: '28px', fontWeight: 800, color: '#0d375b', marginBottom: '10px' };
const customerAddress: React.CSSProperties = { fontSize: '20px', fontWeight: 600, color: '#444' };
const deliveryEstimate: React.CSSProperties = { fontSize: '20px', color: '#666', marginTop: '12px' };
const editDetailsBtn: React.CSSProperties = { background: 'none', border: '1.5px solid #0d375b', color: '#0d375b', padding: '0 20px', height: '55px', lineHeight: '40px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '18px' };
const editInline: React.CSSProperties = { marginLeft: '15px', color: '#3498db', cursor: 'pointer', textDecoration: 'underline', fontSize: '16px' };
const mainWhiteCard: React.CSSProperties = { background: '#fff', padding: '80px', borderRadius: '30px', boxShadow: '0 15px 50px rgba(0,0,0,0.06)', border: '1px solid #f2f2f2' };
const cardHeading: React.CSSProperties = { fontSize: '32px', fontWeight: 800, marginBottom: '50px', color: '#333' };
const itemsGrid: React.CSSProperties = { display: 'flex', gap: '50px', flexWrap: 'wrap', marginBottom: '80px' };
const itemSmallCard: React.CSSProperties = { width: '220px', textAlign: 'center', position: 'relative' };
const stockBadge: React.CSSProperties = { position: 'absolute', top: '0', left: '0', background: '#0d375b', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px 12px', borderRadius: '4px' };
const itemImage: React.CSSProperties = { width: '100%', height: '240px', objectFit: 'contain', background: '#fdfdfd', borderRadius: '15px', marginBottom: '20px', border: '1px solid #f0f0f0' };
const gridPrice: React.CSSProperties = { fontWeight: 800, fontSize: '22px', marginBottom: '15px', color: '#0d375b' };
const gridQtyBox: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '20px', border: '2px solid #eee', padding: '8px 25px', borderRadius: '30px' };
const qtyAction: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', fontWeight: 800, color: '#333' };
const paymentSummaryWrapper: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };
const leftPanel: React.CSSProperties = { width: '100%', maxWidth: '600px' };
const subHeading: React.CSSProperties = { fontSize: '26px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', color: '#0d375b' };
const iconSmall: React.CSSProperties = { width: '32px' };
const radioGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '45px' };
const radioLabel: React.CSSProperties = { fontSize: '20px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' };
const radioInput: React.CSSProperties = { width: '22px', height: '22px', cursor: 'pointer', accentColor: '#0d375b' };
const summaryTable: React.CSSProperties = { width: '100%', paddingLeft: '45px' };
const sumRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '20px', fontWeight: 600, color: '#555' };
const totalRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '36px', fontWeight: 900, color: '#000', borderTop: '1px solid #eee', paddingTop: '20px' };
const placeOrderBtn: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '25px 80px', borderRadius: '8px', border: 'none', fontSize: '24px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 25px rgba(13, 55, 91, 0.25)' };

const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent: React.CSSProperties = { background: '#fff', padding: '50px', borderRadius: '25px', width: '550px', display: 'flex', flexDirection: 'column' };
const modalLabel: React.CSSProperties = { fontWeight: 800, marginBottom: '8px', color: '#0d375b', fontSize: '18px' };
const modalInput: React.CSSProperties = { padding: '15px', marginBottom: '25px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '18px' };
const saveBtn: React.CSSProperties = { flex: 1, background: '#0d375b', color: '#fff', padding: '18px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '20px' };
const cancelBtn: React.CSSProperties = { flex: 1, background: '#eee', color: '#333', padding: '18px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '20px' };

const cardModalContent: React.CSSProperties = { background: '#fff', padding: '60px', borderRadius: '30px', width: '650px', position: 'relative', boxShadow: '0 30px 70px rgba(0,0,0,0.3)' };
const cardModalTitle: React.CSSProperties = { fontSize: '36px', fontWeight: 900, textAlign: 'center', marginBottom: '10px' };
const cardSubtitle: React.CSSProperties = { textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '18px' };
const closeX: React.CSSProperties = { position: 'absolute', top: '25px', right: '30px', background: 'none', border: 'none', fontSize: '35px', cursor: 'pointer', color: '#aaa' };
const inputGroup: React.CSSProperties = { marginBottom: '30px' };
const fieldLabel: React.CSSProperties = { display: 'block', fontWeight: 800, fontSize: '18px', marginBottom: '12px', color: '#333' };
const iconInputWrapper: React.CSSProperties = { display: 'flex', alignItems: 'center', border: '2px solid #eee', borderRadius: '12px', padding: '0 20px', background: '#fff' };
const borderlessInput: React.CSSProperties = { flex: 1, border: 'none', padding: '20px 15px', fontSize: '18px', outline: 'none' };
const borderedInput: React.CSSProperties = { width: '100%', padding: '20px', fontSize: '18px', border: '2px solid #eee', borderRadius: '12px', outline: 'none' };
const leftIcon: React.CSSProperties = { width: '30px', height: 'auto' };
const rightIcon: React.CSSProperties = { width: '24px', height: 'auto' };
const billingSection: React.CSSProperties = { borderTop: '1px solid #eee', marginTop: '20px', paddingTop: '30px' };
const billingText: React.CSSProperties = { color: '#888', fontSize: '18px', marginTop: '10px', lineHeight: '1.6' };
const editLinkSmall: React.CSSProperties = { fontWeight: 800, fontSize: '16px', textDecoration: 'underline', cursor: 'pointer' };
const addCardBtn: React.CSSProperties = { width: '100%', background: '#0d375b', color: '#fff', padding: '22px', borderRadius: '60px', border: 'none', fontSize: '22px', fontWeight: 800, marginTop: '40px', cursor: 'pointer' };

const siteFooter: React.CSSProperties = { background: '#0d375b', padding: '60px 8%', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '25px' };
const footerLinksGroup: React.CSSProperties = { display: 'flex', gap: '35px', fontWeight: 500 };
const returnBtn: React.CSSProperties = { marginTop: '30px', padding: '15px 30px', background: '#0d375b', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '18px' };

export default OrderConfirmation;