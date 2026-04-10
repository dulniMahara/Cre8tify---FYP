import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/dashboard.css'; 

// 🟢 Define Prop Type
interface SidebarProps {
  variant?: 'designer' | 'customer';
}

export default function Sidebar({ variant = 'designer' }: SidebarProps) {
  const location = useLocation();

  // 🟢 Helper to check if the link is active
  const getActiveClass = (path: string) => {
    return location.pathname === path ? 'sidebar-btn active' : 'sidebar-btn';
  };

  return (
    <div className="sidebar">
      {/* LOGO */}
      <div className="sidebar-logo">
        Cre8tify
      </div>

      <nav className="sidebar-menu">
        
        {/* ================== DESIGNER MENU ================== */}
        {variant === 'designer' ? (
          <>
            <Link to="/designer-dashboard" className={getActiveClass('/designer-dashboard')}>
              <img src="/img/dashboard.png" alt="" className="sidebar-icon" />
              Dashboard
            </Link>
            
            <Link to="/my-designs" className={getActiveClass('/my-designs')}>
              <img src="/img/mydesigns.png" alt="" className="sidebar-icon" />
              My Designs
            </Link>

            <Link to="/create" className={getActiveClass('/create')}>
              <img src="/img/create.png" alt="" className="sidebar-icon" />
              Create
            </Link>

            <Link to="/requests" className={getActiveClass('/requests')}>
              <img src="/img/request.png" alt="" className="sidebar-icon" />
              Requests
            </Link>

            <Link to="/my-sales" className={getActiveClass('/my-sales')}>
              <img src="/img/earnings.png" alt="" className="sidebar-icon" />
              My Sales
            </Link>

            <Link to="/my-shop" className={getActiveClass('/my-shop')}>
              <img src="/img/myshop.png" alt="" className="sidebar-icon" />
              My Shop
            </Link>
          </>
        ) : (
          // ================== CUSTOMER MENU ==================
          <>
            <Link to="/customer-dashboard" className={getActiveClass('/customer-dashboard')}>
              <img src="/img/dashboard.png" alt="" className="sidebar-icon" />
              Dashboard
            </Link>
            
            <Link to="/my-custom-designs" className={getActiveClass('/my-custom-designs')}>
              <img src="/img/design.png" alt="" className="sidebar-icon" />
              My Custom Designs
            </Link>

            <Link to="/favorites" className={getActiveClass('/favorites')}>
              <img src="/img/heart.png" alt="" className="sidebar-icon" />
              Favorites
            </Link>

            <Link to="/customer-requests" className={getActiveClass('/customer-requests')}>
              <img src="/img/request.png" alt="" className="sidebar-icon" />
              Requests
            </Link>

            <Link to="/my-orders" className={getActiveClass('/my-orders')}>
              <img src="/img/myshop.png" alt="" className="sidebar-icon" />
              My Orders
            </Link>

            <Link to="/settings" className={getActiveClass('/settings')}>
              <img src="/img/setting.png" alt="" className="sidebar-icon" />
              Settings
            </Link>
          </>
        )}

      </nav>
    </div>
  );
}