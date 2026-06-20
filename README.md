# Cre8tify - A Localized E-Commerce Framework with 360° Visualization for the Sri Lankan Apparel Market.

Cre8tify is a high-fidelity, full-stack marketplace designed for custom T-shirt enthusiasts and professional designers. The platform bridges the gap between creative design and e-commerce, featuring a professional-grade Design Tool, a robust Administrative Hub, and AI-driven Virtual Try-On capabilities.

---

## 🚀 Key Features

### 🎨 Interactive Designer Toolkit
- **Precision Editing**: Add, scale, and rotate text and images with pixel-perfect accuracy.
- **Categorized Base Products**: Access a diverse collection of high-quality base T-shirts for **Men, Women, and Kids**.
- **Layer Management**: Multi-layer design support with Z-index control and full Undo/Redo functionality.
- **Dynamic Previews**: Toggle between editing and high-fidelity preview modes to visualize designs in real-time.

### 🤖 AI Virtual Try-On & 360° Visualization
- **Live Fitting Experience**: Customers can upload their own images to see exactly how a T-shirt will fit their physique, powered by advanced AI (IDM-VTON).
- **360° Dummy Preview**: Interactive 360-degree visualization allows users to inspect products from every angle.
- **Realistic Textures**: High-fidelity rendering that captures fabric details and design placement accurately.

### 🛡️ Advanced Admin Dashboard
- **Marketplace Operations**: Real-time management of base product configurations (Colors, Sizes, Pricing).
- **Approval System**: Streamlined workflow for reviewing and approving designer-submitted products.
- **Analytics Hub**: Visual growth metrics, trending designs, and revenue tracking.
- **Role-Based Access**: Secure management for Administrators, Designers, and Customers.

### 🛒 Customer Experience
- **Live Preview**: Real-time visualization of product variants.
- **Request Designer Edit**: Collaborative workflow allowing customers to request professional refinements to their designs.
- **Responsive Interface**: Optimized for 100% browser zoom and mobile responsiveness.

---

## 🛠️ Technology Stack

Frontend: React.js, Vite, Vanilla CSS (Premium Dark Theme), html2canvas
Backend: Node.js, Express.js
Database: MongoDB with Mongoose ODM
AI Integration: Fashn.ai API (Virtual Try-On service) used for realistic apparel visualization
Authentication: JWT-based secure session management

---

## 🔧 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Fashn.ai API Token (for AI virtual try-on features)
### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dulniMahara/Cre8tify---FYP.git
   cd Cre8tify---FYP
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file with MONGO_URI and JWT_SECRET
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

---

## 📈 Current Project Status

The project is currently in the final refinement phase, with core marketplace operations and administrative synchronization fully implemented. The latest updates focused on:
- Pixel-perfect synchronization between Admin configurations and the Design Tool.
- Harmonized dark-theme UI across the Administrative Dashboard.
- Standardized product attribute rendering (Uppercase sizes and high-fidelity mockups).

---

## 🤝 Contributing
This project is part of a Final Year Project (FYP). For inquiries regarding collaboration or deployment, please contact the repository owner.

---

*Cre8tify © 2026 - Designed for the future of creative apparel.*
