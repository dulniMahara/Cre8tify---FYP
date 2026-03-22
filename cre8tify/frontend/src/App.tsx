import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import Pages
import Home from "./pages/Home"; // 🟢 This is your restored Landing Page
import Login from "./pages/Login"; // 🟢 The Login page we made
import DesignerSignup from "./pages/DesignerSignup"; 
import CustomerSignup from "./pages/CustomerSignup"; 
import DesignerDashboard from "./pages/DesignerDashboard";
import Profile from './pages/Profile';
import DesignTool from "./pages/DesignTool";
import ProductSubmission from './pages/ProductSubmission';
import ProductMockupViewer from "./components/ProductMockupViewer";
import MyShop from './pages/MyShop';
import MyDesigns from './pages/MyDesigns';
import MySales from './pages/MySales';
import Requests from './pages/Requests';
import BuyerDashboard from "./pages/CustomerDashboard";
import WomenCollection from "./pages/WomenCollection";
import MenCollection from "./pages/MenCollection";
import KidsCollection from './pages/KidsCollection';
import ProductDetail from './pages/ProductDetail';
import LivePreview from './pages/LivePreview';
import DummyModel from './pages/DummyModel';
import AdminDashboard from './pages/AdminDashboard';
import RequestEdit from './pages/RequestEdit';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderSuccess from './pages/OrderSuccess';
import TrackOrder from './pages/TrackOrder';
import AccountLayout from './pages/Account/AccountLayout';
import CustomerProfile from './pages/CustomerProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* 🟢 PUBLIC ROUTES (Linked from Landing Page) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/designer-signup" element={<DesignerSignup />} />
        <Route path="/customer-signup" element={<CustomerSignup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/account" element={<AccountLayout />} />

        {/* 🟢 DESIGNER DASHBOARD ROUTES */}
        <Route path="/designer-dashboard" element={<DesignerDashboard />} />
        <Route path="/design-tool" element={<DesignTool />} />
        <Route path="/mockup-test" element={<ProductMockupViewer />} />
        <Route path="/submit-product" element={<ProductSubmission />} />
        <Route path="/my-shop" element={<MyShop />} />
        <Route path="/my-designs" element={<MyDesigns />} />
        <Route path="/my-sales" element={<MySales />} />
        <Route path="/requests" element={<Requests />} />

        {/*CUSTOMER DASHBOARD ROUTES */}
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/women-collection" element={<WomenCollection />} />
        <Route path="/men-collection" element={<MenCollection />}/>
        <Route path="/kids-collection" element={<KidsCollection />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/live-preview" element={<LivePreview />} />
        <Route path="/dummy-model" element={<DummyModel />} />
        <Route path="/request-edit/:id" element={<RequestEdit />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<OrderConfirmation />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />

        {/* 🟢 ADMIN DASHBOARD ROUTES (Only accessible to admins) */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />


        app.use('/api/auth', require('./routes/authRoutes'));
        app.use('/api/users', require('./routes/userRoutes'));
        app.use('/api/designs', require('./routes/designRoutes'));
      </Routes>
    </Router>
  );
}

export default App;