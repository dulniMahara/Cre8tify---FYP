import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MockupPreview from '../components/MockupPreview';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const getEstimateRange = () => {
        const base = new Date();
        const start = new Date(base);
        const end = new Date(base);
        start.setDate(base.getDate() + 5);
        end.setDate(base.getDate() + 7);
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
        return `${start.toLocaleDateString('en-GB', options)} - ${end.toLocaleDateString('en-GB', options)}`;
    };

    const userInfoRaw = localStorage.getItem('userInfo');
    const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;

    const { selectedItems = [], customProduct } = location.state || {};
    
    // Initialize items: either from cart (selectedItems) or from an approved customization
    const initialItems = selectedItems.length > 0 ? selectedItems : (customProduct ? [{
        _id: customProduct._id,
        id: customProduct._id,
        title: customProduct.productName || "Custom Design",
        price: customProduct.price || 1800, // Use price from request or default
        image: customProduct.frontDesign, 
        size: customProduct.size || 'M',
        color: customProduct.color || 'White',
        quantity: 1,
        type: 'physical',
        isCustom: true,
        basePrice: 1200,
        markup: customProduct.designerMarkup || customProduct.markup || (Math.max(0, parseFloat(customProduct.price) - 1200 - 100 - 300)),
        serviceFee: 100,
        customizationFee: 300
    }] : []);

    const [items, setItems] = useState<any[]>(initialItems);

    const [customer, setCustomer] = useState({ 
        name: userInfo?.name || "Sachini Sabdhana", 
        phone: userInfo?.contact || userInfo?.phone || "071 2347869", 
        address: userInfo?.address || "No.520/1, Pitipana North, Homagama.",
        deliveryDate: getEstimateRange() 
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [tempDetails, setTempDetails] = useState({ ...customer });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    
    const baseDeliveryFee = items.some((i: any) => i.type === 'physical') ? 300 : 0;

    useEffect(() => {
        const newSubtotal = items.reduce((acc: number, item: any) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 1;
            return acc + (price * qty);
        }, 0);
        setSubtotal(newSubtotal);
        setTotal(newSubtotal + baseDeliveryFee);
    }, [items, baseDeliveryFee]);

    const updateQty = (id: string, delta: number) => {
        setItems(prev => prev.map(item => 
            (item.id === id || item._id === id) 
                ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
                : item
        ));
    };

    const handleEditSave = () => {
        setCustomer({ ...tempDetails });
        setIsEditModalOpen(false);
    };

    const formatPrice = (num: number) => {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handlePlaceOrder = async () => {
        if (!paymentMethod) { 
            alert("Please select a payment method"); 
            return; 
        }
    
        if (paymentMethod === 'sandbox') {
            navigate('/sandbox-payment', { 
                state: { 
                    totalAmount: total,
                    orderData: { items, customer, total }
                } 
            });
            return;
        }

        try {
            const activeToken = userInfo?.token || localStorage.getItem('token');
            if (!activeToken) {
                alert("Session expired. Please log in again.");
                return;
            }

            const orderData = {
                orderItems: items.map((item: any) => ({
                    name: item.title || item.name || "Custom Design",
                    qty: item.quantity,
                    image: item.image, 
                    price: parseFloat(item.price),
                    size: item.size,
                    color: item.color,
                    tshirtColor: item.tshirtColor,
                    frontDesign: item.frontDesign,
                    frontPrintArea: item.frontPrintArea,
                    canvasState: item.canvasState,
                    frontDesignScale: item.frontDesignScale,
                    baseImages: item.baseImages,
                    product: item._id || item.id 
                })),
                totalPrice: total,
                shippingAddress: customer.address,
                paymentMethod: paymentMethod,
                isPaid: paymentMethod === 'card',
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
                        method: paymentMethod
                    } 
                }); 
            }
        } catch (error: any) {
            alert(`Failed to place order: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div style={pageWrapper}>
            <div style={headerSection}>
                <Header mode="title" title="CHECKOUT" />
            </div>

            <div style={mainContent}>
                {/* Left Column: Details & Items */}
                <div style={leftCol}>
                    <div style={sectionCard}>
                        <div style={sectionHeader}>
                            <div style={stepCircle}>1</div>
                            <h3 style={sectionTitle}>Shipping Details</h3>
                            <button onClick={() => setIsEditModalOpen(true)} style={editBtn}>Edit</button>
                        </div>
                        <div style={shippingBody}>
                            <div style={infoRow}>
                                <span style={infoLabel}>Recipient:</span>
                                <span style={infoValue}>{customer.name}</span>
                            </div>
                            <div style={infoRow}>
                                <span style={infoLabel}>Contact:</span>
                                <span style={infoValue}>{customer.phone}</span>
                            </div>
                            <div style={infoRow}>
                                <span style={infoLabel}>Address:</span>
                                <span style={infoValue}>{customer.address}</span>
                            </div>
                            <div style={deliveryBadge}>
                                Estimated Delivery: <strong>{customer.deliveryDate}</strong>
                            </div>
                        </div>
                    </div>

                    <div style={sectionCard}>
                        <div style={sectionHeader}>
                            <div style={stepCircle}>2</div>
                            <h3 style={sectionTitle}>Order Items</h3>
                        </div>
                        <div style={itemsList}>
                            {items.map((item: any) => (
                                <div key={item.id} style={itemRow}>
                                    <div style={{ ...itemThumb, overflow: 'hidden', position: 'relative' }}>
                                        {item.frontDesign || item.canvasState ? (
                                            <MockupPreview
                                                mockupSrc={(item.baseImages && item.baseImages[0]) || item.image}
                                                maskSrc={(item.baseImages && item.baseImages[0]) || item.image}
                                                tshirtColor={item.tshirtColor || '#ffffff'}
                                                printArea={item.frontPrintArea}
                                                designSrc={item.frontDesign}
                                                canvasState={item.canvasState}
                                                designScale={item.frontDesignScale || 1.0}
                                                overallScale={1.5}
                                            />
                                        ) : (
                                            <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.1)' }} />
                                        )}
                                    </div>
                                    <div style={itemDetails}>
                                        <h4 style={itemLabel}>{item.title}</h4>
                                        <p style={itemSubText}>Size: {item.size} | Color: {item.color}</p>
                                        <div style={qtyControl}>
                                            <button onClick={() => updateQty(item.id, -1)} style={qtyBtn}>-</button>
                                            <span style={qtyValue}>{item.quantity}</span>
                                            <button onClick={() => updateQty(item.id, 1)} style={qtyBtn}>+</button>
                                        </div>
                                    </div>
                                    <div style={itemPriceText}>
                                        LKR {formatPrice(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment & Summary */}
                <div style={rightCol}>
                    <div style={sectionCard}>
                        <div style={sectionHeader}>
                            <div style={stepCircle}>3</div>
                            <h3 style={sectionTitle}>Payment Method</h3>
                        </div>
                        <div style={paymentOptions}>
                            {[
                                { id: 'card', label: 'Credit / Debit Card' },
                                { id: 'bank', label: 'Bank Deposit' },
                                { id: 'sandbox', label: 'Sandbox' }
                            ].map((method) => (
                                <label key={method.id} style={{
                                    ...paymentLabel,
                                    border: paymentMethod === method.id ? '2px solid #0d375b' : '1px solid #e2e8f0',
                                    background: paymentMethod === method.id ? '#f0f7ff' : '#fff'
                                }}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        checked={paymentMethod === method.id} 
                                        onChange={() => setPaymentMethod(method.id)} 
                                        style={{ display: 'none' }}
                                    />
                                    <span style={methodName}>{method.label}</span>
                                    {paymentMethod === method.id && <span style={checkIcon}>✓</span>}
                                </label>
                            ))}
                        </div>

                        {paymentMethod === 'bank' && (
                            <div style={bankInstructions}>
                                <p style={bankTitle}>Bank Details</p>
                                <div style={bankBox}>
                                    BOC - Homagama<br/>
                                    Acc: 1234 5678 9012<br/>
                                    <strong>Total: LKR {formatPrice(total)}</strong>
                                </div>
                                <label style={uploadArea}>
                                    <input type="file" style={{ display: 'none' }} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                                    {selectedFile ? `${selectedFile.name}` : 'Click to upload deposit slip'}
                                </label>
                            </div>
                        )}
                    </div>

                    <div style={summaryCard}>
                        <h3 style={summaryTitle}>Order Summary</h3>
                        <div style={summaryRows}>
                            <div style={summaryRow}><span>Subtotal</span><span>LKR {formatPrice(subtotal)}</span></div>
                            <div style={summaryRow}><span>Delivery Fee</span><span>LKR {formatPrice(baseDeliveryFee)}</span></div>
                            <div style={totalRow}>
                                <span>Grand Total</span>
                                <span>LKR {formatPrice(total)}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handlePlaceOrder} 
                            disabled={paymentMethod === 'bank' && !selectedFile}
                            style={{
                                ...checkoutBtn,
                                opacity: (paymentMethod === 'bank' && !selectedFile) ? 0.5 : 1,
                                cursor: (paymentMethod === 'bank' && !selectedFile) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Place Order Now
                        </button>
                    </div>
                </div>
            </div>

            <Footer />

            {isEditModalOpen && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <h2 style={modalTitle}>Edit Shipping Details</h2>
                        <div style={fieldGroup}>
                            <label style={fieldLabel}>Phone Number</label>
                            <input style={fieldInput} value={tempDetails.phone} onChange={(e) => setTempDetails({ ...tempDetails, phone: e.target.value })} />
                        </div>
                        <div style={fieldGroup}>
                            <label style={fieldLabel}>Delivery Address</label>
                            <textarea style={{ ...fieldInput, height: '100px' }} value={tempDetails.address} onChange={(e) => setTempDetails({ ...tempDetails, address: e.target.value })} />
                        </div>
                        <div style={modalActions}>
                            <button style={saveBtn} onClick={handleEditSave}>Save Changes</button>
                            <button style={cancelBtn} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const pageWrapper: React.CSSProperties = { background: '#f4f7f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" };
const headerSection: React.CSSProperties = { background: '#0d375b' };
const mainContent: React.CSSProperties = { width: '85%', maxWidth: '1200px', margin: '40px auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', flex: 1 };

const leftCol: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '25px' };
const rightCol: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '25px' };

const sectionCard: React.CSSProperties = { background: '#fff', borderRadius: '20px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eef2f6' };
const sectionHeader: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' };
const stepCircle: React.CSSProperties = { width: '28px', height: '28px', background: '#0d375b', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800' };
const sectionTitle: React.CSSProperties = { fontSize: '18px', fontWeight: '800', color: '#0d375b', margin: 0, flex: 1 };
const editBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#3b82f6', fontWeight: '700', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' };

const shippingBody: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };
const infoRow: React.CSSProperties = { display: 'flex', gap: '10px', fontSize: '14px' };
const infoLabel: React.CSSProperties = { color: '#64748b', fontWeight: '600', width: '80px' };
const infoValue: React.CSSProperties = { color: '#1e293b', fontWeight: '700' };
const deliveryBadge: React.CSSProperties = { marginTop: '10px', background: '#f0fdf4', color: '#166534', padding: '10px 15px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', border: '1px solid #bbf7d0' };

const itemsList: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '20px' };
const itemRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '20px', padding: '15px', background: '#f8fafc', borderRadius: '15px' };
const itemThumb: React.CSSProperties = { width: '80px', height: '80px', objectFit: 'contain', background: '#fff', borderRadius: '10px', padding: '5px' };
const itemDetails: React.CSSProperties = { flex: 1 };
const itemLabel: React.CSSProperties = { fontSize: '15px', fontWeight: '800', color: '#0d375b', margin: '0 0 5px 0' };
const itemSubText: React.CSSProperties = { fontSize: '12px', color: '#64748b', margin: 0 };
const qtyControl: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' };
const qtyBtn: React.CSSProperties = { width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: '#e2e8f0', color: '#0d375b', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const qtyValue: React.CSSProperties = { fontSize: '14px', fontWeight: '800', color: '#0d375b' };
const itemPriceText: React.CSSProperties = { fontSize: '16px', fontWeight: '900', color: '#0d375b' };

const paymentOptions: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };
const paymentLabel: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', borderRadius: '15px', cursor: 'pointer', transition: '0.3s', position: 'relative' };
const methodIcon: React.CSSProperties = { fontSize: '20px' };
const methodName: React.CSSProperties = { fontSize: '15px', fontWeight: '700', color: '#1e293b' };
const checkIcon: React.CSSProperties = { marginLeft: 'auto', color: '#0d375b', fontWeight: '900', fontSize: '18px' };

const bankInstructions: React.CSSProperties = { marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '15px', border: '1px dashed #cbd5e1' };
const bankTitle: React.CSSProperties = { fontSize: '14px', fontWeight: '800', color: '#0d375b', marginBottom: '10px' };
const bankBox: React.CSSProperties = { fontSize: '13px', lineHeight: '1.6', color: '#475569', marginBottom: '15px' };
const uploadArea: React.CSSProperties = { display: 'block', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', color: '#0d375b', fontWeight: '700', textAlign: 'center', cursor: 'pointer' };

const summaryCard: React.CSSProperties = { background: '#0d375b', borderRadius: '20px', padding: '30px', color: '#fff', boxShadow: '0 10px 30px rgba(13, 55, 91, 0.2)' };
const summaryTitle: React.CSSProperties = { fontSize: '20px', fontWeight: '800', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' };
const summaryRows: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px' };
const summaryRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: '14px', opacity: 0.8 };
const totalRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: '900', marginTop: '20px', paddingTop: '20px', borderTop: '2px dashed rgba(255,255,255,0.2)' };
const checkoutBtn: React.CSSProperties = { width: '100%', padding: '18px', background: '#fff', color: '#0d375b', border: 'none', borderRadius: '15px', fontSize: '18px', fontWeight: '900', marginTop: '30px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' };

const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent: React.CSSProperties = { background: '#fff', padding: '40px', borderRadius: '24px', width: '450px' };
const modalTitle: React.CSSProperties = { fontSize: '24px', fontWeight: '800', color: '#0d375b', marginBottom: '25px' };
const fieldGroup: React.CSSProperties = { marginBottom: '20px' };
const fieldLabel: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px' };
const fieldInput: React.CSSProperties = { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px' };
const modalActions: React.CSSProperties = { display: 'flex', gap: '15px', marginTop: '30px' };
const saveBtn: React.CSSProperties = { flex: 1, padding: '15px', background: '#0d375b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' };
const cancelBtn: React.CSSProperties = { flex: 1, padding: '15px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' };

export default OrderConfirmation;