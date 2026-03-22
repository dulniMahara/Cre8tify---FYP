import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TrackOrder = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { 
        address = "230/9, Pitipana North, Homagama.", 
        customerName = "Dilara Perera",
        orderId = "#CR8-20314" 
    } = (location.state as any) || {};

    const warehouseLocation = "Lotus Tower, Colombo, Sri Lanka";
    const publicDirectionsUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(warehouseLocation)}&daddr=${encodeURIComponent(address + ", Sri Lanka")}&output=embed&t=m`;
    // 🟢 3. In your JSX, ensure the iframe looks like this:
        <div style={mapContainer}>
            <iframe 
                width="100%" 
                height="350" 
                style={{ border: 0 }} 
                src={publicDirectionsUrl} 
                allowFullScreen 
                loading="lazy" 
            />
        </div>
    
    const steps = [
        { title: "Order Placed", date: "28 Oct 2025 - 10:30 AM", status: "complete", desc: "We've received your order." },
        { title: "Processing", date: "29 Oct 2025 - 09:15 AM", status: "complete", desc: "Item packed at Colombo Hub." },
        { title: "Dispatched", date: "30 Oct 2025 - 02:00 PM", status: "active", desc: "Handled by Cre8tify Logistics." },
        { title: "Out for Delivery", date: "Pending", status: "pending", desc: "Courier is on the way." },
        { title: "Delivered", date: "Expected Dec 10", status: "pending", desc: "Enjoy your purchase!" },
    ];

    return (
        <div style={pageWrapper}>
            {/* 🟢 1. INJECT THE PULSE KEYFRAMES HERE */}
            <style>
                {`
                @keyframes pulse-blue {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.7); }
                    70% { transform: scale(1.15); box-shadow: 0 0 0 15px rgba(52, 152, 219, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
                }
                `}
            </style>

            <header style={blueHeader}>
                <div style={backArea} onClick={() => navigate(-1)}>
                    <img src="/img/back.png" alt="Back" style={backIcon} />
                    <span>Back</span>
                </div>
                <h2 style={headerCenterTitle}>My Orders</h2>
                <div style={headerIconGroup}>
                    <img src="/img/profile-picture.png" style={navIcon} alt="Profile" />
                    <img src="/img/notifi.png" style={navIcon} alt="Notif" />
                    <img src="/img/shopping-cart.png" style={navIcon} alt="Cart" />
                    <img src="/img/logout.png" style={navIcon} alt="Logout" />
                </div>
            </header>

            <div style={contentContainer}>
                <div style={whiteContentBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <h1 style={mainTitle}>Track Order {orderId}</h1>
                        <div style={statusBadge}>In Transit</div>
                    </div>
                    
                    <div style={mainGrid}>
                        <div style={leftPanel}>
                            <div style={timelineContainer}>
                                {steps.map((step, index) => (
                                    <div key={index} style={stepRow}>
                                        <div style={indicatorColumn}>
                                            <div style={{
                                                ...dot, 
                                                background: step.status === 'complete' ? '#2ecc71' : step.status === 'active' ? '#0d375b' : '#ccc',
                                                border: step.status === 'active' ? '4px solid #3498db' : 'none',
                                                // 🟢 2. APPLY THE ANIMATION TO THE ACTIVE STEP
                                                animation: step.status === 'active' ? 'pulse-blue 2s infinite' : 'none'
                                            }}>
                                                {step.status === 'complete' && "✔"}
                                            </div>
                                            {index !== steps.length - 1 && <div style={line} />}
                                        </div>
                                        <div style={textColumn}>
                                            <h4 style={stepTitle}>{step.title}</h4>
                                            <p style={stepDesc}>{step.desc}</p>
                                            <p style={stepDate}>{step.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={rightPanel}>
                            <div style={shippingCard}>
                                <h3 style={sectionHeading}>Delivery Details</h3>
                                <div style={addressBox}>
                                    <p style={{fontWeight: 800, margin: '0 0 5px 0', fontSize: '20px'}}>{customerName}</p>
                                    <p style={{margin: 0, color: '#555', lineHeight: '1.6', fontSize: '18px'}}>{address}</p>
                                </div>
                                <div style={courierSmallInfo}>
                                    <p><strong>Carrier:</strong> Cre8tify Express (Pvt) Ltd</p>
                                    <p><strong>Estimated:</strong> Dec 10 - Dec 17</p>
                                </div>
                                <div style={mapContainer}>
                                    <iframe 
                                        width="100%" 
                                        height="350" 
                                        style={{ border: 0 }} 
                                        src={publicDirectionsUrl} 
                                        allowFullScreen 
                                        loading="lazy" 
                                    />
                                </div>
                            </div>
                            <button style={helpBtn} onClick={() => alert("Connecting to Cre8tify Support...")}>Need Help?</button>
                        </div>
                    </div>
                </div>
            </div>

            <footer style={siteFooter}>
                <span>Cre8tify • Wear Your Imaginations</span>
                <div style={footerLinks}>
                    <span>Privacy Policy</span> | <span>Terms & Conditions</span> | <span>FAQ</span>
                </div>
                <span>© 2025 Cre8tify</span>
            </footer>
        </div>
    );
};

// ... (Rest of your Styles remain the same)
const pageWrapper: React.CSSProperties = { background: '#f4f7f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' };
const blueHeader: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '50px 8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const headerCenterTitle: React.CSSProperties = { fontSize: '32px', fontWeight: 900, margin: 0 };
const backArea: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontWeight: 700, fontSize: '22px' };
const backIcon: React.CSSProperties = { width: '25px', filter: 'brightness(0) invert(1)' };
const headerIconGroup: React.CSSProperties = { display: 'flex', gap: '30px' };
const navIcon: React.CSSProperties = { width: '40px', height: '40px', filter: 'invert(0)', objectFit: 'contain' };
const contentContainer: React.CSSProperties = { width: '85%', margin: '60px auto', flex: 1 };
const whiteContentBox: React.CSSProperties = { background: '#fff', padding: '60px', borderRadius: '30px', boxShadow: '0 15px 40px rgba(0,0,0,0.04)' };
const mainTitle: React.CSSProperties = { fontSize: '36px', fontWeight: 900, color: '#0d375b', margin: 0 };
const statusBadge: React.CSSProperties = { background: '#e3f2fd', color: '#0d47a1', padding: '10px 25px', borderRadius: '50px', fontWeight: 800, fontSize: '18px' };
const mainGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' };
const leftPanel: React.CSSProperties = { paddingRight: '20px' };
const timelineContainer: React.CSSProperties = { display: 'flex', flexDirection: 'column' };
const stepRow: React.CSSProperties = { display: 'flex', gap: '30px', minHeight: '130px' };
const indicatorColumn: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const dot: React.CSSProperties = { width: '40px', height: '40px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, zIndex: 2 };
const line: React.CSSProperties = { width: '4px', flex: 1, background: '#f0f0f0', margin: '5px 0' };
const textColumn: React.CSSProperties = { paddingTop: '0px' };
const stepTitle: React.CSSProperties = { margin: '0 0 5px 0', fontSize: '24px', fontWeight: 800, color: '#333' };
const stepDesc: React.CSSProperties = { margin: '0 0 5px 0', fontSize: '16px', color: '#666', fontWeight: 500 };
const stepDate: React.CSSProperties = { margin: 0, color: '#999', fontSize: '14px', fontWeight: 600 };
const rightPanel: React.CSSProperties = { display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
const shippingCard: React.CSSProperties = { border: '1px solid #eee', borderRadius: '25px', padding: '40px', background: '#fafafa' };
const sectionHeading: React.CSSProperties = { fontSize: '26px', fontWeight: 800, color: '#0d375b', marginBottom: '25px' };
const addressBox: React.CSSProperties = { marginBottom: '25px' };
const courierSmallInfo: React.CSSProperties = { background: '#fff', padding: '15px 20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #f0f0f0', fontSize: '16px' };
const mapContainer: React.CSSProperties = { borderRadius: '20px', overflow: 'hidden', border: '1px solid #ddd', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' };
const helpBtn: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '18px 45px', borderRadius: '50px', border: 'none', fontWeight: 800, fontSize: '18px', cursor: 'pointer', alignSelf: 'flex-end', marginTop: '30px', boxShadow: '0 8px 20px rgba(13, 55, 91, 0.2)' };
const siteFooter: React.CSSProperties = { background: '#0d375b', padding: '60px 8%', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '25px' };
const footerLinks: React.CSSProperties = { display: 'flex', gap: '35px', fontWeight: 500 };

export default TrackOrder;