import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { getUserInfo } from "../utils/auth";
import "../styles/dashboard.css";

const API_URL = "http://localhost:5000";

// 1. Static Product Data
const productsData = [
  {
    id: 1,
    title: "Women Boxy T-shirt",
    price: 1350,
    sales: "02",
    likes: 12,
    img: "/img/shop1.png",
    tag: "New",
  },
  {
    id: 2,
    title: "Moon Child Tee",
    price: 1450,
    sales: "15",
    likes: 18,
    img: "/img/shop2.png",
    tag: "Hot",
    scale: 1.0,
  },
  {
    id: 3,
    title: "Retro Vibe Print",
    price: 1250,
    sales: "08",
    likes: 22,
    img: "/img/shop3.png",
    scale: 1.0,
  },
  {
    id: 4,
    title: "Abstract Art Tee",
    price: 1600,
    sales: "05",
    likes: 18,
    img: "/img/shop4.png",
  },
  {
    id: 5,
    title: "Minimalist Line",
    price: 1350,
    sales: "12",
    likes: 30,
    img: "/img/shop1.png",
  },
  {
    id: 6,
    title: "Dark Soul Edition",
    price: 1550,
    sales: "09",
    likes: 27,
    img: "/img/shop2.png",
    scale: 1.0,
  },
  {
    id: 7,
    title: "Urban Streetwear",
    price: 1400,
    sales: "20",
    likes: 56,
    img: "/img/shop3.png",
    tag: "Sale",
    scale: 1.0,
  },
  {
    id: 8,
    title: "Classic White",
    price: 1150,
    sales: "30",
    likes: 16,
    img: "/img/shop4.png",
  },
];

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Welcome");
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [backendProducts, setBackendProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🛡️ Cart Context Setup
  const cartContext = useCart();
  const addToCart = cartContext ? cartContext.addToCart : null;

  // 🚀 Handle Add to Cart
  const handleAddToCart = (item: any) => {
    if (!item || !addToCart) return;

    const productWithDefaults = {
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.img,
      size: "Choose Size",
      color: "Choose Color",
      quantity: 1,
      selected: true,
      type: "physical",
    };

    addToCart(productWithDefaults);
    alert(`${item.title} added! 🛒`);
  };

  // 💖 Toggle Like Logic
  const toggleLike = (id: any) => {
    setLikedProducts((prev: any) => {
      const updated = prev.includes(id)
        ? prev.filter((item: any) => item !== id)
        : [...prev, id];

      // SAVE TO LOCAL STORAGE
      localStorage.setItem("wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const userObj = getUserInfo("customer");
    if (userObj) {
      setGreeting(`Welcome back, ${userObj.name || "Customer"}!`);
    }

    const fetchApprovedProducts = async () => {
      try {
        const savedLikes = localStorage.getItem("wishlist");
        if (savedLikes) {
          setLikedProducts(JSON.parse(savedLikes));
        }

        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();

        const approved = data.filter((p: any) => p.status === "Approved");

        const mapped = approved.map((p: any) => ({
          ...p,
          id: p._id,
          title: p.title,
          price: p.price,
          likes: Math.floor(Math.random() * 50),
          sales: p.salesCount || 0,
          img:
            p.mockupImages && p.mockupImages.length > 0
              ? p.mockupImages[0].startsWith("/uploads")
                ? `http://localhost:5000${p.mockupImages[0]}`
                : p.mockupImages[0]
              : "/img/placeholder.png",
          frontDesign: p.frontDesign,
          isDesignerProduct: true,
          designer: p.designer,
          tshirtColor: p.tshirtColor,
          frontPrintArea: p.frontPrintArea,
          canvasState: p.canvasState,
          frontDesignScale: p.frontDesignScale,
          // Make sure your backend provides a category field (e.g., "men", "women")
          category: p.category || "men",
        }));

        setBackendProducts(mapped);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApprovedProducts();
  }, []);

  const getSmartScale = (imgName: string) => {
    return imgName.includes("shop1.png") || imgName.includes("shop4.png")
      ? 1.05
      : 1.1;
  };

  // Filter backend products by category
  const menProducts = backendProducts.filter((p) => p.category?.toLowerCase() === "men");
  const womenProducts = backendProducts.filter((p) => p.category?.toLowerCase() === "women");

  // Reusable function to render a product card
  const renderProductCard = (item: any) => {
    const quantityInCart =
      cartContext?.cartItems?.find((c: any) => c.id === item.id)?.quantity || 0;

    return (
      <div key={item.id} className="product-card" style={cardStyle}>
        {item.tag && <div style={tagStyle}>{item.tag}</div>}
        <div
          style={imgWrapperStyle}
          onClick={() =>
            navigate(`/product/${item.id}`, {
              state: { product: item },
            })
          }
        >
          {item.frontDesign ? (
            <PerfectPreview
              mockupSrc="/img/womenfront-mockup.png"
              maskSrc="/img/womenfront-mockup.png"
              tshirtColor={item.tshirtColor || "#ffffff"}
              printArea={item.frontPrintArea}
              frontDesign={item.frontDesign}
              containerWidth={160}
            />
          ) : (
            <img
              src={item.img || "/img/placeholder.png"}
              alt={item.title}
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                objectFit: "contain",
                transform: `scale(${(item as any).scale || getSmartScale(item.img)})`,
                filter: "drop-shadow(0 5px 10px rgba(0,0,0,0.12))",
              }}
              onError={(e) => {
                e.currentTarget.src = "/img/placeholder.png";
              }}
            />
          )}
        </div>
        <div style={{ padding: "0 3px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "5px",
            }}
          >
            <h4
              style={{
                margin: "0",
                fontSize: "10px",
                fontWeight: "800",
                color: "#1e293b",
              }}
            >
              {item.title}
            </h4>
            <span
              style={detailsLink}
              onClick={() =>
                navigate(`/product/${item.id}`, {
                  state: { product: item },
                })
              }
            >
              View Details
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  color: "#ef4444",
                  fontWeight: "800",
                  fontSize: "10px",
                }}
              >
                LKR {item.price.toLocaleString()}
              </div>
              <div style={{ fontSize: "7px", color: "#94a3b8" }}>
                Sales {item.sales}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <div
                onClick={() => toggleLike(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  cursor: "pointer",
                }}
              >
                <img
                  src="/img/heart.png"
                  style={{
                    width: "10px",
                    filter: likedProducts.includes(item.id)
                      ? "invert(15%) sepia(95%) saturate(6932%) hue-rotate(358deg) brightness(95%) contrast(112%)"
                      : "none",
                    opacity: likedProducts.includes(item.id) ? 1 : 0.7,
                  }}
                  alt=""
                />
                <span
                  style={{
                    fontSize: "7px",
                    color: "#64748b",
                    fontWeight: "600",
                  }}
                >
                  {likedProducts.includes(item.id)
                    ? item.likes + 1
                    : item.likes}
                </span>
              </div>
              <div
                onClick={() => handleAddToCart(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  cursor: "pointer",
                }}
              >
                <img
                  src="/img/cart.png"
                  style={{ width: "10px", opacity: 0.7 }}
                  alt=""
                />
                <span
                  style={{
                    fontSize: "7px",
                    color: "#64748b",
                    fontWeight: "600",
                  }}
                >
                  {quantityInCart}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Sidebar variant="customer" />
      <div
        className="main-content"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Header mode="search" userRole="customer" />
        <div
          className="content-wrapper customer-content"
          style={{ overflowX: "hidden", marginTop: "45px", paddingTop: "10px" }}
        >
          <div style={bannerStyle}>
            <div>
              <h1 style={greetingTextStyle}>{greeting}</h1>
              <p style={{ fontSize: "13px", opacity: 0.9, margin: 0 }}>
                Wear Your Imagination.
              </p>
            </div>
            <button
              style={heroBtnStyle}
              onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
            >
              Browse Products
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "45px",
              marginBottom: "35px",
            }}
          >
            <CategoryCircle
              title="MEN"
              img="/img/men.png"
              scale="1.0"
              position="top"
              onClick={() => navigate("/men-collection")}
            />
            <CategoryCircle
              title="WOMEN"
              img="/img/women.png"
              scale="1.3"
              position="center"
              onClick={() => navigate("/women-collection")}
            />
            <CategoryCircle
              title="KIDS"
              img="/img/kids.png"
              scale="1.0"
              position="top"
              onClick={() => navigate("/kids-collection")}
            />
          </div>

          {/* Hardcoded New Arrivals Section */}
          <div style={newArrivalsStripe}>
            <div style={zigzagStyle}></div>
            <div style={stripeLabel}>New Arrivals</div>
            <div style={zigzagStyle}></div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "15px",
              marginBottom: "35px",
            }}
          >
            {/* ONLY map the hardcoded productsData here */}
            {productsData.map((item) => renderProductCard(item))}
          </div>



          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "40px",
              marginBottom: "20px",
            }}
          >
            <button
              style={exploreBtn}
              onClick={() => navigate("/men-collection")}
            >
              Explore More
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

// ==================== STYLES & SUB-COMPONENTS ====================

const CategoryCircle = ({
  title,
  img,
  position = "center",
  scale = "1",
  onClick,
}: any) => (
  <div onClick={onClick} style={{ textAlign: "center", cursor: "pointer" }}>
    <div
      style={{
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        overflow: "hidden",
        marginBottom: "12px",
        border: "2px solid white",
        boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={img}
        alt={title}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          transform: `scale(${scale})`,
        }}
      />
    </div>
    <div
      style={{
        fontWeight: "800",
        fontSize: "11px",
        letterSpacing: "1px",
        color: "#334155",
      }}
    >
      {title}
    </div>
  </div>
);

const bannerStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #0d375b 0%, #1a5f96 100%)",
  borderRadius: "12px",
  padding: "35px 45px",
  color: "white",
  marginBottom: "35px",
  marginTop: "70px",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 10px 20px rgba(13, 55, 91, 0.25)",
};

const heroBtnStyle: React.CSSProperties = {
  backgroundColor: "white",
  color: "#0d375b",
  padding: "8px 15px",
  borderRadius: "15px",
  border: "none",
  fontWeight: "700",
  fontSize: "8px",
  cursor: "pointer",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  transition: "transform 0.2s",
};

const greetingTextStyle: React.CSSProperties = {
  fontFamily: "'Poppins', sans-serif",
  fontSize: "24px",
  margin: "0 0 5px 0",
  fontWeight: "700",
  lineHeight: "1",
};

const newArrivalsStripe: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginBottom: "25px",
  marginLeft: "-20px",
  marginRight: "-20px",
  width: "calc(100% + 40px)",
};

const zigzagStyle: React.CSSProperties = {
  height: "16px",
  flex: 1,
  background:
    "repeating-linear-gradient(45deg, #0d375b 0, #0d375b 10px, transparent 10px, transparent 20px)",
};

const stripeLabel: React.CSSProperties = {
  background: "#0d375b",
  color: "white",
  padding: "6px 30px",
  fontWeight: "bold",
  fontSize: "12px",
  letterSpacing: "2px",
  textTransform: "uppercase",
};

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: "10px",
  borderRadius: "13px",
  boxShadow: "0 6px 15px rgba(0,0,0,0.06)",
  position: "relative",
};

const tagStyle: React.CSSProperties = {
  position: "absolute",
  top: "8px",
  right: "8px",
  background: "#0d375b",
  color: "white",
  fontSize: "6px",
  fontWeight: "700",
  padding: "3px 6px",
  borderRadius: "6px",
  textTransform: "uppercase",
  zIndex: 100,
};

const imgWrapperStyle: React.CSSProperties = {
  height: "200px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "13px",
  background: "#f1f5f9",
  borderRadius: "10px",
  overflow: "hidden",
  cursor: "pointer",
};

const detailsLink: React.CSSProperties = {
  fontSize: "7px",
  color: "#64748b",
  fontStyle: "italic",
  cursor: "pointer",
  textDecoration: "underline",
};

const exploreBtn: React.CSSProperties = {
  padding: "11px 35px",
  borderRadius: "25px",
  background: "#0d375b",
  color: "white",
  border: "none",
  fontWeight: "700",
  fontSize: "12px",
  cursor: "pointer",
  boxShadow: "0 4px 13px rgba(13, 55, 91, 0.3)",
};

const PerfectPreview = ({
  mockupSrc,
  maskSrc,
  tshirtColor,
  printArea,
  frontDesign,
  containerWidth,
}: any) => {
  const ORIGINAL_WIDTH = 550;
  const ORIGINAL_HEIGHT = 800;
  const scaleRatio = containerWidth / ORIGINAL_WIDTH;
  const safePrintArea = printArea || {
    top: "50%",
    left: "51%",
    width: "30%",
    height: "27%",
    rotation: 0,
  };
  const safeDesignSrc = frontDesign?.startsWith("/uploads")
    ? `${API_URL}${frontDesign}`
    : frontDesign;

  return (
    <div
      style={{
        width: `${containerWidth}px`,
        height: `${ORIGINAL_HEIGHT * scaleRatio}px`,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          width: `${ORIGINAL_WIDTH}px`,
          height: `${ORIGINAL_HEIGHT}px`,
          transform: `scale(${scaleRatio})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <img
          src={mockupSrc}
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            display: "block",
            height: "125%",
            width: "125%",
            objectFit: "contain",
            top: "-100px",
            right: "-71px",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-71px",
            width: "125%",
            height: "125%",
            backgroundColor: tshirtColor || "#ffffff",
            display:
              (tshirtColor || "#ffffff").toLowerCase() === "#ffffff"
                ? "none"
                : "block",
            mixBlendMode: "multiply",
            WebkitMaskImage: `url(${maskSrc})`,
            maskImage: `url(${maskSrc})`,
            WebkitMaskSize: "contain",
            WebkitMaskPosition: "center",
            WebkitMaskRepeat: "no-repeat",
            zIndex: 2,
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-71px",
            width: "125%",
            height: "125%",
            WebkitMaskImage: `url(${maskSrc})`,
            maskImage: `url(${maskSrc})`,
            WebkitMaskSize: "contain",
            WebkitMaskPosition: "center",
            WebkitMaskRepeat: "no-repeat",
            zIndex: 20,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "100px",
              right: "71px",
              width: "550px",
              height: "800px",
            }}
          >
            <div
              style={{
                position: "absolute",
                zIndex: 20,
                top: safePrintArea.top,
                left: safePrintArea.left,
                width: safePrintArea.width,
                height: safePrintArea.height,
                marginLeft: `calc(-1 * ${safePrintArea.width} / 2)`,
                marginTop: `calc(-1 * ${safePrintArea.height} / 2)`,
                transform: `rotate(${safePrintArea.rotation ?? 0}deg)`,
              }}
            >
              {safeDesignSrc && (
                <img
                  src={safeDesignSrc}
                  alt="Design Layout"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;