import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Header from '../components/Header';
import '../styles/dashboard.css';

const API_URL = "http://localhost:5000";

// Mock Data Interfaces
interface Order {
    id: string;
    item: string;
    date: string;
    earned: string;
    status: 'Completed' | 'Pending' | 'Cancelled';
    img: string;
}

const MySales = () => {
    const navigate = useNavigate();
    const [orderFilter, setOrderFilter] = useState('Today');
    const [chartFilter, setChartFilter] = useState('Last 7 Days');
    const [searchQuery, setSearchQuery] = useState('');


    const orders: Order[] = [
        { id: '#12245', item: 'Neon Waves T-shirt', date: '2 Oct 2025', earned: 'LKR 1300', status: 'Completed', img: '/img/shop4.png' },
        { id: '#12246', item: 'Neon Waves T-shirt', date: '2 Sep 2025', earned: 'LKR 1100', status: 'Completed', img: '/img/shop4.png' },
        { id: '#12247', item: 'Neon Waves T-shirt', date: '2 Oct 2025', earned: 'LKR 1100', status: 'Pending', img: '/img/shop4.png' },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar />

            <style>
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                {`
                    .animate-fade { animation: fadeIn 0.5s ease-out; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                    
                    .glass-search-bar {
                        display: flex;
                        align-items: center;
                        background: rgba(255, 255, 255, 0.15);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        border-radius: 25px;
                        padding: 8px 10px;
                        width: 100%;
                        max-width: 225px;
                        backdrop-filter: blur(4px);
                        transition: all 0.3s ease;
                    }
                    .search-input::placeholder {
                        color: rgba(255, 255, 255, 0.8) !important;
                    }

                    .sales-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 13px; }
                    .sales-table th { 
                        background: #0f172a; color: white; padding: 11px; text-align: left; 
                        font-size: 8px; font-family: 'Inter', sans-serif; letter-spacing: 0.3px; text-transform: uppercase;
                    }
                    .sales-table th:first-child { border-top-left-radius: 8px; }
                    .sales-table th:last-child { border-top-right-radius: 8px; }
                    
                    .sales-table td { 
                        padding: 13px 11px;
                        border-bottom: 1px solid #f1f5f9; 
                        color: #334155; 
                        font-size: 8px;
                        font-weight: 600; 
                        font-family: 'Inter', sans-serif; 
                        background: white;
                    }

                    .filter-btn { padding: 5px 12px; border: 1px solid #e2e8f0; background: white; color: #64748b; cursor: pointer; font-weight: 600; font-size: 7px; transition: 0.2s; }
                    .filter-btn.active { background: #0d375b; color: white; border-color: #0d375b; }

                    .donut-chart {
                        position: relative;
                        width: 100px; height: 100px;
                        border-radius: 50%;
                        display: flex; justify-content: center; alignItems: center;
                        box-shadow: 0 5px 13px rgba(37, 99, 235, 0.1);
                    }
                    .donut-inner {
                        width: 80px; height: 80px;
                        background: #ffffff;
                        border-radius: 50%;
                        display: flex; justify-content: center; alignItems: center;
                        flex-direction: column;
                        z-index: 2;
                    }
                `}
            </style>

            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>

                <Header showCart={false} onSearch={setSearchQuery} />

                <div className="content-wrapper animate-fade" style={{ padding: '20px', flex: 1, maxWidth: '700px', margin: '0 auto', width: '100%' }}>

                    <h2 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                        fontWeight: '700',
                        marginBottom: '18px',
                        color: '#1e293b',
                        display: 'flex', alignItems: 'center', gap: '5px'
                    }}>
                        Track your income and orders 📈
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '13px', marginBottom: '25px' }}>
                        <StatCard title="TOTAL EARNING" value="LKR 9,500.00" icon="💰" />
                        <StatCard title="TOTAL ORDERS" value="8 ORDERS" icon="📦" />
                        <StatCard title="PENDING" value="2 PENDING" icon="⏳" />
                        <StatCard title="THIS MONTH" value="LKR 3,780.00" icon="📅" />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '13px' }}>
                            {['All', 'Today', 'Last 7 Days', 'Last 30 Days', 'This Year'].map(f => (
                                <button key={f} className={`filter-btn ${orderFilter === f ? 'active' : ''}`} onClick={() => setOrderFilter(f)}>{f}</button>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center', fontSize: '8px', fontStyle: 'italic', color: '#64748b', marginBottom: '8px' }}>
                            Viewing: <b>{orderFilter}</b>
                        </div>

                        <div style={{ borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                            <table className="sales-table">
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Date</th>
                                        <th>Earned</th>
                                        <th>Status</th>
                                        <th>Preview</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders
                                        .filter(order => 
                                            order.item.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            order.id.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map((order, i) => (
                                        <tr key={i}>
                                            <td style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                <span style={{ fontWeight: '700', fontSize: '9px', color: '#0f172a' }}>{order.item}</span>
                                                <span style={{ fontSize: '7px', color: '#64748b', fontFamily: 'monospace' }}>{order.id}</span>
                                            </td>
                                            <td style={{ fontSize: '8px' }}>{order.date}</td>
                                            <td style={{ fontWeight: '700', fontSize: '9px', color: '#0f172a' }}>{order.earned}</td>
                                            <td>
                                                <span style={{ padding: '4px 8px', borderRadius: '15px', fontSize: '7px', fontWeight: '700', background: order.status === 'Completed' ? '#dcfce7' : '#fff7ed', color: order.status === 'Completed' ? '#166534' : '#c2410c', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>{order.status}</span>
                                            </td>
                                            <td>
                                                <img src={order.img} alt="Product" style={{ width: '35px', height: '35px', objectFit: 'contain', background: '#f8fafc', borderRadius: '6px', padding: '3px', border: '1px solid #e2e8f0' }} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '13px' }}>
                            {['Today', 'Last 7 Days', 'Last Week', 'Last Month', 'Last Year'].map(f => (
                                <button key={f} className={`filter-btn ${chartFilter === f ? 'active' : ''}`} onClick={() => setChartFilter(f)}>{f}</button>
                            ))}
                        </div>

                        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '30px', color: '#0f172a', textAlign: 'center', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <h3 style={{ fontSize: '12px', fontWeight: '700', fontStyle: 'italic', marginBottom: '5px' }}>Earning Breakdown</h3>
                                <p style={{ fontSize: '8px', color: '#64748b', marginBottom: '25px' }}>Period: {chartFilter}</p>
                                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '30px' }}>
                                    <DonutChart percent={75} value="LKR 6,400" label="Design Revenue" />
                                    <DonutChart percent={25} value="LKR 2,000" label="Customization" />
                                    <DonutChart percent={100} value="LKR 8,400" label="Total Net Earnings" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

// ... (Keep StatCard and DonutChart sub-components exactly as they were)
const StatCard = ({ title, value, icon }: { title: string, value: string, icon: string }) => (
    <div style={{
        background: '#ffffff', padding: '13px', borderRadius: '8px', textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)', color: '#0f172a', border: '1px solid #e2e8f0',
        position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease'
    }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 5px 13px rgba(37, 99, 235, 0.1)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
        <div style={{ width: '28px', height: '28px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', margin: '0 auto 8px', color: '#2563eb' }}>{icon}</div>
        <div style={{ fontSize: '7px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px' }}>{title}</div>
        <div style={{ fontSize: '12px', fontWeight: '800', marginTop: '4px', color: '#0f172a' }}>{value}</div>
    </div>
);

const DonutChart = ({ percent, value, label }: { percent: number, value: string, label: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="donut-chart" style={{ background: `conic-gradient(#2563eb ${percent}%, #eff6ff 0)` }}>
            <div className="donut-inner">
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', fontStyle: 'italic' }}>{value}</div>
                <div style={{ fontSize: '8px', color: '#64748b', marginTop: '3px' }}>{percent}%</div>
            </div>
        </div>
        <div style={{ marginTop: '13px', background: '#f8fafc', padding: '5px 13px', borderRadius: '15px', fontSize: '7px', fontWeight: '600', fontStyle: 'italic', letterSpacing: '0.3px', color: '#334155', border: '1px solid #e2e8f0' }}>{label}</div>
    </div>
);

export default MySales;