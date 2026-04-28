import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar'; 
import Footer from '../components/Footer'; 
import Header from '../components/Header'; 
import '../styles/dashboard.css'; 

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🟢 DYNAMIC NAVIGATION LOGIC
    const handleTrackButtonClick = (order) => {
        // 🚀 Always go to /track-order but pass state to differentiate the view
        const userInfoRaw = localStorage.getItem('userInfo');
        const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
        
        navigate('/track-order', { 
            state: { 
                orderId: order._id, 
                address: order.shippingAddress || "No.520/1, Pitipana North, Homagama.", 
                customerName: userInfo?.name || "Customer",
                createdAt: order.createdAt,
                status: order.status, // 🟢 Pass the actual status
                fromMyOrders: true 
            } 
        });
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userInfoRaw = localStorage.getItem('userInfo');
                const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
                const config = {
                    headers: { Authorization: userInfo?.token ? `Bearer ${userInfo.token}` : '' },
                };

                const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
                
                let orderList = [];
                if (data && data.length > 0) {
                    orderList = data;
                } else {
                    // 🔵 FALLBACK DATA: Two Daisy Dream orders
                    orderList = [
                        { _id: 'CR8-4300D', createdAt: '2026-04-24T10:30:00Z', status: 'Processing', totalPrice: 4300, orderItems: [{ name: 'Daisy Dream', image: '/img/girlteen1.png' }] },
                        { _id: 'CR8-7000D', createdAt: '2026-04-02T14:15:00Z', status: 'Delivered', totalPrice: 7000, orderItems: [{ name: 'Daisy Dream', image: '/img/girlteen1.png' }] },
                    ];
                }

                // 🟢 NEWEST FIRST: Sort by createdAt descending
                const sortedOrders = orderList.sort((a, b) => {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

                setOrders(sortedOrders);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: '#f4f7f9', overflow: 'hidden' }}>
            
            {/* 1. SIDEBAR */}
            <Sidebar variant="customer" />

            {/* 2. MAIN SCROLLABLE AREA */}
            <div style={{ 
                flex: 1, 
                marginLeft: '200px', 
                display: 'flex', 
                flexDirection: 'column',
                height: '100vh',
                overflowY: 'auto', // 🚀 SCROLL ENABLED
                position: 'relative'
            }}>
                
                {/* 🟢 HEADER: Using a wrapper to nudge the internal 'Back' button */}
                <div className="header-nudge-wrapper">
                    <Header mode="title" title="MY ORDERS" />
                </div>

                {/* 📦 TABLE SECTION - Lowered for spacing */}
                <main style={{ padding: '100px 40px 60px 40px', flex: 1 }}>
                    
                    <div style={styles.tableCard}>
                        <table style={styles.orderTable}>
                            <thead style={styles.thead}>
                                <tr>
                                    <th style={styles.th}>Item Details</th>
                                    <th style={styles.th}>Order Date</th>
                                    <th style={styles.th}>Delivery Date</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                                <img src={order.orderItems[0].image} style={styles.shirtImg} alt="shirt" />
                                                <div>
                                                    <div style={styles.itemName}>{order.orderItems[0].name}</div>
                                                    <div style={styles.itemPrice}>LKR {order.totalPrice}.00</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.tdCenter}>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td style={styles.tdCenter}>
                                            {(() => {
                                                const start = new Date(order.createdAt);
                                                const end = new Date(order.createdAt);
                                                start.setDate(start.getDate() + 5);
                                                end.setDate(end.getDate() + 7);
                                                const opt = { day: '2-digit', month: 'short' };
                                                return `${start.toLocaleDateString('en-GB', opt)} - ${end.toLocaleDateString('en-GB', opt)}`;
                                            })()}
                                        </td>
                                        <td style={styles.tdCenter}>
                                            <span style={order.status === 'Processing' ? styles.statusProcessing : styles.statusDelivered}>
                                                ● {order.status}
                                            </span>
                                        </td>
                                        <td style={styles.tdCenter}>
                                            <button 
                                                style={styles.trackBtn} 
                                                onClick={() => handleTrackButtonClick(order)}
                                            >
                                                Track Order
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>

                <Footer />
            </div>

            {/* CSS to nudge ONLY the Back option and keep UI clean */}
            <style>{`
                .header-nudge-wrapper header > div:first-child {
                    margin-left: 20px !important;
                }
                /* Smooth scrolling */
                div {
                    scrollbar-width: thin;
                    scrollbar-color: #0d375b #f4f7f9;
                }
            `}</style>
        </div>
    );
};

const styles = {
    tableCard: { 
        backgroundColor: '#fff', 
        borderRadius: '20px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
        overflow: 'hidden',
        margin: '0 auto', 
        maxWidth: '1000px' 
    },
    orderTable: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#0d375b', color: '#fff' },
    th: { padding: '15px', textAlign: 'center', fontSize: '16px', fontWeight: '900' },
    tr: { borderBottom: '2px solid #f0f0f0' },
    td: { padding: '20px 15px', verticalAlign: 'middle', fontSize: '14px', textAlign: 'left' },
    tdCenter: { padding: '20px 15px', verticalAlign: 'middle', fontSize: '14px', textAlign: 'center' },
    shirtImg: { width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover' },
    itemName: { fontWeight: '900', fontSize: '16px', color: '#0d375b', marginBottom: '4px' },
    itemPrice: { color: '#666', fontSize: '14px', fontWeight: '700' },
    trackBtn: { 
        backgroundColor: '#0d375b', 
        color: '#fff', 
        border: 'none', 
        padding: '10px 24px', 
        borderRadius: '30px', 
        cursor: 'pointer', 
        fontWeight: '900', 
        fontSize: '14px' 
    },
    statusDelivered: { color: '#27ae60', fontWeight: '900' },
    statusProcessing: { color: '#f39c12', fontWeight: '900' }
};

export default MyOrders;