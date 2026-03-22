import React from 'react';
import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-left">
        Cre8tify • Wear Your Imaginations
      </div>
      
      <div className="footer-center">
        <span>Privacy Policy</span> | 
        <span>Terms & Conditions</span> | 
        <span>FAQ</span>
      </div>
      
      <div className="footer-right">
        © 2025 Cre8tify
      </div>
    </footer>
  );
}