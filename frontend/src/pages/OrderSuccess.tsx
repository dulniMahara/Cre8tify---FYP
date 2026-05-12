import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../utils/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId, address, customerName, phone, createdAt, method, isDigitalOnly } = location.state || {};

    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        if (isDigitalOnly && method === 'bank' && orderId) {
            const checkStatus = async () => {
                try {
                    const token = getToken('customer');
                    if (!token) return;
                    const { data } = await axios.get('http://localhost:5000/api/orders/myorders', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const matchedOrder = data.find((o: any) => o._id.toUpperCase().endsWith(orderId.toUpperCase()));
                    if (matchedOrder && matchedOrder.status === 'Approved') {
                        setIsApproved(true);
                    }
                } catch (e) {
                    console.error("Failed to check status", e);
                }
            };
            checkStatus();
        }
    }, [isDigitalOnly, method, orderId]);

    // Fallback if data is missing (e.g. direct URL access)
    const displayId = orderId || "CR8-" + Math.floor(10000 + Math.random() * 90000);
    const displayDate = createdAt ? new Date(createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div style={pageWrapper}>
            <div style={headerNudge}>
                <Header mode="title" title="SUCCESS" />
            </div>

            <div style={mainContainer}>
                <div style={successCard}>
                    {/* Success Icon Animation Wrapper */}
                    <div style={iconWrapper}>
                        <div style={circleBg}>
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <div style={confetti}>🎉</div>
                    </div>

                    <h1 style={mainTitle}>Order Placed Successfully!</h1>
                    <p style={subTitle}>Thank you for your purchase, <span style={highlight}>{customerName || 'Customer'}</span>!</p>

                    <div style={detailsBox}>
                        <div style={detailRow}>
                            <span style={detailLabel}>Order ID</span>
                            <span style={detailValue}>#{displayId}</span>
                        </div>
                        <div style={detailRow}>
                            <span style={detailLabel}>Payment Status</span>
                            <span style={{ ...detailValue, color: '#16a34a' }}>● Paid</span>
                        </div>
                        <div style={detailRow}>
                            <span style={detailLabel}>Date</span>
                            <span style={detailValue}>{displayDate}</span>
                        </div>
                        <div style={detailRow}>
                            <span style={detailLabel}>Payment Method</span>
                            <span style={detailValue}>{method === 'sandbox' ? 'Sandbox' : method === 'bank' ? 'Bank Deposit' : 'Credit Card'}</span>
                        </div>
                    </div>

                    {!isDigitalOnly && (
                        <div style={shippingInfo}>
                            <p style={shippingTitle}>Shipping To:</p>
                            <p style={shippingText}>{address || 'Your registered address'}</p>
                        </div>
                    )}

                    <div style={actionButtons}>
                        {isDigitalOnly ? (
                            <button 
                                style={primaryBtn} 
                                onClick={() => {
                                    if (method === 'bank' && !isApproved) {
                                        alert("Your digital design will be available for download on your dashboard once an admin verifies your bank payment.");
                                    } else {
                                        alert("Your high-resolution PDF design is downloading...");
                                    }
                                }}
                            >
                                {(method === 'bank' && !isApproved) ? 'Pending Verification' : 'Download Design (PDF)'}
                            </button>
                        ) : (
                            <button 
                                style={primaryBtn} 
                                onClick={() => navigate('/track-order', { state: { address, customerName, orderId: displayId } })}
                            >
                                Track Your Order
                            </button>
                        )}
                        <button 
                            style={secondaryBtn} 
                            onClick={() => navigate('/customer-dashboard')}
                        >
                            Continue Shopping
                        </button>
                    </div>

                    <p style={footerNote}>A confirmation email has been sent to your inbox.</p>
                </div>
            </div>

            <Footer />

            <style>{`
                @keyframes bounceIn {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); opacity: 1; }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
            <style dangerouslySetInnerHTML={{ __html: `
                header {
                    left: 0 !important;
                }
            ` }} />
        </div>
    );
};

// --- STYLES ---
const pageWrapper: React.CSSProperties = { background: '#f4f7f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" };
const headerNudge: React.CSSProperties = { background: '#0d375b' };
const mainContainer: React.CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '130px 20px 60px 20px' };

const successCard: React.CSSProperties = { background: '#fff', padding: '50px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '550px', width: '100%', border: '1px solid #eef2f6', animation: 'bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)' };

const iconWrapper: React.CSSProperties = { position: 'relative', display: 'inline-block', marginBottom: '30px' };
const circleBg: React.CSSProperties = { width: '100px', height: '100px', background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)' };
const confetti: React.CSSProperties = { position: 'absolute', top: '-10px', right: '-10px', fontSize: '32px', animation: 'float 3s ease-in-out infinite' };

const mainTitle: React.CSSProperties = { fontSize: '28px', fontWeight: '900', color: '#0d375b', marginBottom: '10px' };
const subTitle: React.CSSProperties = { fontSize: '16px', color: '#64748b', marginBottom: '35px' };
const highlight: React.CSSProperties = { color: '#0d375b', fontWeight: '800' };

const detailsBox: React.CSSProperties = { background: '#f8fafc', padding: '25px', borderRadius: '20px', marginBottom: '25px', border: '1px solid #e2e8f0' };
const detailRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' };
const detailLabel: React.CSSProperties = { color: '#64748b', fontWeight: '600' };
const detailValue: React.CSSProperties = { color: '#1e293b', fontWeight: '800' };

const shippingInfo: React.CSSProperties = { marginBottom: '40px', textAlign: 'left', paddingLeft: '10px', borderLeft: '4px solid #e2e8f0' };
const shippingTitle: React.CSSProperties = { fontSize: '13px', fontWeight: '800', color: '#64748b', margin: '0 0 5px 0', textTransform: 'uppercase' };
const shippingText: React.CSSProperties = { fontSize: '14px', color: '#334155', margin: 0, fontWeight: '500', lineHeight: '1.5' };

const actionButtons: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };
const primaryBtn: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '18px', borderRadius: '15px', border: 'none', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 20px rgba(13, 55, 91, 0.2)', transition: '0.3s' };
const secondaryBtn: React.CSSProperties = { background: '#fff', color: '#0d375b', padding: '16px', borderRadius: '15px', border: '2px solid #0d375b', fontSize: '16px', fontWeight: '800', cursor: 'pointer', transition: '0.3s' };

const footerNote: React.CSSProperties = { marginTop: '30px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' };

export default OrderSuccess;