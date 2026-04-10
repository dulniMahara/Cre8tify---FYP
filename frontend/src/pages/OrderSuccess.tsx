import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const orderDetails = {
        id: "#CR8-20314",
        status: "Paid",
        date: "28 October 2025"
    };

    return (
        <div style={pageWrapper}>
            {/* 🟢 BLURRED BACKGROUND IMAGE (Using your image) */}
            <div style={blurredBg} />

            {/* 🟢 CONTENT WRAPPER (This sits above the blur) */}
            <div style={fullScreenContent}>
                {/* 🔵 BLUE HEADER (Re-added here so it sits on top) */}
                <header style={blueHeader}>
                    <div style={backArea} onClick={() => navigate(-1)}>
                        <img src="/img/back.png" alt="Back" style={backIcon} />
                        <span>Back</span>
                    </div>
                    <div style={headerIconGroup}>
                        <img src="/img/profile-picture.png" style={navIcon} alt="Profile" />
                        <img src="/img/notifi.png" style={navIcon} alt="Notif" />
                        <img src="/img/shopping-cart.png" style={navIcon} alt="Cart" />
                        <img src="/img/logout.png" style={navIcon} alt="Logout" />
                    </div>
                </header>

                <div style={mainContent}>
                    {/* 🟢 FROSTED GLASS SUCCESS BOX */}
                    <div style={glassSuccessCard}>
                        <div style={imageWrapper}>
                            <img src="/img/shopping.png" alt="Success" style={successImg} />
                        </div>

                        <h1 style={successMessage}>🎉 Order Confirmed Successfully!</h1>

                        <div style={detailsBlock}>
                            <p style={detailText}>Order ID: <span style={boldText}>{orderDetails.id}</span></p>
                            <p style={detailText}>Payment Status: <span style={paidText}>✔ {orderDetails.status}</span></p>
                            <p style={detailText}>Date: <span style={boldText}>{orderDetails.date}</span></p>
                        </div>

                        <p style={thankYouText}>Thank you for your purchase!</p>

                        <div style={actionWrapper}>
                            <button 
                                style={trackBtn} 
                                onClick={() => navigate('/track-order', { 
                                    state: { 
                                        address: location.state?.address, 
                                        customerName: location.state?.customerName,
                                        orderId: "#CR8-20314" // You can also pass the dynamic ID here
                                    } 
                                })}
                            >
                                Track Your Order
                            </button>
                        </div>

                        <div style={dashboardLinkArea} onClick={() => navigate('/buyer-dashboard')}>
                            <span>Back to Dashboard</span>
                            <span style={{ fontSize: '24px', marginLeft: '10px' }}>&gt;</span>
                        </div>
                    </div>
                </div>

                {/* 🔵 FOOTER */}
                <footer style={siteFooter}>
                    <span>Cre8tify • Wear Your Imaginations</span>
                    <div style={footerLinksGroup}>
                        <span>Privacy Policy</span> | <span>Terms & Conditions</span> | <span>FAQ</span>
                    </div>
                    <span>© 2025 Cre8tify</span>
                </footer>
            </div>
        </div>
    );
};

// --- STYLES ---
const pageWrapper: React.CSSProperties = { position: 'relative', minHeight: '100vh', overflow: 'hidden' };

// 🟢 The blurred background layer using your image
const blurredBg: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url(/img/checkerbg.jpg)', // Path to your image
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(15px)', // ⬆️ Apply the blur here
    transform: 'scale(1.1)', // Prevents blurred edges from showing white
    zIndex: 1
};

// 🟢 The content layer that sits above the blur
const fullScreenContent: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, sans-serif'
};

const blueHeader: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '50px 8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const backArea: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: 700, fontSize: '22px' };
const backIcon: React.CSSProperties = { width: '25px', filter: 'brightness(0) invert(1)' };
const headerIconGroup: React.CSSProperties = { display: 'flex', gap: '30px' };
const navIcon: React.CSSProperties = { width: '40px', height: '40px', filter: 'invert(0)', objectFit: 'contain' };

const mainContent: React.CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' };

// 🟢 Glassmorphism Card for the success details
const glassSuccessCard: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.85)', // Semi-transparent white
    backdropFilter: 'blur(5px)', // Adds a slight "frosted" effect to the card itself
    padding: '80px 100px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)', // Soft, premium shadow
    border: '1px solid rgba(255, 255, 255, 0.3)' // Subtle glass edge
};

const imageWrapper: React.CSSProperties = { marginBottom: '40px' };
const successImg: React.CSSProperties = { width: '180px', height: 'auto' };

const successMessage: React.CSSProperties = { fontSize: '38px', fontWeight: 900, color: '#1e1e1e', marginBottom: '35px' };

const detailsBlock: React.CSSProperties = { textAlign: 'center', marginBottom: '40px' };
const detailText: React.CSSProperties = { fontSize: '20px', color: '#444', margin: '8px 0', fontWeight: 500 };
const boldText: React.CSSProperties = { fontWeight: 800, color: '#000' };
const paidText: React.CSSProperties = { fontWeight: 800, color: '#27ae60' };

const thankYouText: React.CSSProperties = { fontSize: '22px', color: '#555', marginBottom: '60px', fontStyle: 'italic' };

const actionWrapper: React.CSSProperties = { width: '100%', display: 'flex', justifyContent: 'center' };
const trackBtn: React.CSSProperties = { background: '#111', color: '#fff', padding: '20px 50px', borderRadius: '5px', border: 'none', fontSize: '20px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.15)' };

const dashboardLinkArea: React.CSSProperties = { marginTop: '70px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '18px', fontWeight: 700, color: '#333' };

const siteFooter: React.CSSProperties = { background: '#0d375b', padding: '60px 8%', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '25px' };
const footerLinksGroup: React.CSSProperties = { display: 'flex', gap: '35px', fontWeight: 500 };

export default OrderSuccess;