import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css'; 
import Footer from '../components/Footer';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            
            {/* --- HERO SECTION --- */}
            <div className="hero-section">
                
                {/* LEFT SIDE */}
                <div className="hero-left">
                    <div className="left-content-wrapper">
                       
                        <div className="logo-section">
                            <img src="/img/logo.png" alt="Cre8tify Logo" /> 
                        </div>

                        {/* Text Content */}
                        <div className="hero-text-box"style={{ marginTop: '60px'}}>
                            <div className="hero-headline">
                                Your own, <span className="highlight-text">all-in-one web application</span> for <br />
                                custom t-shirt designing and buying in <br />
                                <span className="highlight-text">Sri Lanka.</span>
                            </div>
                            <p>
                                We are a platform dedicated to empowering local designers with a free, simplified space to showcase and sell their work.
                            </p>
                            <p>
                                For every customer, we provide an interactive experience with a unique live preview option, see how the design looks on you before you purchase.
                            </p>
                            <span className="last-p">
                                All purchases are made easy with secure, localized payment methods.
                            </span>
                        </div>
                    </div>

                    {/* White Banner Strip */}
                    <div className="cta-banner">
                        Start Designing or Shopping now!
                    </div>

                    {/* Model-1 Image */}
                    <img src="/img/home2.png" alt="Juice Model" className="juice-model" />
                </div>

                {/* RIGHT SIDE- LOGIN */}
                <div className="hero-right">
                    <div className="login-wrapper">
                        <h2>WELCOME TO CRE8TIFY</h2>
                        <span className="slogan">The only platform where you can virtually fit your design before you purchase.</span>

                        
                        <label>Login as a:</label>
                        
                        <button className="btn-primary" onClick={() => navigate('/login', { state: { role: 'buyer' } })}>
                            CUSTOMER LOGIN
                        </button>

                        <button 
                            className="btn-primary" 
                            style={{ background: 'white', color: '#0d375b', border: '2px solid #0d375b', marginTop: '20px' }}
                            onClick={() => navigate('/login', { state: { role: 'designer' } })}
                        >
                            Designer Login
                        </button>

                        <div className="sign-up-link">
                            New to Cre8tify? <span onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>Scroll down to Sign Up</span>
                        </div>
                    </div>

                    {/* Model-2 Image */}
                    <img src="/img/home1.png" alt="Fashion Model" className="running-girl-model" />
                </div>
            </div>

            {/* --- ABOUT US SECTION --- */}
            <div className="about-section">
                <h2 className="about-title">About Us</h2>
                <div className="about-subtitle">Wear Your Imaginations.</div>

                <div className="about-banner-container">
                    <img src="/img/about.png" alt="Fabric Texture" className="about-bg-image" />
                    <div className="glass-overlay">
                        <p>
                            Cre8tify is a Sri Lankan custom t-shirt designing platform made for both buyers and designers. 
                            Our goal is to give a simple, creative and local-friendly place where anyone can design, customize or purchase t-shirts 
                            without facing global restrictions, high costs or complicated payment methods.
                            <br /><br />
                            We support young designers who want to showcase their creativity, and we support buyers who love unique, personalized clothing.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- CUSTOMERS SECTION --- */}
            <div className="customers-section">
                <div className="customer-img-container">
                    <img src="/img/buyerbg.png" alt="Hanging Tshirt" className="buyer-img" />
                </div>
                <div className="customer-content">
                    <div className="customer-header">
                        <span className="star-icon">★</span> For Customers
                    </div>
                    <p>As a customer, you can:</p>
                    <ul className="customer-list">
                        <li>Browse unique t-shirt designs created by local designers</li>
                        <li>Customize existing designs to match your vibe</li>
                        <li>Try Live Preview using your photo</li>
                        <li>Try our Dummy Model 360° Preview</li>
                        <li>Choose to Download the design or Order the printed t-shirt</li>
                        <li>Easily pay using local-friendly options (Bank Transfer / Sandbox)</li>
                    </ul>

                    <button className="btn-customer" onClick={() => navigate('/customer-signup')}>Sign Up as Customer</button>
                    <div className="customer-note">
                        NOTE : You can personalize a design (if the designer enables this option), but customized designs are for personal use only and cannot be resold on the platform.
                    </div>
                </div>
            </div>

            {/* --- DESIGNERS SECTION --- */}
            <div className="designer-section">
                <div className="designer-content">
                    <div className="designer-header">
                        <span className="star-icon">★</span> For Designers
                    </div>
                    <div className="designer-subtitle">
                        Cre8tify helps Sri Lankan designers kick-start their journey without needing foreign marketplaces or PayPal accounts.
                    </div>
                    <p>As a designer, you can:</p>
                    <ul className="designer-list">
                        <li>Create t-shirt designs using our built-in toolbox</li>
                        <li>Upload your own artwork</li>
                        <li>Set your design price</li>
                        <li>Get your design approved and published on the platform</li>
                        <li>Earn from every purchase or download</li>
                        <li>Track earnings and manage your portfolio</li>
                    </ul>

                    <button className="btn-designer" onClick={() => navigate('/designer-signup')}>Sign Up as Designer</button>
                    <div className="designer-note">
                        NOTE : Customers can request edits from you, or if you choose to allow it, they may customize your design for personal use. However only you (the designer) can publish or sell designs on Cre8tify.
                    </div>
                </div>
                <div className="designer-img-container">
                    <img src="/img/sellerbg.png" alt="Designer Hands" className="designer-img" />
                </div>
            </div>

            {/* --- PURPOSE & DIFFERENCE SECTION --- */}
            <div className="purpose-section">
                <div className="purpose-col">
                    <div className="purpose-header">
                        <span className="star">★</span> Our Purpose
                    </div>
                    <div className="purpose-intro">We want to empower:</div>
                    <ul className="purpose-list">
                        <li>Young designers</li>
                        <li>Students</li>
                        <li>Freelancers</li>
                        <li>Creative beginners</li>
                        <li>Anyone who loves custom fashion</li>
                    </ul>
                    <p className="purpose-summary">
                        Cre8tify brings both creators and buyers into one simple, local, mobile-friendly platform.
                    </p>
                </div>

                {/* Divider Line */}
                <div className="vertical-divider"></div>

                {/* Right Column */}
                <div className="purpose-col">
                    <div className="purpose-header">
                        <span className="star">★</span> Why Cre8tify Is Different ?
                    </div>
                    <ul className="purpose-list" style={{ marginTop: '50px' }}>
                        <li>100% Sri Lankan-focused platform</li>
                        <li>Local payment methods</li>
                        <li>No global fees or PayPal restrictions</li>
                        <li>Unique creative tools for beginners</li>
                        <li>Live previews for realistic fitting</li>
                        <li>Option to download or order printed t-shirts</li>
                        <li>Support for upcoming designers in SL</li>
                    </ul>
                </div>
            </div>

            <Footer />

        </div>
    );
};

export default Home;