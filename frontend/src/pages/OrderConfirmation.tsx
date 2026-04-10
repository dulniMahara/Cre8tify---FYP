import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    
    // 🟢 1. Helper for Dynamic Delivery Date
    const getEstimateRange = () => {
        const base = new Date();
        const start = new Date(base);
        const end = new Date(base);
        start.setDate(base.getDate() + 5);
        end.setDate(base.getDate() + 7);
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
        return `${start.toLocaleDateString('en-GB', options)} - ${end.toLocaleDateString('en-GB', options)}`;
    };

    // 🟢 2. Pull Real User Data
    const userInfoRaw = localStorage.getItem('userInfo');
    const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;

    // 🟢 Dynamic Items from Cart (Restored)
    const { selectedItems = [] } = location.state || {};
    const [items, setItems] = useState<any[]>(selectedItems);

    const [customer, setCustomer] = useState({ 
        name: userInfo?.name || "Sachini Sabdhana", 
        phone: userInfo?.contact || userInfo?.phone || "071 2347869", 
        address: userInfo?.address || "No.520/1, Pitipana North, Homagama.",
        deliveryDate: getEstimateRange() 
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [tempDetails, setTempDetails] = useState({ ...customer });
    const [paymentMethod, setPaymentMethod] = useState('');
    <input 
        type="radio" 
        name="payment" 
        value="bank" 
        onChange={(e) => setPaymentMethod(e.target.value)} 
    />

    // 🟢 Card Input States
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [savedCard, setSavedCard] = useState<string | null>(null);

    // 🟢 Handlers
    const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 16);
        setCardNumber(val.replace(/(\d{4})(?=\d)/g, '$1 '));
    };

    const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
        setExpiry(val);
    };

    const handleCvv = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCvv(e.target.value.replace(/\D/g, '').substring(0, 4));
    };

   const updateQty = (id: string, delta: number) => {
        setItems(prev => prev.map(item => 
            // 🚀 Check if your data uses .id or ._id
            (item.id === id || item._id === id) 
                ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
                : item
        ));
    };

    const handleEditSave = () => {
        setCustomer({ ...tempDetails });
        setIsEditModalOpen(false);
    };

    const handleAddCard = () => {
        if (cardNumber.length < 19) {
            alert("Please enter a valid card number.");
            return;
        }
        setSavedCard(`Visa ending in ${cardNumber.slice(-4)}`);
        setPaymentMethod('card');
        setIsCardModalOpen(false);
    };

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const formatPrice = (num: number) => {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

   // --- 🟢 1. States and Global Constants ---
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    
    // These are your "Master" values. Change them here to change them everywhere.
    const baseDeliveryFee = items.some((i: any) => i.type === 'physical') ? 300 : 0;
    const baseServiceCharge = items.length > 0 ? 100 : 0;

    // --- 🟢 2. The Math logic ---
    useEffect(() => {
        // Calculate the raw price of items
        const newSubtotal = items.reduce((acc: number, item: any) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 1;
            return acc + (price * qty);
        }, 0);

        // Update the states using our master constants
        setSubtotal(newSubtotal);
        setTotal(newSubtotal + baseDeliveryFee + baseServiceCharge);
        
    }, [items, baseDeliveryFee, baseServiceCharge]); 

    // --- 🟢 3. Order Submission ---
    const handlePlaceOrder = async () => {
        if (!paymentMethod) { 
            alert("Please select a payment method"); 
            return; 
        }
    
    // 🚀 NEW: If Sandbox is selected, redirect to the simulation page first
    if (paymentMethod === 'sandbox') {
        navigate('/sandbox-payment', { 
            state: { 
                totalAmount: total,
                orderData: { // Pass the data so the sandbox page can save it after "payment"
                    items,
                    customer,
                    total
                }
            } 
        });
        return;
    }

    // 🏦 BANK DEPOSIT & SAVED CARD FLOW (Existing Backend Logic)
    try {
        const userInfoRaw = localStorage.getItem('userInfo');
        const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
        const activeToken = userInfo?.token || localStorage.getItem('token');

        if (!activeToken) {
            alert("Session expired. Please log out and log in again.");
            return;
        }

        const orderData = {
            orderItems: items.map((item: any) => ({
                name: item.title || item.name || "Custom Design",
                qty: item.quantity,
                image: item.image, 
                price: item.price,
                product: item._id 
            })),
            totalPrice: total,
            shippingAddress: customer.address,
            paymentMethod: paymentMethod,
            // 📝 Optional: If it's a bank deposit, you might want to send a flag
            isPaid: paymentMethod === 'card' ? true : false, 
            status: paymentMethod === 'bank' ? 'Awaiting Verification' : 'Processing'
        };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${activeToken.trim()}`,
            },
        };

        const { data } = await axios.post('http://localhost:5000/api/orders', orderData, config);

        if (data) {
            navigate('/order-success', { 
                state: { 
                    orderId: data._id.substring(data._id.length - 8).toUpperCase(),
                    address: customer.address, 
                    customerName: customer.name,
                    phone: customer.phone,
                    createdAt: data.createdAt,
                    method: paymentMethod // Pass method to show specific instructions on success page
                } 
            }); 
        }
    } catch (error: any) {
        console.error("DETAILED BACKEND ERROR:", error.response?.data || error.message);
        const serverMessage = error.response?.data?.message || "Check if your Backend is running.";
        alert(`Failed to place order: ${serverMessage}`);
    }
};
   return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100%' }}>
        
        {/* 🟢 HEADER: Using the nudge wrapper to match your My Orders page */}
        <div className="header-nudge-wrapper">
            <Header mode="title" title="ORDER CONFIRMATION" />
            <style>{`
                .header-nudge-wrapper header > div:first-child {
                    margin-left: 55px !important;
                }
                div {
                    scrollbar-width: thin;
                    scrollbar-color: #0d375b #f4f7f9;
                }
            `}</style>
        </div>

        {/* --- 📦 MAIN CONTENT (The Big Spacious Cards) --- */}
        <div style={{ width: '92%', margin: '160px auto 40px auto', paddingBottom: '100px' }}>
            
            {/* 👤 CUSTOMER INFO CARD */}
            <div style={{ background: 'white', padding: '45px', borderRadius: '28px', boxShadow: '0 15px 45px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
                <div style={{ borderLeft: '10px solid #0d375b', paddingLeft: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '38px', fontWeight: '900', color: '#0d375b' }}>{customer.name} &nbsp;&nbsp; {customer.phone}</h2>
                        <p style={{ color: '#475569', fontSize: '20px', margin: '12px 0', fontWeight: '500' }}>{customer.address}</p>
                        <p style={{ fontSize: '16px', color: '#94a3b8', fontWeight: '700' }}>Estimated Delivery : {customer.deliveryDate}</p>
                    </div>
                    <button onClick={() => setIsEditModalOpen(true)} style={{ padding: '15px 35px', borderRadius: '15px', border: '3px solid #0d375b', background: 'white', color: '#0d375b', fontSize: '18px', fontWeight: '800', cursor: 'pointer' }}>Edit Details</button>
                </div>
            </div>

            {/* 👕 ITEMS DETAILS (Horizontal Scroll) */}
            <div style={{ background: 'white', padding: '45px', borderRadius: '28px', boxShadow: '0 15px 45px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '30px', fontWeight: '900', color: '#0d375b', marginBottom: '35px' }}>Items' Details</h3>
                <div style={{ display: 'flex', gap: '35px', overflowX: 'auto', paddingBottom: '25px' }}>
                    {items.map((item: any) => (
                        <div key={item.id} style={{ minWidth: '280px', textAlign: 'center', background: '#f8fafc', padding: '30px', borderRadius: '25px', border: '1px solid #e2e8f0' }}>
                            <div style={{ background: 'white', borderRadius: '20px', padding: '25px', marginBottom: '20px', position: 'relative' }}>
                                <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#0d375b', color: 'white', fontSize: '12px', fontWeight: '900', padding: '5px 12px', borderRadius: '8px' }}>IN STOCK</span>
                                <img src={item.image} alt="" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
                            </div>
                            <div style={{ fontWeight: '900', fontSize: '24px', color: '#0d375b', marginBottom: '20px' }}>LKR {formatPrice(item.price)}</div>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                                <button onClick={() => updateQty(item.id, -1)} style={{ width: '50px', height: '50px', borderRadius: '12px', border: 'none', background: '#cbd5e1', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer' }}>-</button>
                                <span style={{ fontSize: '24px', fontWeight: '900', color: '#0d375b' }}>{item.quantity}</span>
                                <button onClick={() => updateQty(item.id, 1)} style={{ width: '50px', height: '50px', borderRadius: '12px', border: 'none', background: '#0d375b', color: 'white', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 💳 PAYMENT & SUMMARY GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
                
                {/* PAYMENT SECTION */}
                <div style={{ background: 'white', padding: '45px', borderRadius: '28px', boxShadow: '0 15px 45px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '30px', fontWeight: '900', color: '#0d375b', marginBottom: '35px' }}>Payment Method</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {['bank', 'sandbox', 'card'].map((method) => (
                            <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '25px', padding: '25px', borderRadius: '20px', border: paymentMethod === method ? '4px solid #0d375b' : '2px solid #f1f5f9', background: paymentMethod === method ? '#f0f7ff' : 'white', cursor: 'pointer' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '4px solid #0d375b', background: paymentMethod === method ? '#0d375b' : 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {paymentMethod === method && <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '50%' }} />}
                                </div>
                                <input type="radio" name="pay" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} style={{ display: 'none' }} />
                                <span style={{ fontSize: '22px', fontWeight: '800', color: '#0d375b' }}>{method === 'bank' ? 'Bank Deposit' : method === 'sandbox' ? 'Sandbox' : 'Add new card'}</span>
                            </label>
                        ))}
                    </div>

                    {/* 🏦 BANK DEPOSIT BOX (Enhanced for clarity) */}
                    {paymentMethod === 'bank' && (
                        <div style={{ marginTop: '30px', padding: '35px', background: '#f8fafc', borderRadius: '25px', border: '3px dashed #0d375b' }}>
                            <h4 style={{ color: '#0d375b', fontSize: '24px', fontWeight: '900', margin: '0 0 15px 0' }}>Bank Transfer Details</h4>
                            <p style={{ fontSize: '18px', color: '#0d375b', marginBottom: '15px' }}>Amount to Transfer: <strong>LKR {formatPrice(total)}</strong></p>
                            <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', fontSize: '18px', lineHeight: '1.8' }}>
                                <strong>Bank:</strong> Bank of Ceylon (BOC)<br/>
                                <strong>Acc:</strong> 1234 5678 9012 | <strong>Branch:</strong> Homagama
                            </div>
                            <div style={{ marginTop: '30px' }}>
                                <span style={{ display: 'block', fontSize: '20px', fontWeight: '800', color: '#0d375b', marginBottom: '15px' }}>
                                    UPLOAD PAYMENT SLIP (IMAGE)
                                </span>
                                
                                <label style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '40px',
                                    border: selectedFile ? '3px solid #10b981' : '3px dashed #cbd5e1', // 🟢 Turns green when file is added
                                    borderRadius: '25px',
                                    background: selectedFile ? '#f0fdf4' : 'white', // 🟢 Light green background when filled
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {selectedFile ? (
                                        /* --- ✅ What shows AFTER selecting a file --- */
                                        <div style={{ animation: 'fadeIn 0.5s ease' }}>
                                            <span style={{ fontSize: '50px' }}>📄</span>
                                            <p style={{ fontSize: '20px', fontWeight: '800', color: '#065f46', margin: '10px 0 5px 0' }}>
                                                File Selected!
                                            </p>
                                            <p style={{ fontSize: '16px', color: '#059669', fontWeight: '600' }}>
                                                {selectedFile.name}
                                            </p>
                                            <span style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}>
                                                Click to change file
                                            </span>
                                        </div>
                                    ) : (
                                        /* --- 📤 What shows BEFORE selecting a file --- */
                                        <>
                                            <span style={{ fontSize: '40px', marginBottom: '10px' }}>📤</span>
                                            <span style={{ fontSize: '20px', fontWeight: '700', color: '#64748b' }}>
                                                Click to upload or drag and drop
                                            </span>
                                            <span style={{ fontSize: '14px', color: '#94a3b8', marginTop: '5px' }}>
                                                PNG, JPG or PDF (MAX. 5MB)
                                            </span>
                                        </>
                                    )}

                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        style={{ display: 'none' }} 
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setSelectedFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* SUMMARY SECTION */}
                <div style={{ background: 'white', padding: '45px', borderRadius: '28px', boxShadow: '0 15px 45px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '30px', fontWeight: '900', color: '#0d375b', marginBottom: '35px' }}>Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', color: '#64748b', fontWeight: '600' }}>
                            <span>Subtotal:</span> <span>LKR {formatPrice(subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', color: '#64748b', fontWeight: '600' }}>
                            <span>Delivery Fee:</span> <span>LKR {formatPrice(baseDeliveryFee)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', color: '#64748b', fontWeight: '600' }}>
                            <span>Service Charge:</span> <span>LKR {formatPrice(baseServiceCharge)}</span>
                        </div>
                        {/* Final Total */}
                        <div style={{ borderTop: '4px solid #f1f5f9', paddingTop: '25px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', color: '#0d375b' }}>
                            <span style={{ fontSize: '48px', fontWeight: '900' }}>Total:</span>
                            <span style={{ fontSize: '48px', fontWeight: '900' }}>LKR {formatPrice(total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '80px' }}>
                <button 
                    onClick={handlePlaceOrder} 
                    // 🔒 The "Bouncer" Logic:
                    // Disable button IF payment is bank AND no file is selected
                    disabled={paymentMethod === 'bank' && !selectedFile}
                    
                    style={{ 
                        padding: '25px 90px', 
                        borderRadius: '20px', 
                        // 🎨 Visual Feedback: Turns grey if disabled, dark blue if ready
                        background: (paymentMethod === 'bank' && !selectedFile) ? '#94a3b8' : '#0d375b', 
                        color: 'white', 
                        fontSize: '28px', 
                        fontWeight: '900', 
                        border: 'none', 
                        // 🚫 Changes cursor to "No Entry" sign if disabled
                        cursor: (paymentMethod === 'bank' && !selectedFile) ? 'not-allowed' : 'pointer', 
                        boxShadow: (paymentMethod === 'bank' && !selectedFile) ? 'none' : '0 20px 40px rgba(13, 55, 91, 0.3)',
                        transition: 'all 0.3s ease',
                        opacity: (paymentMethod === 'bank' && !selectedFile) ? 0.7 : 1
                    }}
                >
                    Confirm & Place Order
                </button>

                {/* 📝 Helpful hint for the user */}
                {paymentMethod === 'bank' && !selectedFile && (
                    <p style={{ color: '#e11d48', marginTop: '15px', fontWeight: '600', fontSize: '18px' }}>
                        ⚠ Please upload your bank deposit slip to enable order placement.
                    </p>
                )}
            </div>
        </div>

        {/* 🟢 FOOTER: Now using the imported component */}
        <Footer />
   
    
        {/* --- 📝 EDIT MODAL --- */}
        {isEditModalOpen && (
            <div style={modalOverlay}>
                <div style={modalContent}>
                    <h2 style={{color: '#0d375b', marginBottom: '25px', fontWeight: 800}}>Edit Delivery Details</h2>
                    <label style={modalLabel}>Phone Number</label>
                    <input style={modalInput} value={tempDetails.phone} onChange={(e)=>setTempDetails({...tempDetails, phone: e.target.value})} />
                    <label style={modalLabel}>Delivery Address</label>
                    <textarea style={{...modalInput, height: '120px'}} value={tempDetails.address} onChange={(e)=>setTempDetails({...tempDetails, address: e.target.value})} />
                    <div style={{display: 'flex', gap: '20px', marginTop: '20px'}}>
                        <button style={saveBtn} onClick={handleEditSave}>Save Changes</button>
                        <button style={cancelBtn} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
};

// --- STYLES (Keep all your existing styles here) ---
const pageWrapper: React.CSSProperties = { background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' };
const blueHeader: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '50px 8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const backArea: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: 700, fontSize: '22px' };
const backIcon: React.CSSProperties = { width: '25px', filter: 'brightness(0) invert(1)' };
const headerTitle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, margin: 0 };
const headerIconGroup: React.CSSProperties = { display: 'flex', gap: '30px' };
const navIcon: React.CSSProperties = { width: '40px', height: '40px' };
const contentContainer: React.CSSProperties = { width: '80%', margin: '60px auto', flex: 1 };
const detailsSection: React.CSSProperties = { marginBottom: '50px', borderLeft: '6px solid #3498db', paddingLeft: '25px' };
const customerName: React.CSSProperties = { fontSize: '28px', fontWeight: 800, color: '#0d375b' };
const customerAddress: React.CSSProperties = { fontSize: '20px', fontWeight: 600, color: '#444' };
const deliveryEstimate: React.CSSProperties = { fontSize: '20px', color: '#666', marginTop: '12px' };
const editDetailsBtn: React.CSSProperties = { background: 'none', border: '1.5px solid #0d375b', color: '#0d375b', padding: '0 20px', height: '55px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 };
const mainWhiteCard: React.CSSProperties = { background: '#fff', padding: '80px', borderRadius: '30px', boxShadow: '0 15px 50px rgba(0,0,0,0.06)', border: '1px solid #f2f2f2' };
const cardHeading: React.CSSProperties = { fontSize: '32px', fontWeight: 800, marginBottom: '50px' };
const itemsGrid: React.CSSProperties = { display: 'flex', gap: '50px', flexWrap: 'wrap', marginBottom: '80px' };
const itemSmallCard: React.CSSProperties = { width: '220px', textAlign: 'center', position: 'relative' };
const stockBadge: React.CSSProperties = { position: 'absolute', top: '0', left: '0', background: '#0d375b', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 };
const itemImage: React.CSSProperties = { width: '100%', height: '240px', objectFit: 'contain', borderRadius: '15px', border: '1px solid #f0f0f0' };
const gridPrice: React.CSSProperties = { fontWeight: 800, fontSize: '22px', margin: '15px 0', color: '#0d375b' };
const gridQtyBox: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '20px', border: '2px solid #eee', padding: '8px 25px', borderRadius: '30px' };
const qtyAction: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', fontWeight: 800 };
const paymentSummaryWrapper: React.CSSProperties = { display: 'flex', flexDirection: 'column' };
const leftPanel: React.CSSProperties = { width: '100%', maxWidth: '600px' };
const subHeading: React.CSSProperties = { fontSize: '26px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', color: '#0d375b' };
const iconSmall: React.CSSProperties = { width: '32px' };
const radioGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '45px' };
const radioLabel: React.CSSProperties = { fontSize: '20px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' };
const radioInput: React.CSSProperties = { width: '22px', height: '22px', accentColor: '#0d375b' };
const summaryTable: React.CSSProperties = { width: '100%', paddingLeft: '45px' };
const sumRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '20px', fontWeight: 600, color: '#555' };
const totalRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '36px', fontWeight: 900, color: '#000', borderTop: '1px solid #eee', paddingTop: '20px' };
const placeOrderBtn: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '25px 80px', borderRadius: '8px', border: 'none', fontSize: '24px', fontWeight: 800, cursor: 'pointer' };
const siteFooter: React.CSSProperties = { background: '#0d375b', padding: '60px 8%', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '25px', marginTop: 'auto' };
const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent: React.CSSProperties = { background: '#fff', padding: '50px', borderRadius: '25px', width: '550px', display: 'flex', flexDirection: 'column' };
const modalLabel: React.CSSProperties = { fontWeight: 800, marginBottom: '8px', color: '#0d375b' };
const modalInput: React.CSSProperties = { padding: '15px', marginBottom: '25px', borderRadius: '10px', border: '1px solid #ddd' };
const saveBtn: React.CSSProperties = { flex: 1, background: '#0d375b', color: '#fff', padding: '18px', border: 'none', borderRadius: '10px', fontWeight: 700 };
const cancelBtn: React.CSSProperties = { flex: 1, background: '#eee', color: '#333', padding: '18px', border: 'none', borderRadius: '10px', fontWeight: 700 };

export default OrderConfirmation;