import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/dashboard.css';

const API_URL = "http://localhost:5000"; // 🟢 Added API_URL for profile images

// Mock Data
const products = [
  { id: 1, category: 'women', name: "Soft Touch Cotton T-shirt", price: "LKR 1200", img: "/img/dashwoman1.png", details: ["5 sizes", "5 colors", "5 buyers"] },
  { id: 2, category: 'women', name: "Oversized T-shirt", price: "LKR 1500", img: "/img/dashwoman2.png", details: ["4 sizes", "5 colors", "5 buyers"] },
  { id: 3, category: 'women', name: "Stretch (Cotton-Spandex)", price: "LKR 1350", img: "/img/dashwoman3.png", details: ["4 sizes", "5 colors", "5 buyers"] },
  { id: 4, category: 'men', name: "Classic Cotton T-shirt", price: "LKR 1350", img: "/img/dashman1.png", details: ["4 sizes", "5 colors", "5 buyers"] },
  { id: 5, category: 'men', name: "Heavyweight Cotton T-shirt", price: "LKR 1600", img: "/img/dashman2.png", details: ["4 sizes", "5 colors", "5 buyers"] },
  { id: 6, category: 'men', name: "Dry-Fit Active T-shirt", price: "LKR 1500", img: "/img/dashman3.png", details: ["5 sizes", "5 colors", "5 buyers"] },
  { id: 7, category: 'kids', name: "Soft Cotton T-shirt", price: "LKR 900", img: "/img/dashkid1.png", details: ["5 sizes","5 colors", "5 buyers"] },
  { id: 8, category: 'kids', name: "Active Play T-shirt", price: "LKR 950", img: "/img/dashkid2.png", details: ["5 sizes","5 colors", "5 buyers"] },
];

export default function DesignerDashboard() {
  const navigate = useNavigate();

  // 1. Dynamic States
  const [userName, setUserName] = useState("Designer");
  const [navProfileImg, setNavProfileImg] = useState("/img/profile-picture.png"); // 🟢 Added state

  // 2. Effect to fetch name and image from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');

    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        const name = userObj.name || "Designer";

        // Handle Profile Image Logic 🟢
        if (userObj.profileImage) {
            const fullUrl = userObj.profileImage.startsWith('http') 
                ? userObj.profileImage 
                : `${API_URL}${userObj.profileImage.startsWith('/') ? '' : '/'}${userObj.profileImage}`;
            setNavProfileImg(fullUrl);
        }

        // Handle Greeting 
        setUserName(`Welcome, ${name}!`);
       
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    }
  }, []);

  const handleProductClick = (product: any) => {
    navigate('/design-tool', { state: { selectedProduct: product } });
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem('userInfo');
      sessionStorage.clear();
      alert("You have been logged out successfully.");
      navigate('/');
    }
  };

  // Helper to render a specific category grid
  const renderProductSection = (title: string, categoryItems: any[]) => (
    <div style={{ marginBottom: '50px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '20px', color: '#0d375b', borderLeft: '5px solid #0d375b', paddingLeft: '15px' }}>{title}</h3>
        <div className="products-grid">
            {categoryItems.map((product) => (
                <div 
                    key={product.id} 
                    className="product-card"
                    onClick={() => handleProductClick(product)}
                >
                    <div className="image-wrapper">
                        <img src={product.img} alt={product.name} className="product-image" />
                        <div className="hover-overlay">
                            <span className="design-btn">Start Designing ➝</span>
                        </div>
                    </div>
                    <div className="card-info">
                        <div className="product-name">{product.name}</div>
                        <div className="product-price">{product.price}</div>
                        <div className="product-details">
                            {product.details.map((detail: string, index: number) => (
                                <span key={index}>{detail}{index < product.details.length - 1 ? ' • ' : ''}</span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
  
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        
        <header className="top-header" >
            <div className="header-left" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
                <img src="/img/back.png" alt="Back" className="nav-icon-small" />
                <span>Back</span>
            </div>
            <div className="search-container">
                <img src="/img/search.png" alt="Search" className="search-icon-img" />
                <input type="text" className="search-bar" placeholder="Search designs..." />
            </div>
            <div className="header-icons">
                {/* 🟢 DYNAMIC PROFILE IMAGE APPLIED HERE */}
                <img 
                    src={navProfileImg} 
                    alt="Profile" 
                    className="nav-icon" 
                    style={{ 
                        cursor: 'pointer',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                    }} 
                    onClick={() => navigate('/profile')} 
                    onError={(e) => { (e.target as HTMLImageElement).src = "/img/profile-picture.png"; }}
                />
                <img src="/img/notifi.png" alt="Notifications" className="nav-icon" />
                <img 
                    src="/img/logout.png" 
                    alt="Logout" 
                    className="nav-icon" 
                    style={{ borderRadius: 0, cursor: 'pointer' }} 
                    onClick={handleLogout} 
                />
            </div>
        </header>

        <div className="content-wrapper">
            
            {/* HERO BANNER */}
            <div className="hero-banner">
                <div className="hero-text">
                    <h1>{userName} 🎨</h1>
                    <p>Ready to create your next bestseller? Choose a base product below.</p>
                </div>
                <button className="hero-btn" onClick={() => document.querySelector('.products-grid')?.scrollIntoView({ behavior: 'smooth' })}>
                    Browse Products
                </button>
            </div>

            {/* Product Sections */}
            {renderProductSection("Women's Collection", products.slice(0, 3))}
            {renderProductSection("Men's Collection", products.slice(3, 6))}
            {renderProductSection("Kids' Collection", products.slice(6, 8))}
        </div>
        <Footer />
      </div>
    </div>
  );
}