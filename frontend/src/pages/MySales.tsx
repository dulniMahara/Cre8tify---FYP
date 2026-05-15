import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Header from '../components/Header';
import '../styles/dashboard.css';

const API_URL = "http://localhost:5000";

interface Sale {
    id: string;
    item: string;
    date: string;
    earned: string;
    status: string;
    img: string;
}

interface Summary {
    totalEarned: number;
    alreadyPaid: number;
    balance: number;
    totalOrders: number;
    thisMonthEarned: number;
    pendingOrders: number;
}

const MySales = () => {
    const navigate = useNavigate();
    const [sales, setSales] = useState<Sale[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [orderFilter, setOrderFilter] = useState('Today');
    const [chartFilter, setChartFilter] = useState('Last 7 Days');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchSales = async () => {
            const storedUser = localStorage.getItem('userInfo');
            if (!storedUser) return;
            const { token } = JSON.parse(storedUser);

            try {
                const res = await fetch(`${API_URL}/api/users/sales`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSales(data.sales);
                    setSummary(data.summary);
                }
            } catch (err) {
                console.error("Failed to fetch sales:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, []);

    const filteredSales = sales.filter(sale => {
        const matchesSearch = sale.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sale.id.toLowerCase().includes(searchQuery.toLowerCase());

        if (orderFilter === 'All') return matchesSearch;

        const saleDate = new Date(sale.date);
        const now = new Date();

        if (orderFilter === 'Today') return matchesSearch && saleDate.toDateString() === now.toDateString();
        if (orderFilter === 'Last 7 Days') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            return matchesSearch && saleDate >= sevenDaysAgo;
        }
        if (orderFilter === 'Last 30 Days') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return matchesSearch && saleDate >= thirtyDaysAgo;
        }
        return matchesSearch;
    });

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
                <Header showCart={false} onSearch={setSearchQuery} userRole="designer" />

                <div style={{ padding: '30px', flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Track your income and orders 📈</h1>
                    </div>

                    {/* Stat Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '35px' }}>
                        <StatCard title="TOTAL EARNING" value={`LKR ${summary?.totalEarned.toLocaleString() || '0'}.00`} icon="💰" color="#2563eb" />
                        <StatCard title="TOTAL ORDERS" value={`${summary?.totalOrders || '0'} ORDERS`} icon="📦" color="#2563eb" />
                        <StatCard title="PENDING" value={`${summary?.pendingOrders || '0'} PENDING`} icon="⏳" color="#2563eb" />
                        <StatCard title="THIS MONTH" value={`LKR ${summary?.thisMonthEarned.toLocaleString() || '0'}.00`} icon="📅" color="#2563eb" />
                    </div>

                    {/* Sales Table Section */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
                            {['All', 'Today', 'Last 7 Days', 'Last 30 Days', 'This Year'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setOrderFilter(f)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        background: orderFilter === f ? '#0d375b' : 'white',
                                        color: orderFilter === f ? 'white' : '#64748b',
                                        border: '1px solid #e2e8f0',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                            Viewing: <b>{orderFilter}</b>
                        </div>

                        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#0f172a' }}>
                                        <th style={{ padding: '15px', color: 'white', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Name</th>
                                        <th style={{ padding: '15px', color: 'white', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                                        <th style={{ padding: '15px', color: 'white', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Earned</th>
                                        <th style={{ padding: '15px', color: 'white', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                        <th style={{ padding: '15px', color: 'white', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preview</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSales.map((sale, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{sale.item}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{sale.id}</div>
                                            </td>
                                            <td style={{ padding: '15px', fontSize: '13px', color: '#334155' }}>{new Date(sale.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '15px', fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{sale.earned}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{
                                                    padding: '5px 12px',
                                                    borderRadius: '15px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    background: sale.status === 'Delivered' ? '#dcfce7' : '#fff7ed',
                                                    color: sale.status === 'Delivered' ? '#166534' : '#c2410c'
                                                }}>{sale.status}</span>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <img src={sale.img} alt="Product" style={{ width: '45px', height: '45px', objectFit: 'contain', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '3px' }} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredSales.length === 0 && !loading && (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No records available for this period.</div>
                            )}
                        </div>
                    </div>

                    {/* Earning Breakdown Section (Restored Arrangement) */}
                    <div style={{ marginTop: '50px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
                            {['Today', 'Last 7 Days', 'Last Week', 'Last Month', 'Last Year'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setChartFilter(f)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        background: chartFilter === f ? '#0d375b' : 'white',
                                        color: chartFilter === f ? 'white' : '#64748b',
                                        border: '1px solid #e2e8f0',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div style={{
                            background: '#ffffff',
                            borderRadius: '20px',
                            padding: '40px',
                            textAlign: 'center',
                            boxShadow: '0 5px 25px rgba(0, 0, 0, 0.05)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '5px' }}>Earning Breakdown</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '40px' }}>Period: {chartFilter}</p>

                            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '60px' }}>
                                <DonutChart percent={75} value={`LKR ${summary?.totalEarned.toLocaleString()}`} label="Design Revenue" color1="#2563eb" color2="#60a5fa" />
                                <DonutChart percent={25} value={`LKR ${(summary?.totalEarned ? summary.totalEarned * 0.25 : 0).toLocaleString()}`} label="Customization" color1="#2563eb" color2="#60a5fa" />
                                <DonutChart percent={100} value={`LKR ${summary?.totalEarned.toLocaleString()}`} label="Total Net Earnings" color1="#1e40af" color2="#3b82f6" />
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>

            <style>{`
                /* Chart hover effect handled via SVG scaling if needed, but keeping it simple for now */
                svg { transition: all 0.3s ease; }
                svg:hover { transform: rotate(-90deg) scale(1.03); }
            `}</style>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) => (
    <div style={{
        background: '#ffffff', padding: '20px', borderRadius: '12px', textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)', color: '#0f172a', border: '1px solid #e2e8f0',
        transition: 'all 0.3s ease'
    }}>
        <div style={{ width: '40px', height: '40px', background: `${color}10`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', margin: '0 auto 12px', color: color }}>{icon}</div>
        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px' }}>{title}</div>
        <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '6px', color: '#0f172a' }}>{value}</div>
    </div>
);

const DonutChart = ({ percent, value, label, color1 = "#2563eb", color2 = "#38bdf8" }: { percent: number, value: string, label: string, color1?: string, color2?: string }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    const uniqueId = `grad-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.05))' }}>
                    <defs>
                        <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={color1} />
                            <stop offset="100%" stopColor={color2} />
                        </linearGradient>
                    </defs>
                    {/* Background Circle */}
                    <circle
                        cx="75" cy="75" r={radius}
                        fill="transparent"
                        stroke="#eff6ff"
                        strokeWidth="12"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="75" cy="75" r={radius}
                        fill="transparent"
                        stroke={`url(#${uniqueId})`}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>{value}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginTop: '2px' }}>{percent}%</div>
                </div>
            </div>
            <div style={{
                marginTop: '20px',
                background: 'white',
                padding: '6px 20px',
                borderRadius: '30px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#475569',
                border: '1px solid #f1f5f9',
                boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                letterSpacing: '0.3px'
            }}>{label}</div>
        </div>
    );
};

export default MySales;