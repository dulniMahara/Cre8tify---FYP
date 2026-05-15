import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getUserInfo, clearAuth } from '../utils/auth';
import '../styles/dashboard.css';

const API_URL = "http://localhost:5000"; //  Added API_URL for profile images

// State will be managed dynamically


export default function DesignerDashboard() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("Designer");
  const [products, setProducts] = useState<any[]>([]);

  // 2. Effect to fetch name and image from localStorage, and fetch products
  useEffect(() => {
    window.scrollTo(0, 0); //  Always start at the top
    const userObj = getUserInfo('designer');
    if (userObj) {
      const name = userObj.name || "Designer";
      setUserName(`Welcome, ${name}!`);
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/base-products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (product: any) => {
    navigate('/design-tool', { state: { selectedProduct: product } });
  };

  // handleLogout removed as it was unused and handled by global navigation components

  // Helper to render a specific category grid
  const renderProductSection = (title: string, categoryItems: any[]) => (
    <div style={{ marginBottom: '25px' }}>
      <h3 style={{ fontSize: '11px', fontWeight: '700', marginBottom: '10px', color: '#0d375b', borderLeft: '3px solid #0d375b', paddingLeft: '8px' }}>{title}</h3>
      <div className="products-grid">
        {categoryItems.map((product) => (
          <div
            key={product._id}
            className="product-card"
            onClick={() => handleProductClick(product)}
          >
            <div className="image-wrapper">
              <img src={product.image || '/img/womenfront-mockup.png'} alt={product.name} className="product-image" />
              <div className="hover-overlay">
                <span className="design-btn">Start Designing ➝</span>
              </div>
            </div>
            <div className="card-info">
              <div className="product-name" style={{ fontSize: '13px', marginBottom: '6px' }}>{product.name}</div>
              <div className="product-price" style={{ fontSize: '12px', marginBottom: '8px' }}>
                LKR {product.basePrice ? Number(product.basePrice).toLocaleString() : '850'}
              </div>
              <div className="product-details" style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>
                <span>{product.sizes ? product.sizes.length : 4} sizes • {product.colors ? product.colors.length : 5} colors</span>
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
        <Header showCart={false} userRole="designer" />

        <div className="content-wrapper" style={{ marginTop: '90px' }}>

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
          {renderProductSection("Women's Collection", products.filter((p: any) => p.category === 'Women' || p.category === 'Unisex'))}
          {renderProductSection("Men's Collection", products.filter((p: any) => p.category === 'Men'))}
          {renderProductSection("Kids' Collection", products.filter((p: any) => p.category === 'Kids'))}
        </div>
        <Footer />
      </div>
    </div>
  );
}