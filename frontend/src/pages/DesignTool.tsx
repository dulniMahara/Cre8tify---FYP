import React, { useState, useEffect, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserInfo, detectRole } from '../utils/auth';
import Footer from '../components/Footer';
import { useLibrary } from '../hooks/useLibrary';
import '../styles/dashboard.css';
import '../styles/designTool.css';
import html2canvas from 'html2canvas';

const API_URL = "http://localhost:5000";

// --- INTERFACES ---
interface TextConfig {
    id: number;
    text: string;
    font: string;
    color: string;
    styleId?: string;
    type?: 'arc' | 'wave' | 'circle' | 'straight' | 'upward';
    zIndex: number;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    letterSpacing?: number;
    curve?: number;
}
interface CurvedTextProps {
    text: string;
    fontFamily: string;
    color: string;
    curve: number;
    letterSpacing: number;
    styleId?: string;
}
interface ImageLayer {
    id: number;
    src: string;
    zIndex: number;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    flipX: boolean;
    flipY: boolean;
    isLocked?: boolean; // New: prevent dragging/editing for base design in fulfillment mode
    isFulfillmentBase?: boolean; // New: ensure the base design fills the box
}

// --- HISTORY INTERFACE ---
interface HistoryState {
    imageLayers: ImageLayer[];
    textLayers: TextConfig[];
}


// --- MOCK DATA ---
const VARIANT_COLORS = [
    { name: 'White', hex: '#FFFFFF', gradient: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)', isAvailable: true },
    { name: 'Kiwi', hex: '#8fa749', gradient: 'linear-gradient(135deg, #a4be54 0%, #8fa749 100%)', isAvailable: true },
    { name: 'Yellow Haze', hex: '#fadfa6', gradient: 'linear-gradient(135deg, #fff2cc 0%, #fadfa6 100%)', isAvailable: true },
    { name: 'Cornsilk', hex: '#f7ef8f', gradient: 'linear-gradient(135deg, #fffbc7 0%, #f7ef8f 100%)', isAvailable: true },
    { name: 'Light Blue', hex: '#d6e6f7', gradient: 'linear-gradient(135deg, #ebf4ff 0%, #d6e6f7 100%)', isAvailable: true },
    { name: 'Light Pink', hex: '#fee0eb', gradient: 'linear-gradient(135deg, #fff0f6 0%, #fee0eb 100%)', isAvailable: true },
    { name: 'Charcoal', hex: '#2C2C2C', gradient: 'linear-gradient(135deg, #434343 0%, #2C2C2C 100%)', isAvailable: true },
    { name: 'Khaki', hex: '#F0E68C', gradient: 'linear-gradient(135deg, #f0e68c 0%, #e6d96a 100%)', isAvailable: true },
    { name: 'Baby Blue', hex: '#E0FFFF', gradient: 'linear-gradient(135deg, #e0ffff 0%, #c7f2f2 100%)', isAvailable: true },
    { name: 'Lavender', hex: '#E6E6FA', gradient: 'linear-gradient(135deg, #e6e6fa 0%, #d8d8f5 100%)', isAvailable: true },
    { name: 'Beige', hex: '#F5F5DC', gradient: 'linear-gradient(135deg, #f5f5dc 0%, #e8e8c8 100%)', isAvailable: true },
    { name: 'Standard Grey', hex: '#808080', gradient: 'linear-gradient(135deg, #a3a3a3 0%, #808080 100%)', isAvailable: true },
    { name: 'Silver', hex: '#C0C0C0', gradient: 'linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 100%)', isAvailable: true },
    { name: 'Light Salmon', hex: '#FFA07A', gradient: 'linear-gradient(135deg, #ffa07a 0%, #f08d66 100%)', isAvailable: true },
    { name: 'Sky Blue', hex: '#87CEFA', gradient: 'linear-gradient(135deg, #87cefa 0%, #70b0e0 100%)', isAvailable: true },
    { name: 'Pale Turquoise', hex: '#AFEEEE', gradient: 'linear-gradient(135deg, #afeeee 0%, #96dede 100%)', isAvailable: true },
    { name: 'Plum Light', hex: '#DDA0DD', gradient: 'linear-gradient(135deg, #dda0dd 0%, #c68dc6 100%)', isAvailable: true },
    { name: 'Mint Green', hex: '#98FB98', gradient: 'linear-gradient(135deg, #98fb98 0%, #7ee07e 100%)', isAvailable: true }
];

const VARIANT_SIZES = [
    { label: "XS", isAvailable: true },
    { label: "S", isAvailable: true },
    { label: "M", isAvailable: true },
    { label: "L", isAvailable: true },
    { label: "XL", isAvailable: true },
    { label: "2XL", isAvailable: true },
    { label: "3XL", isAvailable: true },
];

const TEXT_STYLES_CONFIG = [
    { id: 'default', img: "", label: "Blank Text" },
    { id: 'style-wave', img: "/img/Text1.png", label: "Blue Wave" },
    { id: 'style-stack', img: "/img/Text2.png", label: "Dreamer Stack" },
    { id: 'style-fish', img: "/img/Text5.png", label: "Nevermind" },
    { id: 'style-circle', img: "/img/Text4.png", label: "Full Circle" },
    { id: 'style-diamond', img: "/img/Text3.png", label: "Diamond Box" },
    { id: 'style-glitch', img: "/img/Text6.png", label: "Anxiety" },
];

const FONT_LIST = ["Abril Fatface", "Chewy", "Shrikhand", "Lobster", "Oswald", "Anton", "Roboto", "Inter"];
const TEXT_COLORS = [
    "#000000", "#ffffff", "#333333", "#808080",
    "#ff0000", "#00ff00", "#0000ff", "#ffff00",
    "#ffa500", "#800080", "#ffc0cb", "#008080",
    "#8B4513", "#FFD700", "#C0C0C0"
];

const CurvedText = ({ text, fontFamily, color, curve, letterSpacing, id, styleId }: {
    text: string,
    fontFamily: string,
    color: string,
    curve: number,
    letterSpacing: number,
    id: number,
    styleId?: string
}) => {
    const pathId = `path-${id}`;

    // 1. Logic Check: Only go full circle if style is explicitly 'style-circle'
    // This allows the standard curve slider to go up and down without snapping
    const isFullCircle = styleId === 'style-circle';

    const cx = 250;
    const cy = 250;
    const r = 160;

    let pathData = "";

    if (isFullCircle) {
        // Perfect Circle Path
        pathData = `
            M ${cx - r}, ${cy}
            a ${r},${r} 0 1,1 ${r * 2},0
            a ${r},${r} 0 1,1 -${r * 2},0
        `;
    } else {
        // 🚀 DYNAMIC ARC: Multiplier adjusted to 2.5 for more noticeable curve
        // Q 250, (250 - intensity) is the peak of the curve
        const intensity = curve * 2.5;
        pathData = `M 50,250 Q 250,${250 - intensity} 450,250`;
    }

    return (
        <svg
            viewBox="0 0 500 500"
            width="200"
            height="200"
            style={{ overflow: 'visible', display: 'block', pointerEvents: 'none' }}
        >
            <defs>
                {/* 🟢 Unique path per layer prevents one text layer from controlling another */}
                <path id={pathId} d={pathData} fill="none" />
            </defs>
            <text
                fill={color}
                style={{
                    fontFamily: fontFamily,
                    fontSize: isFullCircle ? '32px' : '40px',
                    fontWeight: 'bold',
                    letterSpacing: `${letterSpacing}px`,
                    transition: 'all 0.1s ease-out' // Smooths out the slider movement
                }}
            >
                <textPath
                    xlinkHref={`#${pathId}`}
                    startOffset="50%"
                    textAnchor="middle"
                >
                    {text}
                </textPath>
            </text>
        </svg>
    );
};
const ICON_SIZE = 18;

export default function DesignTool() {
    const navigate = useNavigate();

    // --- 1. HOOKS ---
    const { libraryItems, addToLibrary } = useLibrary();

    // --- 2. STATE ---
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [imageLayers, setImageLayers] = useState<ImageLayer[]>([]);
    const [textLayers, setTextLayers] = useState<TextConfig[]>([]);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const [currentSide, setCurrentSide] = useState<'front' | 'back' | 'neck' | 'folded'>('front');

    const [showInfoPopup, setShowInfoPopup] = useState(false);

    // VARIANT & COLOR STATE
    const [showVariantPopup, setShowVariantPopup] = useState(false);
    const [activeVariantTab, setActiveVariantTab] = useState<'color' | 'size'>('color');
    const [selectedTshirtColor, setSelectedTshirtColor] = useState<string>('#ffffff');

    // UI Panels
    const [activePanel, setActivePanel] = useState<'none' | 'text' | 'colors' | 'layers' | 'size' | 'library'>('none');

    // Selection & Editing
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // HISTORY STATE (Undo/Redo)
    const [history, setHistory] = useState<HistoryState[]>([{ imageLayers: [], textLayers: [] }]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Library UI State
    const [librarySearchTerm, setLibrarySearchTerm] = useState('');
    const [librarySort, setLibrarySort] = useState<'recent' | 'oldest' | 'az'>('recent');
    const [libraryView, setLibraryView] = useState<'grid' | 'list'>('grid');

    // Profile Image State
    const [navProfileImg, setNavProfileImg] = useState("/img/profile-picture.png");
    const [currentUserRole, setCurrentUserRole] = useState('designer');

    useEffect(() => {
        const syncProfile = async () => {
            const role = detectRole();
            setCurrentUserRole(role);
            const userObj = getUserInfo(role);

            if (userObj) {
                const getImageUrl = (img: string | undefined) => {
                    if (!img || img === "/img/profile-picture.png") return "/img/profile-picture.png";
                    if (img.startsWith('data:') || img.startsWith('http')) return img;
                    return `${API_URL}${img.startsWith('/') ? '' : '/'}${img}`;
                };

                if (role === 'designer' || role === 'admin') {
                    setNavProfileImg(getImageUrl(userObj.profileImage));
                } else {
                    setNavProfileImg(getImageUrl(userObj.image || userObj.profileImage));
                }
            }
        };

        syncProfile();
        // Sync on storage changes (profile updates)
        window.addEventListener('storage', syncProfile);
        return () => window.removeEventListener('storage', syncProfile);
    }, []);

    const printAreaRef = useRef<HTMLDivElement | null>(null);
    const mockupContainerRef = useRef<HTMLDivElement | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const [cropTargetId, setCropTargetId] = useState<number | null>(null);
    const [cropAspect, setCropAspect] = useState<number | undefined>(undefined);
    const cropImageRef = useRef<HTMLImageElement | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [mockupScale, setMockupScale] = useState(1);
    const [fulfillmentRequest, setFulfillmentRequest] = useState<any>(null);
    const [isCustomization, setIsCustomization] = useState(false);

    // 🟢 HIDDEN WORKSPACE REFS (For background snapshotting)
    const snapshotMockupRef = useRef<HTMLDivElement | null>(null);
    const snapshotPrintRef = useRef<HTMLDivElement | null>(null);

    const location = useLocation();
    const [productData, setProductData] = useState<any>(location.state?.product || location.state?.selectedProduct);

    // Admin synchronization state
    const [adminColors, setAdminColors] = useState<string[]>([]);
    const [adminSizes, setAdminSizes] = useState<string[]>([]);

    useEffect(() => {
        if (productData?.baseProduct) {
            fetch(`${API_URL}/api/base-products/${encodeURIComponent(productData.baseProduct)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.colors) setAdminColors(data.colors);
                    if (data.sizes) setAdminSizes(data.sizes);
                })
                .catch(err => console.error("Error syncing base product config", err));
        }
    }, [productData?.baseProduct]);

    // --- Computed Variants (Locking Logic) ---
    const availableColors = React.useMemo(() => {
        const activeColors = adminColors.length > 0 ? adminColors : (productData?.colors || []);
        if (activeColors.length === 0) return VARIANT_COLORS;
        return VARIANT_COLORS.map(c => ({
            ...c,
            isAvailable: activeColors.includes(c.name)
        }));
    }, [productData, adminColors]);

    const availableSizes = React.useMemo(() => {
        const activeSizes = adminSizes.length > 0 ? adminSizes : (productData?.sizes || []);
        if (activeSizes.length === 0) return VARIANT_SIZES;
        return VARIANT_SIZES.map(s => ({
            ...s,
            isAvailable: activeSizes.some((ps: string) => ps.toLowerCase() === s.label.toLowerCase())
        }));
    }, [productData, adminSizes]);

    // Dynamic MAPPING: No hardcoded fallbacks to specific shirts
    const designTitle = productData?.name || "Loading Product...";
    const designPrice = productData?.basePrice ? `LKR ${Number(productData.basePrice).toLocaleString()}` : "LKR 0.00";
    const designImage = productData?.image || "";

    const activeTextConfig = textLayers.find(t => t.id === selectedId) || null;
    const isImageSelected = imageLayers.some(i => i.id === selectedId);
    const isSomethingSelected = selectedId !== null;

    const REALISTIC_PREVIEW_SIDES = new Set(['front', 'back']);

    // 🟢 MOCKUP CONFIGURATION
    const MOCKUP_CONFIG = {
        front: {
            img: productData?.mockup ? productData.mockup : "/img/womenfront-mockup.png",
            label: 'Front',
            showDesign: true,
            printArea: { top: '50%', left: '51%', width: '30%', height: '27%', rotation: 0 },
            areaScale: 1.0,
            designScale: 1.0
        },
        back: {
            img: "/img/womenback-mockup.png",
            label: 'Back',
            showDesign: false,
            printArea: { top: '35%', left: '50%', width: '45%', height: '22%', rotation: 0 },
            areaScale: 1.0,
            designScale: 1.0
        },
        neck: {
            img: "/img/mockups/collar.png",
            label: 'Neck',
            showDesign: true,
            printArea: { top: '90%', left: '60%', width: '75%', height: '50%', rotation: -23 },
            areaScale: 1.0,
            designScale: 2.0
        },
        folded: {
            img: "/img/mockups/folded.png",
            label: 'Folded',
            mask: "/img/mockups/foldedmask.png",
            maskSize: 'contain',
            maskPosition: 'center',
            showDesign: true,
            printArea: { top: '66%', left: '46%', width: '60%', height: '84%', rotation: 5 },
            areaScale: 1.0,
            designScale: 4.0
        }
    };
    useEffect(() => {
        console.log("Initializing Design Tool state...");

        // 1. IF IT'S AN EDIT SESSION (From My Shop)
        if (location.state?.isEdit && location.state?.savedLayers) {
            console.log("EDIT MODE: Loading saved design layers...");
            const { imageLayers: sImgs, textLayers: sTxts } = location.state.savedLayers;
            setImageLayers(sImgs || []);
            setTextLayers(sTxts || []);
            if (location.state.selectedTshirtColor) {
                setSelectedTshirtColor(location.state.selectedTshirtColor);
            }
            if (location.state.product) {
                setProductData(location.state.product);
            }
            // Clear location state to avoid re-triggering on local updates
            window.history.replaceState({}, document.title);
            return; // EXIT: Don't load recovery data if editing
        }

        // 2. IF IT'S A FULFILLMENT SESSION (From Requests Page)
        if (location.state?.fulfillmentRequest) {
            const fr = location.state.fulfillmentRequest;
            console.log("FULFILLMENT MODE: Initializing with request:", fr);

            setFulfillmentRequest(fr);
            setSelectedTshirtColor(fr.color || '#ffffff');

            // 🚀 CRITICAL: Fetch the actual base product to get correct mockup/mask/printArea
            const fetchBaseProduct = async () => {
                try {
                    const res = await fetch(`${API_URL}/api/base-products/${fr.productId || fr.productId}`);
                    if (res.ok) {
                        const pData = await res.json();
                        setProductData(pData);
                        console.log("Base product loaded for fulfillment:", pData);
                    }
                } catch (err) {
                    console.error("Failed to load base product for fulfillment:", err);
                }
            };
            fetchBaseProduct();

            // Defensive parsing for canvasState if it comes as a string
            let cState = fr.canvasState;
            if (typeof cState === 'string') {
                try { cState = JSON.parse(cState); } catch (e) { cState = null; }
            }

            // Load layers from canvasState if available and not empty
            const hasLayers = (cState?.imageLayers?.length > 0) || (cState?.textLayers?.length > 0);
            console.log("Fulfillment Layers check:", { hasLayers, cState });

            if (cState && hasLayers) {
                console.log("Loading layers from fulfillment canvasState...");
                // 🚀 IMPORTANT: Lock existing image layers so they fill the box
                const lockedLayers = (cState.imageLayers || []).map((l: any, idx: number) => ({
                    ...l,
                    isLocked: idx === 0, // Lock the first layer (usually the base design)
                    isFulfillmentBase: idx === 0 // Mark it clearly for the renderer
                }));
                setImageLayers(lockedLayers);
                setTextLayers(cState.textLayers || []);
            } else if (fr.frontDesign) {
                console.log("Falling back to frontDesign image as locked layer");
                const baseLayer: ImageLayer = {
                    id: 9999,
                    src: fr.frontDesign,
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotation: 0,
                    flipX: false,
                    flipY: false,
                    zIndex: 1,
                    isLocked: true,
                    isFulfillmentBase: true
                };
                setImageLayers([baseLayer]);
            }
            return;
        }

        // 2.5 IF IT'S A CUSTOMIZATION SESSION (From Product Detail)
        if (location.state?.isCustomization) {
            console.log("CUSTOMIZATION MODE: Locking base design...");
            setIsCustomization(true);
            const p = location.state.product;
            if (p) {
                setProductData(p);
                setSelectedTshirtColor(location.state.selectedColor || '#ffffff');

                // Load existing layers but lock images
                if (p.canvasState) {
                    const cState = typeof p.canvasState === 'string' ? JSON.parse(p.canvasState) : p.canvasState;
                    const lockedImages = (cState.imageLayers || []).map((l: any) => ({
                        ...l,
                        isLocked: true,
                        isFulfillmentBase: true // Re-use this flag for auto-scaling/locking
                    }));
                    setImageLayers(lockedImages);
                    setTextLayers(cState.textLayers || []);
                } else if (p.frontDesign) {
                    setImageLayers([{
                        id: 8888,
                        src: p.frontDesign,
                        x: 0, y: 0, scale: 1, rotation: 0,
                        flipX: false, flipY: false, zIndex: 1,
                        isLocked: true,
                        isFulfillmentBase: true
                    }]);
                }
            }
            return;
        }

        // 3. IF IT'S A NEW DESIGN SESSION (From Dashboard)
        if (location.state?.selectedProduct) {
            console.log("NEW DESIGN: Starting with blank canvas...");
            setImageLayers([]);
            setTextLayers([]);

            // Set default color based on availability
            const pColors = location.state.selectedProduct.colors || [];
            const isWhiteAvailable = pColors.includes('White');
            if (!isWhiteAvailable && pColors.length > 0) {
                const firstAvailable = VARIANT_COLORS.find(c => c.name === pColors[0]);
                setSelectedTshirtColor(firstAvailable?.hex || '#ffffff');
            } else {
                setSelectedTshirtColor('#ffffff');
            }

            // Clear recovery so it doesn't pop back on refresh
            localStorage.removeItem('RECOVERY_DESIGN');
            return; // EXIT
        }

        // 3. FALLBACK: RECOVERY LOGIC (On Refresh)
        const raw = localStorage.getItem('RECOVERY_DESIGN');
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                console.log("RECOVERY DATA FOUND:", parsed);
                if (parsed.imageLayers) setImageLayers(parsed.imageLayers);
                if (parsed.textLayers) setTextLayers(parsed.textLayers);
                if (parsed.selectedTshirtColor) setSelectedTshirtColor(parsed.selectedTshirtColor);
            } catch (e) {
                console.error("Recovery failed", e);
            }
        }
    }, []);

    useEffect(() => {
        const calculateScale = () => {
            // Changed from 180 to 120, giving the shirt more vertical screen space
            const availableHeight = window.innerHeight - 120;
            const sidebarWidth = viewMode === 'edit' ? 300 : 0;
            const maxAllowedWidth = window.innerWidth - sidebarWidth - 100;

            const baseHeight = 800;
            const baseWidth = (currentSide === 'folded' || currentSide === 'neck') ? 850 : 550;

            const scaleRequiredHeight = availableHeight / baseHeight;
            const scaleRequiredWidth = maxAllowedWidth / baseWidth;

            // Use standard scaling without an aggressive multiplier to prevent over-scaling
            const effectiveScale = Math.min(scaleRequiredHeight, scaleRequiredWidth) * 1.0;

            // Set a slightly higher minimum scale (0.7) to prevent it from looking too small
            setMockupScale(Math.max(effectiveScale, 0.7));
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, [viewMode, currentSide]);

    // --- HISTORY HELPER FUNCTION ---
    const addToHistory = (newImages: ImageLayer[], newTexts: TextConfig[]) => {
        const newEntry = { imageLayers: newImages, textLayers: newTexts };
        const historyCopy = history.slice(0, historyIndex + 1);
        setHistory([...historyCopy, newEntry]);
        setHistoryIndex(historyCopy.length);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            setImageLayers(prevState.imageLayers);
            setTextLayers(prevState.textLayers);
            setHistoryIndex(historyIndex - 1);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            setImageLayers(nextState.imageLayers);
            setTextLayers(nextState.textLayers);
            setHistoryIndex(historyIndex + 1);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // 1. Convert file to URL (Existing logic)
                const reader = new FileReader();
                reader.onload = (e) => {
                    const url = e.target?.result as string;

                    // 2. Calculate Z-index (The fix for overlapping)
                    const maxZ = Math.max(0, ...imageLayers.map(l => l.zIndex || 0), ...textLayers.map(t => t.zIndex || 0));

                    // 3. Create the new layer
                    const newImage: ImageLayer = {
                        id: Date.now(),
                        src: url,
                        x: 150, // Default center-ish
                        y: 150,
                        scale: 0.5,
                        rotation: 0,
                        flipX: false,
                        flipY: false,
                        zIndex: maxZ + 1,
                    };

                    const updatedImages = [...imageLayers, newImage];
                    setImageLayers(updatedImages);
                    setSelectedId(newImage.id);
                    addToHistory(updatedImages, textLayers);

                    // 4. Add to persistent Library & Open Panel
                    addToLibrary(file);
                    setActivePanel('library');
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }
    };

    const handleAddFromLibrary = (imgSrc: string) => {
        const maxZ = Math.max(0, ...imageLayers.map(l => l.zIndex), ...textLayers.map(t => t.zIndex));
        const newLayer: ImageLayer = { id: Date.now(), src: imgSrc, zIndex: maxZ + 1, x: 0, y: 0, scale: 1, rotation: 0, flipX: false, flipY: false };
        setImageLayers([...imageLayers, newLayer]);
        setSelectedId(newLayer.id);
        addToHistory([...imageLayers, newLayer], textLayers);
    };


    const handleTextSelection = (style: any) => {
        const maxZ = Math.max(0, ...imageLayers.map(l => l.zIndex || 0), ...textLayers.map(t => t.zIndex || 0));
        const styleId = typeof style === 'string' ? style : style.id;

        const newText: TextConfig = {
            id: Date.now(),
            text: styleId === 'default' ? "Plain Text" : "New Style",
            font: 'Anton',
            styleId: styleId,
            color: "#000000",
            zIndex: maxZ + 1,
            x: 100,
            y: 100,
            scale: 1,
            rotation: 0
        };

        const updated = [...textLayers, newText];
        setTextLayers(updated);
        setSelectedId(newText.id);
        setIsEditing(true);
        addToHistory(imageLayers, updated);
    };

    const handleDragStart = (e: React.MouseEvent, id: number, type: 'text' | 'image', initialX: number, initialY: number) => {
        if (viewMode === 'preview') return;
        e.preventDefault(); e.stopPropagation();
        setSelectedId(id);
        const startX = e.clientX; const startY = e.clientY;
        let hasMoved = false;
        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX; const deltaY = moveEvent.clientY - startY;
            if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) hasMoved = true;
            if (type === 'text') {
                setTextLayers(prev => prev.map(t => t.id === id ? { ...t, x: initialX + deltaX, y: initialY + deltaY } : t));
            } else {
                setImageLayers(prev => prev.map(img => img.id === id ? { ...img, x: initialX + deltaX, y: initialY + deltaY } : img));
            }
        };
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (hasMoved) addToHistory(imageLayers, textLayers);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const deleteLibraryImage = async (imageId: string) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;

        try {
            const response = await fetch(`${API_URL}/api/library/${imageId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                window.location.reload();
            } else {
                alert("Failed to delete image from server.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };


    const getCurrentValue = (prop: 'scale' | 'x' | 'y' | 'rotation' | 'letterSpacing' | 'curve') => {
        const txt = textLayers.find(t => t.id === selectedId);
        if (txt) return (txt as any)[prop];

        const img = imageLayers.find(i => i.id === selectedId);
        if (img) return (img as any)[prop];

        // Fallback values for when nothing is selected or property is missing
        if (prop === 'scale') return 1;
        return 0;
    };

    const updateActiveLayer = (prop: string, value: any, isFinal: boolean = false) => {
        if (!selectedId) return;

        // Checkinf if the selected item is a text layer
        const isText = textLayers.some(t => t.id === selectedId);

        if (isText) {
            // 1. Calculate the new state first
            const nextTexts = textLayers.map(t =>
                t.id === selectedId ? { ...t, [prop]: value } : t
            );

            // 2. Update the UI
            setTextLayers(nextTexts);

            // 3. Save to history using the fresh 'nextTexts' array
            if (isFinal) {
                addToHistory(imageLayers, nextTexts);
            }
        } else {
            // Do the same for images to avoid stale state issues
            const nextImages = imageLayers.map(img =>
                img.id === selectedId ? { ...img, [prop]: value } : img
            );

            setImageLayers(nextImages);

            if (isFinal) {
                addToHistory(nextImages, textLayers);
            }
        }
    };
    const getPrintAreaSize = () => {
        if (!printAreaRef.current) return { width: 1, height: 1 };
        return {
            width: printAreaRef.current.offsetWidth || 1,
            height: printAreaRef.current.offsetHeight || 1
        };
    };

    const getImageDimensions = (src: string) =>
        new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = (err) => reject(err);
            img.src = src;
        });

    const fetchImageBlob = async (src: string) => {
        const res = await fetch(src);
        if (!res.ok) throw new Error('Failed to fetch image');
        return await res.blob();
    };

    const applySmartCutout = async (src: string) => {
        const imageBlob = await fetchImageBlob(src);
        const formData = new FormData();
        formData.append('image', imageBlob, 'input.png');

        const res = await fetch(`${API_URL}/api/cutout`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || 'Cutout failed');
        }
        const cutoutBlob = await res.blob();
        return URL.createObjectURL(cutoutBlob);
    };

    const getCroppedImg = async (image: HTMLImageElement, cropPixels: PixelCrop) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return image.src;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = cropPixels.width * pixelRatio;
        canvas.height = cropPixels.height * pixelRatio;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            cropPixels.x * scaleX,
            cropPixels.y * scaleY,
            cropPixels.width * scaleX,
            cropPixels.height * scaleY,
            0,
            0,
            cropPixels.width,
            cropPixels.height
        );

        return canvas.toDataURL('image/png');
    };

    const handleImageTool = async (action: string) => {
        if (!selectedId) return;
        let nImgs = [...imageLayers];
        let nTxts = [...textLayers];
        const img = nImgs.find(i => i.id === selectedId);

        if (action === 'delete') {
            if (!window.confirm("Remove element?")) return;
            nImgs = nImgs.filter(i => i.id !== selectedId);
            nTxts = nTxts.filter(t => t.id !== selectedId);
            setSelectedId(null);
        } else if (action === 'duplicate') {
            const txt = nTxts.find(t => t.id === selectedId);
            if (img) nImgs.push({ ...img, id: Date.now(), x: img.x + 20, y: img.y + 20 });
            if (txt) nTxts.push({ ...txt, id: Date.now(), x: txt.x + 20, y: txt.y + 20 });
        } else if (action === 'flipX') {
            nImgs = nImgs.map(i => i.id === selectedId ? { ...i, flipX: !i.flipX } : i);
        } else if (action === 'flipY') {
            nImgs = nImgs.map(i => i.id === selectedId ? { ...i, flipY: !i.flipY } : i);
        } else if (action === 'fit' || action === 'fill') {
            if (!img) return;
            const { width: areaW, height: areaH } = getPrintAreaSize();
            const { width: imgW, height: imgH } = await getImageDimensions(img.src);
            if (imgW === 0 || imgH === 0) return;
            const scale = action === 'fit'
                ? Math.min(areaW / imgW, areaH / imgH)
                : Math.max(areaW / imgW, areaH / imgH);
            nImgs = nImgs.map(i => i.id === selectedId ? { ...i, scale, x: 0, y: 0 } : i);
        } else if (action === 'cutout') {
            if (!img) return;
            try {
                const cutoutSrc = await applySmartCutout(img.src);
                nImgs = nImgs.map(i => i.id === selectedId ? { ...i, src: cutoutSrc } : i);
            } catch (err) {
                console.error(err);
                window.alert("Cutout service error.");
                return;
            }
        } else if (action === 'crop') {
            if (!img) return;
            //Ensuring we use selectedId consistently
            setCropImageSrc(img.src);
            setCrop({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
            setCompletedCrop(null); // Resettin previous crop coordinates
            setShowCropModal(true);
            return;
        }

        setImageLayers(nImgs);
        setTextLayers(nTxts);
        addToHistory(nImgs, nTxts);
    };
    const setActiveTextConfig = (next: TextConfig | null, commit: boolean = false) => {
        if (!next) {
            const updatedTexts = selectedId
                ? textLayers.filter(t => t.id !== selectedId)
                : textLayers;
            setTextLayers(updatedTexts);
            if (selectedId) setSelectedId(null);
            if (commit) addToHistory(imageLayers, updatedTexts);
            return;
        }
        const updatedTexts = textLayers.map(t => t.id === next.id ? next : t);
        setTextLayers(updatedTexts);
        if (commit) addToHistory(imageLayers, updatedTexts);
    };

    const handleFontSelection = (font: string) => {
        if (!activeTextConfig) return;
        setActiveTextConfig({ ...activeTextConfig, font }, true);
    };

    const handleLetterSpacingChange = (val: number) => {
        if (!selectedId) return;

        const updatedTextLayers = textLayers.map((layer) =>
            layer.id === selectedId ? { ...layer, letterSpacing: val } : layer
        );

        setTextLayers(updatedTextLayers);

        if (typeof addToHistory === 'function') {
            addToHistory(imageLayers, updatedTextLayers);
        }
    };
    const toolBtnStyle = (enabled: boolean, isDelete: boolean = false): React.CSSProperties => ({
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        border: 'none',
        background: 'none',
        cursor: enabled ? 'pointer' : 'default',
        color: isDelete ? '#ef4444' : (enabled ? '#475569' : '#cbd5e1'),
        opacity: enabled ? 1 : 0.5,
        padding: '4px 8px',
        pointerEvents: 'auto',
        zIndex: 10
    });

    const toolLabelStyle: React.CSSProperties = {
        fontSize: '9px',
        fontWeight: '700',
        color: 'inherit', // Inherits color from the button
        letterSpacing: '0.3px',
        textTransform: 'uppercase'
    };
    const activeToggleStyle: React.CSSProperties = {
        padding: '4px 16px',
        borderRadius: '15px',
        border: 'none',
        backgroundColor: '#0d375b',
        color: 'white',
        fontSize: '11px',
        fontWeight: '700',
        cursor: 'pointer'
    };

    const inactiveToggleStyle: React.CSSProperties = {
        padding: '4px 16px',
        borderRadius: '15px',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#64748b',
        fontSize: '11px',
        fontWeight: '600',
        cursor: 'pointer'
    };
    const applyCropPreset = (aspect?: number) => {
        setCropAspect(aspect);
        if (!aspect) {
            setCrop({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
            return;
        }
        const base = 60;
        const width = aspect >= 1 ? base : Math.round(base * aspect);
        const height = aspect >= 1 ? Math.round(base / aspect) : base;
        const x = Math.round((100 - width) / 2);
        const y = Math.round((100 - height) / 2);
        setCrop({ unit: '%', x, y, width, height });
    };

    const handleApplyCrop = async () => {
        // 1. Ensure we have all necessary data
        if (completedCrop && imgRef.current && selectedId) {
            const image = imgRef.current; // This is the <img> inside the ReactCrop
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) return;

            // 2. Calculate the real scale of the image vs displayed size
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            const pixelRatio = window.devicePixelRatio || 1;

            // 3. Set canvas size to the cropped area size
            canvas.width = completedCrop.width * pixelRatio;
            canvas.height = completedCrop.height * pixelRatio;
            ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            ctx.imageSmoothingQuality = 'high';

            // 4. Draw the cropped portion
            ctx.drawImage(
                image,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                completedCrop.width,
                completedCrop.height
            );

            // 5. Convert to Base64
            const croppedBase64 = canvas.toDataURL('image/png');

            // 6. 🟢 Update the image layer state
            const updatedImages = imageLayers.map((img) =>
                img.id === selectedId ? { ...img, src: croppedBase64 } : img
            );

            setImageLayers(updatedImages);
            addToHistory(updatedImages, textLayers); // Save to undo/redo
            setShowCropModal(false); // Close the modal
            setCompletedCrop(null); // Reset crop state
        } else {
            console.error("Missing crop data or image reference");
        }
    };

    const waitForPaint = () => new Promise<void>(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(resolve, 500);
            });
        });
    });

    const trimTransparent = (source: HTMLCanvasElement) => {
        const ctx = source.getContext('2d', { willReadFrequently: true });
        if (!ctx) return source;
        const { width, height } = source;
        const data = ctx.getImageData(0, 0, width, height).data;
        let minX = width, minY = height, maxX = -1, maxY = -1;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4 + 3;
                if (data[idx] > 10) {
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                }
            }
        }
        if (maxX < minX || maxY < minY) return source;
        const out = document.createElement('canvas');
        out.width = maxX - minX + 1;
        out.height = maxY - minY + 1;
        const octx = out.getContext('2d');
        if (!octx) return source;
        octx.drawImage(source, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
        return out;
    };

    const blobToDataURL = (blob: Blob) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });



    // --- 1. CAPTURE UTILITY ---
    const getCanvasSnapshot = async (side: 'front' | 'folded' | 'neck' | 'back', target: 'full' | 'design' = 'full') => {
        const prevSide = currentSide;
        setCurrentSide(side);

        // 1. TEMPORARY FIX FOR HTML2CANVAS:
        // html2canvas calculates wrong positions if the parent has transform: scale()
        const originalScale = mockupScale;
        setMockupScale(1);

        // Wait for the side to switch, scale to reset, and UI to render
        await new Promise(resolve => setTimeout(resolve, 100));
        await waitForPaint();

        const workspaceElement = target === 'full' ? snapshotMockupRef.current : snapshotPrintRef.current;

        if (!workspaceElement) {
            setCurrentSide(prevSide);
            return { designSrc: "", printAreaPx: null };
        }

        // 🟢 ALWAYS in background, no need to toggle isSaving here anymore
        // as the main process is handled in handleNavigateToSubmit
        await waitForPaint();

        try {
            const canvas = await html2canvas(workspaceElement, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                scale: target === 'full' ? 1 : 2,
                logging: false,
                width: workspaceElement.offsetWidth,
                height: workspaceElement.offsetHeight,
            });

            setCurrentSide(prevSide);
            setMockupScale(originalScale);

            return {
                designSrc: canvas.toDataURL("image/png"),
                printAreaPx: target === 'design' ? {
                    width: workspaceElement.offsetWidth,
                    height: workspaceElement.offsetHeight
                } : null
            };
        } catch (err) {
            setCurrentSide(prevSide);
            setMockupScale(originalScale);
            console.error("Snapshot failed:", err);
            return { designSrc: "", printAreaPx: null };
        }
    };

    // --- 2. NAVIGATION HANDLER ---
    const handleNavigateToSubmit = async () => {
        setIsSaving(true);
        await waitForPaint();
        await new Promise(resolve => setTimeout(resolve, 100)); // 🚀 Extra pause to ensure Loader is fully opaque before snapshotting starts

        try {
            console.log("Saving recovery state and capturing snapshots...");

            // 1. Save current state to localStorage for recovery (Safe wrap)
            try {
                const recoveryData = {
                    imageLayers,
                    textLayers,
                    selectedTshirtColor,
                    lastUpdated: new Date().toISOString()
                };
                localStorage.setItem('RECOVERY_DESIGN', JSON.stringify(recoveryData));
            } catch (e) {
                console.warn("Storage quota exceeded for RECOVERY_DESIGN. Continuing without recovery backup.");
            }

            // 2. Capture snapshots for each view
            // 🟢 FULL SHIRT SNAPSHOTS (For shop display)
            const frontFull = await getCanvasSnapshot('front', 'full');
            const neckFull = await getCanvasSnapshot('neck', 'full');
            const foldedFull = await getCanvasSnapshot('folded', 'full');

            // 🟢 DESIGN-ONLY SNAPSHOTS (For production data)
            const frontDesignSnap = await getCanvasSnapshot('front', 'design');
            const neckDesignSnap = await getCanvasSnapshot('neck', 'design');
            const foldedDesignSnap = await getCanvasSnapshot('folded', 'design');

            const backSnap = { designSrc: "", printAreaPx: null };

            // 🟢 FULFILLMENT LOGIC: If this is a response to a customer request
            if (fulfillmentRequest) {
                try {
                    const response = await fetch(`http://localhost:5000/api/requests/${fulfillmentRequest.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            status: 'Completed',
                            frontDesign: frontDesignSnap.designSrc, // Save the NEW edited design
                            canvasState: { imageLayers, textLayers }, // Save individual layers
                            frontPrintArea: MOCKUP_CONFIG.front.printArea // Save the print area config
                        })
                    });

                    if (response.ok) {
                        alert("Design sent to customer successfully!");
                        navigate('/requests');
                    } else {
                        throw new Error('Failed to send design to customer');
                    }
                } catch (err) {
                    console.error("Fulfillment error:", err);
                    alert("Error sending design to customer. Please try again.");
                }
                return;
            }

            // 🟢 CUSTOMIZATION LOGIC: If this is a user customizing an existing design
            if (isCustomization) {
                try {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                    const response = await fetch(`http://localhost:5000/api/requests`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            requestType: 'customization',
                            productId: productData.id || productData._id,
                            productName: productData.name || productData.title,
                            productImage: productData.image || (productData.baseImages && productData.baseImages[0]),
                            customer: userInfo.name || 'Anonymous Customer',
                            customerId: userInfo._id || userInfo.id,
                            color: selectedTshirtColor,
                            size: location.state.selectedSize,
                            status: 'Pending',
                            frontDesign: frontDesignSnap.designSrc,
                            canvasState: { imageLayers, textLayers },
                            frontPrintArea: MOCKUP_CONFIG.front.printArea
                        })
                    });

                    if (response.ok) {
                        alert("Customization submitted for admin approval!");
                        navigate('/my-custom-designs');
                    } else {
                        throw new Error('Failed to submit customization');
                    }
                } catch (err) {
                    console.error("Customization error:", err);
                    alert("Error submitting customization. Please try again.");
                }
                return;
            }

            // 🟢 NORMALIZE LAYERS: Convert blob URLs to Data URLs so they persist in the next page
            const normalizedImageLayers = await normalizeImageLayers(imageLayers);

            const submissionData = {
                productImages: [
                    frontFull.designSrc || MOCKUP_CONFIG.front.img,
                    MOCKUP_CONFIG.back.img,
                    neckFull.designSrc || MOCKUP_CONFIG.neck.img,
                    foldedFull.designSrc || MOCKUP_CONFIG.folded.img
                ],
                frontDesign: frontDesignSnap.designSrc,
                frontPrintAreaPx: frontDesignSnap.printAreaPx,
                frontPrintArea: MOCKUP_CONFIG.front.printArea,
                frontAreaScale: MOCKUP_CONFIG.front.areaScale,
                frontDesignScale: MOCKUP_CONFIG.front.designScale,

                neckDesign: neckDesignSnap.designSrc,
                neckPrintAreaPx: neckDesignSnap.printAreaPx,
                neckPrintArea: MOCKUP_CONFIG.neck.printArea,
                neckAreaScale: MOCKUP_CONFIG.neck.areaScale,
                neckDesignScale: MOCKUP_CONFIG.neck.designScale,

                foldedDesign: foldedDesignSnap.designSrc,
                foldedPrintAreaPx: foldedDesignSnap.printAreaPx,
                foldedPrintArea: MOCKUP_CONFIG.folded.printArea,
                foldedAreaScale: MOCKUP_CONFIG.folded.areaScale,
                foldedDesignScale: MOCKUP_CONFIG.folded.designScale,

                backDesign: backSnap.designSrc,
                backPrintAreaPx: backSnap.printAreaPx, // Actually null
                backPrintArea: MOCKUP_CONFIG.back.printArea,
                backAreaScale: MOCKUP_CONFIG.back.areaScale,
                backDesignScale: MOCKUP_CONFIG.back.designScale,

                productType: location.state?.product?.name || 'Oversized T-shirt',
                tshirtColor: selectedTshirtColor,
                category: productData?.category || 'Unisex',
                canvasState: {
                    imageLayers: normalizedImageLayers,
                    textLayers: textLayers
                },
                originalDesign: location.state?.originalDesign
            };

            // 🟢 PERSIST TO LOCALSTORAGE (Safe wrap for huge assets)
            try {
                localStorage.setItem('temp_design_snapshots', JSON.stringify(submissionData));
            } catch (e) {
                console.warn("Storage quota exceeded for snapshots. Designs will only be available via memory state.");
                // Optionally clear some space
                localStorage.removeItem('RECOVERY_DESIGN');
            }

            // 🟢 SUCCESS: Keep isSaving = true so the loader stays while navigating
            navigate('/submit-product', { state: submissionData });
        } catch (err: any) {
            console.error("Submission preparation failed:", err);
            alert(`Failed to prepare submission: ${err.message || "Unknown error"}. Please try again.`);
            setIsSaving(false);
        }
    };


    // 🟢 HELPER: Convert blob URLs to Data URLs so they persist on navigation
    const normalizeImageLayers = async (layers: ImageLayer[]): Promise<ImageLayer[]> => {
        const normalized = await Promise.all(layers.map(async (layer) => {
            if (layer.src.startsWith('blob:')) {
                try {
                    const response = await fetch(layer.src);
                    const blob = await response.blob();
                    return new Promise<ImageLayer>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve({ ...layer, src: reader.result as string });
                        reader.readAsDataURL(blob);
                    });
                } catch (e) {
                    console.error("Failed to normalize layer:", layer.id, e);
                    return layer;
                }
            }
            return layer;
        }));
        return normalized;
    };


    const moveLayer = (id: number, direction: 'up' | 'down') => {
        // 1. Combine all layers into a single master list
        const allLayers = [
            ...imageLayers.map(l => ({ ...l, layerType: 'image' })),
            ...textLayers.map(t => ({ ...t, layerType: 'text' }))
        ].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

        const idx = allLayers.findIndex(l => l.id === id);
        if (idx === -1) return;

        // 2. Identify the neighbor layer to swap with
        const swapIdx = direction === 'up' ? idx + 1 : idx - 1;
        if (swapIdx < 0 || swapIdx >= allLayers.length) return;

        const currentLayer = allLayers[idx];
        const neighborLayer = allLayers[swapIdx];

        // 3. Swap the zIndex values
        const tempZ = currentLayer.zIndex;
        currentLayer.zIndex = neighborLayer.zIndex;
        neighborLayer.zIndex = tempZ;

        // 4. Splittin them back into their original state arrays
        const newImages = allLayers
            .filter(l => l.layerType === 'image')
            .map(({ layerType, ...rest }) => rest as ImageLayer);

        const newTexts = allLayers
            .filter(l => l.layerType === 'text')
            .map(({ layerType, ...rest }) => rest as TextConfig);

        // 5. Update state to trigger the re-render
        setImageLayers(newImages);
        setTextLayers(newTexts);
        addToHistory(newImages, newTexts);
    };

    const handleSaveCrop = async () => {
        // 1. Safety check
        if (!completedCrop || !cropTargetId || !cropImageSrc || !cropImageRef.current) return;

        const image = new Image();
        image.crossOrigin = "anonymous";
        // Fetch original untouched src
        image.src = cropImageSrc;

        image.onload = () => {
            const canvas = document.createElement('canvas');
            // Use rendered dimensions from cropImageRef 
            const scaleX = image.naturalWidth / cropImageRef.current!.width;
            const scaleY = image.naturalHeight / cropImageRef.current!.height;

            const pixelRatio = window.devicePixelRatio || 1;
            canvas.width = completedCrop.width * scaleX * pixelRatio;
            canvas.height = completedCrop.height * scaleY * pixelRatio;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                ctx.imageSmoothingQuality = 'high';

                // 3. Draw only the selected part of the image onto the canvas
                ctx.drawImage(
                    image,
                    completedCrop.x * scaleX,
                    completedCrop.y * scaleY,
                    completedCrop.width * scaleX,
                    completedCrop.height * scaleY,
                    0, 0, completedCrop.width * scaleX, completedCrop.height * scaleY
                );

                // 4. Convert the canvas back into a usable image URL
                const croppedUrl = canvas.toDataURL('image/png');

                // 5. Update the specific image on the T-shirt
                const updatedImages = imageLayers.map(img =>
                    img.id === cropTargetId ? { ...img, src: croppedUrl } : img
                );

                setImageLayers(updatedImages);
                addToHistory(updatedImages, textLayers);

                // 6. Close the modal and reset crop states
                setShowCropModal(false);
                setCropImageSrc(null);
                setCropTargetId(null);
            }
        };
        image.onerror = () => {
            alert('Failed to load image for cropping, please check CORS or retry');
        };
    };

    const renderTShirtWorkspace = () => {
        const config = viewMode === 'edit'
            ? MOCKUP_CONFIG.front
            : (MOCKUP_CONFIG[currentSide as keyof typeof MOCKUP_CONFIG] || MOCKUP_CONFIG.front);

        const isPreview = viewMode === 'preview';
        const shouldShowDesign = viewMode === 'edit' ? true : config.showDesign;
        const useRealisticPreview = isPreview && REALISTIC_PREVIEW_SIDES.has(currentSide);

        const isWideView = currentSide === 'folded' || currentSide === 'neck';
        const maskSrc = (config as any).mask || config.img;

        return (
            <div
                ref={mockupContainerRef} // 🚀 Capture the WHOLE T-shirt (Color + Design)
                style={{
                    position: 'relative',
                    width: isWideView ? '850px' : '550px',
                    height: '800px',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    isolation: 'isolate',
                    transform: `scale(${mockupScale})`,
                    transformOrigin: 'center center',
                    flexShrink: 0,
                    transition: 'transform 0.3s ease, width 0.3s ease',
                    margin: '-40px auto 0 auto'
                }}>
                {/* 1. Base Mockup Image */}
                <img
                    src={config.img?.startsWith?.('/uploads') ? `${API_URL}${config.img}` : config.img}
                    alt="Mockup"
                    crossOrigin="anonymous"
                    style={{
                        position: 'absolute',
                        display: 'block',
                        height: '125%',
                        width: '125%',
                        objectFit: 'contain',
                        top: '-100px',
                        right: '-71px',
                        zIndex: 1
                    }}
                />

                {/* 2. Color Overlay Layer */}
                <div style={{
                    position: 'absolute',
                    top: '-100px',
                    right: '-71px',
                    width: '125%',
                    height: '125%',
                    backgroundColor: selectedTshirtColor,
                    display: selectedTshirtColor.toLowerCase() === '#ffffff' ? 'none' : 'block',
                    mixBlendMode: 'multiply',
                    WebkitMaskImage: `url(${maskSrc?.startsWith?.('/uploads') ? `${API_URL}${maskSrc}` : maskSrc})`,
                    maskImage: `url(${maskSrc?.startsWith?.('/uploads') ? `${API_URL}${maskSrc}` : maskSrc})`,
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    zIndex: 2,
                    pointerEvents: 'none',
                }}></div>

                {/* 3. Design Print Area (Masked to T-shirt silhouette) */}
                <div style={{
                    position: 'absolute',
                    top: '-100px',
                    right: '-71px',
                    width: '125%',
                    height: '125%',
                    WebkitMaskImage: isPreview ? `url(${maskSrc})` : 'none',
                    maskImage: isPreview ? `url(${maskSrc})` : 'none',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    zIndex: 20,
                    pointerEvents: 'none'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '100px',
                        right: '71px',
                        width: isWideView ? '850px' : '550px',
                        height: '800px',
                        pointerEvents: 'none'
                    }}>
                        {/* Outer wrapper handles the positioning and transforms */}
                        <div style={{
                            position: 'absolute',
                            zIndex: 20,
                            top: config.printArea.top,
                            left: config.printArea.left,
                            width: config.printArea.width,
                            height: config.printArea.height,
                            marginLeft: `calc(-1 * ${config.printArea.width} / 2)`,
                            marginTop: `calc(-1 * ${config.printArea.height} / 2)`,
                            transform: `rotate(${(config.printArea as any).rotation ?? 0}deg)`,
                            pointerEvents: isPreview ? 'none' : 'auto',
                        }}>
                            {/* Inner print area has no transforms, making html2canvas capture perfectly */}
                            <div
                                ref={printAreaRef}
                                className={`print-area ${currentSide === 'back' ? 'back-view' : ''}`}
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    border: viewMode === 'edit' && !isSaving ? '2px dashed rgba(0,0,0,0.4)' : 'none',
                                    overflow: 'hidden',
                                    boxSizing: 'border-box',
                                    isolation: 'isolate'
                                }}
                            >
                                {/* Image Layers */}
                                {shouldShowDesign && imageLayers.map((layer, idx) => (
                                    <img
                                        key={layer.id}
                                        src={layer.src?.startsWith?.('/uploads') ? `${API_URL}${layer.src}` : layer.src}
                                        style={{
                                            position: 'absolute',
                                            // 🚀 AGGRESSIVE OVERRIDE: If fulfillment or locked, force it to fill the box
                                            ...((layer.isLocked || layer.isFulfillmentBase) ? {
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                maxWidth: 'none',
                                                maxHeight: 'none',
                                                objectFit: 'contain',
                                                transform: 'none',
                                                zIndex: layer.zIndex || 0,
                                                display: 'block'
                                            } : {
                                                zIndex: layer.zIndex,
                                                transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale * (config.designScale || 1)}) rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`
                                            }),
                                            mixBlendMode: (isPreview && selectedTshirtColor.toLowerCase() !== '#ffffff') ? 'multiply' : 'normal',
                                            opacity: isPreview ? 0.92 : 1,
                                            cursor: layer.isLocked ? 'default' : 'move',
                                            border: (!layer.isLocked && selectedId === layer.id && viewMode === 'edit' && !isSaving) ? '1px dashed #0d375b' : 'none',
                                            pointerEvents: layer.isLocked ? 'none' : 'auto'
                                        }}
                                        onMouseDown={(e) => !layer.isLocked && handleDragStart(e, layer.id, 'image', layer.x, layer.y)}
                                    />
                                ))}

                                {/* Text Layers */}
                                {shouldShowDesign && textLayers.map((t) => (
                                    <div
                                        key={t.id}
                                        style={{
                                            position: 'absolute',
                                            zIndex: t.zIndex,
                                            transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale * (config.designScale || 1)}) rotate(${t.rotation}deg)`,
                                            cursor: 'move',
                                            border: (selectedId === t.id && viewMode === 'edit' && !isSaving) ? '1px solid #0d375b' : 'none',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px'
                                        }}
                                        onMouseDown={(e) => handleDragStart(e, t.id, 'text', t.x, t.y)}
                                    >
                                        {t.styleId === 'default' && (
                                            <>
                                                {/* 🚀 If curve exists and isn't 0, render as CurvedText, else render as normal Div */}
                                                {(t.curve !== 0 && t.curve !== undefined) ? (
                                                    <CurvedText
                                                        id={t.id}
                                                        text={t.text}
                                                        fontFamily={t.font}
                                                        color={t.color}
                                                        curve={t.curve ?? 0}
                                                        letterSpacing={t.letterSpacing || 0}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        fontFamily: t.font,
                                                        color: t.color,
                                                        fontSize: '24px',
                                                        fontWeight: 'bold',
                                                        whiteSpace: 'nowrap',
                                                        letterSpacing: `${t.letterSpacing || 0}px`,
                                                        textShadow: isPreview ? '0px 1px 3px rgba(0,0,0,0.3)' : 'none'
                                                    }}>
                                                        {t.text}
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* --- WAVE STYLE --- */}
                                        {t.styleId === 'style-wave' && (
                                            <div style={{
                                                fontFamily: t.font, color: '#00d2ff', fontSize: '28px', fontWeight: '900',
                                                textTransform: 'uppercase', textShadow: '2px 2px 0px #0d375b',
                                                transform: 'skewX(-10deg)', fontStyle: 'italic',
                                                letterSpacing: `${t.letterSpacing || 0}px`
                                            }}>
                                                {t.text}
                                            </div>
                                        )}

                                        {/* --- STACK STYLE --- */}
                                        {t.styleId === 'style-stack' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '0.9', alignItems: 'center', letterSpacing: `${t.letterSpacing || 0}px` }}>
                                                {[1, 2, 3].map((i) => (
                                                    <span key={i} style={{ fontFamily: t.font, color: i === 2 ? t.color : 'transparent', WebkitTextStroke: i === 2 ? 'none' : `1px ${t.color}`, fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>{t.text}</span>
                                                ))}
                                            </div>
                                        )}

                                        {/* --- FISH STYLE --- */}
                                        {t.styleId === 'style-fish' && (
                                            <div style={{ fontFamily: t.font, color: t.color, fontSize: '26px', fontWeight: 'bold', transform: 'scaleY(1.4) scaleX(0.9)', letterSpacing: `${(t.letterSpacing || 0) - 1}px` }}>
                                                {t.text}
                                            </div>
                                        )}

                                        {/* --- CIRCLE & CUSTOM CURVED --- */}
                                        {!['default', 'style-wave', 'style-stack', 'style-fish'].includes(t.styleId || '') && (
                                            <CurvedText
                                                id={t.id} text={t.text} styleId={t.styleId} fontFamily={t.font} color={t.color}
                                                curve={t.styleId === 'style-circle' ? (t.curve ?? 120) : (t.curve ?? 0)}
                                                letterSpacing={t.letterSpacing || 0}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Realistic Wrinkles/Shadows */}
                {shouldShowDesign && useRealisticPreview && (
                    <div style={{
                        position: 'absolute', top: '-100px', right: '-71px', width: '125%', height: '125%',
                        backgroundImage: `url(${config.img})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                        mixBlendMode: 'multiply', opacity: 0.15, pointerEvents: 'none', zIndex: 15
                    }} />
                )}
            </div>
        );
    };

    const renderPreviewWorkspace = (side: keyof typeof MOCKUP_CONFIG, showDesign: boolean) => {
        const config = MOCKUP_CONFIG[side];
        const maskSrc = (config as any).mask || config.img;

        // 🟢 Change this value to adjust the specific size of the folded T-shirt!
        const mockupHeight = side === 'folded' ? '500px' : '800px';

        return (
            <div style={{
                position: 'relative',
                width: 'fit-content',
                height: mockupHeight,
                WebkitMaskImage: `url(${maskSrc})`,
                maskImage: `url(${maskSrc})`,
                WebkitMaskSize: (config as any).maskSize || 'contain',
                maskSize: (config as any).maskSize || 'contain',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskRepeat: 'no-repeat',
                overflow: 'hidden'
            }}>
                {/* 1. Mockup */}
                <img src={config.img} alt="Mockup" style={{ height: '100%', display: 'block' }} crossOrigin="anonymous" />

                {/* 2. Accurate Color Multiply */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: selectedTshirtColor,
                    mixBlendMode: 'multiply',
                    WebkitMaskImage: `url(${maskSrc})`, maskImage: `url(${maskSrc})`,
                    WebkitMaskSize: (config as any).maskSize || 'contain',
                    maskSize: (config as any).maskSize || 'contain',
                    WebkitMaskPosition: 'center', maskPosition: 'center',
                    WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                    zIndex: 2,
                }}></div>

                {/* 3. Design Clipping */}
                {showDesign && (
                    <div style={{
                        position: 'absolute',
                        top: config.printArea.top,
                        left: config.printArea.left,
                        width: config.printArea.width,
                        height: config.printArea.height,
                        transform: `translate(-50%, -50%) rotate(${(config.printArea as any).rotation ?? 0}deg)`,
                        overflow: 'hidden', // 🚀 Essential for the cropped design look
                        zIndex: 20
                    }}>
                        {/* Render Image Layers */}
                        {imageLayers.map((layer, idx) => {
                            const isFulfillment = layer.isLocked || layer.isFulfillmentBase;
                            return (
                                <img key={layer.id} src={layer.src} style={{
                                    position: 'absolute',
                                    ...(isFulfillment ? {
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        maxWidth: 'none',
                                        maxHeight: 'none',
                                        objectFit: 'contain',
                                        transform: 'none',
                                        zIndex: layer.zIndex || 0,
                                        display: 'block'
                                    } : {
                                        zIndex: layer.zIndex,
                                        transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale * (config.designScale || 1)}) rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1})`,
                                    }),
                                    mixBlendMode: selectedTshirtColor.toLowerCase() === '#ffffff' ? 'normal' : 'multiply',
                                    opacity: 0.95
                                }} />
                            );
                        })}
                        {/* Render Text Layers */}
                        {textLayers.map((t) => (
                            <div key={t.id} style={{
                                position: 'absolute',
                                zIndex: t.zIndex,
                                transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale * (config.designScale || 1)}) rotate(${t.rotation}deg)`,
                            }}>
                                {t.styleId === 'default' ? (
                                    <div style={{ fontFamily: t.font, color: t.color, fontSize: '24px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{t.text}</div>
                                ) : (
                                    <CurvedText
                                        id={t.id}
                                        text={t.text}
                                        styleId={t.styleId}
                                        fontFamily={t.font}
                                        color={t.color}
                                        /* 🟢 The Fix: Use (t.curve || 0) to ensure it's never undefined */
                                        curve={t.styleId === 'style-circle' ? (t.curve ?? 120) : (t.curve ?? 0)}
                                        letterSpacing={t.letterSpacing || 0}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderThumbnailDesign = (side: string) => {
        const config = MOCKUP_CONFIG[side as keyof typeof MOCKUP_CONFIG];
        const backViews = ['back', 'model_back'];
        if (!config || !config.printArea || backViews.includes(side)) return null;

        // 🟢 THE KEY: This scale must match the ratio between your 
        // sidebar card size and your main workspace size.
        const finalThumbnailScale = 0.25;

        return (
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                overflow: 'hidden',
            }}>
                {/* This inner div acts as a 'Mirror' of the entire Print Area */}
                <div style={{
                    position: 'relative',
                    // 🟢 We use the actual print area dimensions from your config
                    width: config.printArea.width,
                    height: config.printArea.height,
                    transform: `scale(${finalThumbnailScale})`,
                    transformOrigin: 'center center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                } as any}>

                    {/* 1. Image Layers */}
                    {imageLayers.map((layer, idx) => {
                        const isFulfillment = layer.isLocked || layer.isFulfillmentBase || (fulfillmentRequest && idx === 0);
                        return (
                            <img
                                key={layer.id}
                                src={layer.src}
                                style={{
                                    position: 'absolute',
                                    ...(isFulfillment ? {
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        maxWidth: 'none',
                                        maxHeight: 'none',
                                        objectFit: 'contain',
                                        transform: 'none',
                                        zIndex: 100,
                                        display: 'block'
                                    } : {
                                        zIndex: layer.zIndex,
                                        transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale * (config.designScale || 1)}) rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1})`,
                                    }),
                                    transformOrigin: 'center center',
                                    maxWidth: 'none'
                                }}
                            />
                        );
                    })}

                    {/* 2. Text Layers */}
                    {textLayers.map((t) => (
                        <div
                            key={t.id}
                            style={{
                                position: 'absolute',
                                zIndex: t.zIndex,
                                transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale * (config.designScale || 1)}) rotate(${t.rotation}deg)`,
                                transformOrigin: 'center center',
                                cursor: 'pointer',
                                padding: '10px'
                            }}
                            onClick={() => setSelectedId(t.id)}
                        >
                            <CurvedText
                                id={t.id}
                                text={t.text}
                                fontFamily={t.font}
                                color={t.color}
                                curve={t.styleId === 'style-circle' ? (t.curve ?? 120) : (t.curve ?? 0)}
                                letterSpacing={t.letterSpacing || 0}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const handleToggleView = (mode: 'edit' | 'preview') => {
        setViewMode(mode);
        if (mode === 'edit') {
            setCurrentSide('front');
        }
    };

    const renderPreviewMode = () => {
        const previewSides = [
            { id: 'front', label: 'Front View', showDesign: true },
            { id: 'back', label: 'Back View', showDesign: false },
            { id: 'neck', label: 'Neck Detail', showDesign: true, zoom: 0.8 },
            { id: 'folded', label: 'Folded View', showDesign: true, zoom: 1.5 }
        ];

        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                backgroundColor: '#ffffff',
                overflowY: 'auto',
                padding: '40px 20px',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '40px'
                }}>
                    <h2 style={{ color: '#0d375b', fontSize: '28px', fontWeight: '800' }}>Design Preview</h2>
                    <p style={{ color: '#666' }}>Review your custom product from all angles</p>
                </div>

                {/* Responsive Grid: 2x2 on Desktop, 1x1 on Mobile */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '30px',
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>
                    {previewSides.map((side) => {
                        const config = MOCKUP_CONFIG[side.id as keyof typeof MOCKUP_CONFIG];
                        return (
                            <div key={side.id} style={{
                                backgroundColor: '#f9f9f9',
                                borderRadius: '20px',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                overflow: 'hidden'
                            }}>
                                <span style={{
                                    alignSelf: 'flex-start',
                                    backgroundColor: '#0d375b',
                                    color: 'white',
                                    padding: '5px 15px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    marginBottom: '15px'
                                }}>
                                    {side.label}
                                </span>

                                {/* Viewport for the Mockup */}
                                <div style={{
                                    width: '100%',
                                    height: '400px',
                                    position: 'relative',
                                    overflow: 'hidden', // handles the cropping for Neck/Folded
                                    borderRadius: '12px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        transform: `scale(${side.zoom || 1})`,
                                        transition: 'transform 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {renderPreviewWorkspace(side.id as any, side.showDesign)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>


            </div>
        );
    };

    const renderTShirtWorkspaceForSnapshots = () => {
        const config = MOCKUP_CONFIG[currentSide as keyof typeof MOCKUP_CONFIG] || MOCKUP_CONFIG.front;
        const isWideView = currentSide === 'folded' || currentSide === 'neck';
        const maskSrc = (config as any).mask || config.img;

        return (
            <div style={{
                position: 'relative',
                width: isWideView ? '850px' : '550px',
                height: '800px',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                isolation: 'isolate'
            }}>
                <img src={config.img} alt="Mockup" crossOrigin="anonymous" style={{ position: 'absolute', height: '125%', width: '125%', objectFit: 'contain', top: '-100px', right: '-71px', zIndex: 1 }} />
                <div style={{ position: 'absolute', top: '-100px', right: '-71px', width: '125%', height: '125%', backgroundColor: selectedTshirtColor, display: selectedTshirtColor.toLowerCase() === '#ffffff' ? 'none' : 'block', mixBlendMode: 'multiply', WebkitMaskImage: `url(${maskSrc})`, maskImage: `url(${maskSrc})`, WebkitMaskSize: 'contain', maskSize: 'contain', zIndex: 2 }} />
                <div style={{ position: 'absolute', top: '-100px', right: '-71px', width: '125%', height: '125%', WebkitMaskImage: `url(${maskSrc})`, maskImage: `url(${maskSrc})`, WebkitMaskSize: 'contain', maskSize: 'contain', zIndex: 20 }}>
                    <div style={{ position: 'absolute', top: '100px', right: '71px', width: isWideView ? '850px' : '550px', height: '800px' }}>
                        <div style={{ position: 'absolute', zIndex: 20, top: config.printArea.top, left: config.printArea.left, width: config.printArea.width, height: config.printArea.height, marginLeft: `calc(-1 * ${config.printArea.width} / 2)`, marginTop: `calc(-1 * ${config.printArea.height} / 2)`, transform: `rotate(${(config.printArea as any).rotation ?? 0}deg)` }}>
                            <div ref={snapshotPrintRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'visible' }}>
                                {imageLayers.map((layer, idx) => {
                                    const isFulfillment = layer.isLocked || layer.isFulfillmentBase;
                                    let imgSrc = layer.src;
                                    if (imgSrc.startsWith('/uploads')) {
                                        imgSrc = `http://localhost:5000${imgSrc}`;
                                    }

                                    return (
                                        <img
                                            key={layer.id}
                                            src={imgSrc}
                                            crossOrigin="anonymous"
                                            style={{
                                                position: 'absolute',
                                                ...(isFulfillment ? {
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    maxWidth: 'none',
                                                    maxHeight: 'none',
                                                    objectFit: 'contain',
                                                    transform: 'none',
                                                    zIndex: layer.zIndex || 0,
                                                    display: 'block'
                                                } : {
                                                    zIndex: layer.zIndex,
                                                    transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale * (config.designScale || 1)}) rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1})`,
                                                }),
                                                transformOrigin: 'center center'
                                            }}
                                        />
                                    );
                                })}
                                {textLayers.map((t) => (
                                    <div key={t.id} style={{ position: 'absolute', zIndex: t.zIndex, transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale * (config.designScale || 1)}) rotate(${t.rotation}deg)`, transformOrigin: 'center center' }}>
                                        <CurvedText id={t.id} text={t.text} fontFamily={t.font} color={t.color} curve={t.styleId === 'style-circle' ? (t.curve ?? 120) : (t.curve ?? 0)} letterSpacing={t.letterSpacing || 0} styleId={t.styleId} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="design-dashboard-container" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f5f5f5', position: 'relative' }}>
            {/* 🟢 INSTANT FULL SCREEN LOADER: Hides EVERYTHING during snapshotting */}
            {isSaving && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: '#ffffff',
                    zIndex: 200000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'all'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '5px solid #f3f3f3',
                        borderTop: '5px solid #0d375b',
                        borderRadius: '50%',
                        animation: 'designToolSpin 1s linear infinite',
                        marginBottom: '20px'
                    }}></div>
                    <h2 style={{ color: '#0d375b', fontSize: '24px', fontWeight: '800', margin: 0 }}>Preparing Your Design</h2>
                    <p style={{ color: '#666', marginTop: '10px', fontWeight: 500 }}>Capturing high-quality mockups for your store...</p>
                    <style>{`@keyframes designToolSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {/* 🟢 HIDDEN BACKGROUND WORKSPACE FOR SNAPSHOTS */}
            <div style={{ position: 'absolute', left: '-10000px', top: '-10000px', pointerEvents: 'none' }}>
                <div ref={snapshotMockupRef} style={{ position: 'relative', width: currentSide === 'folded' || currentSide === 'neck' ? '850px' : '550px', height: '800px' }}>
                    {/* Re-render the same workspace logic but attached to the hidden refs */}
                    {renderTShirtWorkspaceForSnapshots()}
                </div>
            </div>

            {/* 1. SIDEBAR */}
            {viewMode === 'edit' && (
                <div className="design-sidebar" style={{ width: '220px', flexShrink: 0 }}>
                    <div className="sidebar-logo">Cre8tify</div>
                    <div className="sidebar-menu">
                        <label className="sidebar-btn">
                            <img src="/img/upload.png" alt="Upload" className="sidebar-icon" />
                            Upload
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        </label>
                        <div className={`sidebar-btn ${activePanel === 'text' ? 'active' : ''}`} onClick={() => setActivePanel('text')}>
                            <img src="/img/text.png" alt="Text" className="sidebar-icon" />
                            Add Text
                        </div>
                        <div className={`sidebar-btn ${activePanel === 'colors' ? 'active' : ''}`} onClick={() => setActivePanel('colors')}>
                            <img src="/img/brush.png" alt="Colours" className="sidebar-icon" />
                            Colours
                        </div>
                        <div className={`sidebar-btn ${activePanel === 'size' ? 'active' : ''}`} onClick={() => setActivePanel('size')}>
                            <img src="/img/resize.png" alt="Size" className="sidebar-icon" />
                            Size
                        </div>
                        <div className={`sidebar-btn ${activePanel === 'layers' ? 'active' : ''}`} onClick={() => setActivePanel('layers')}>
                            <img src="/img/layer.png" alt="Layers" className="sidebar-icon" />
                            Layers
                        </div>
                        <div className={`sidebar-btn ${activePanel === 'library' ? 'active' : ''}`} onClick={() => setActivePanel('library')}>
                            <img src="/img/design.png" alt="Library" className="sidebar-icon" />
                            Library
                        </div>
                    </div>
                </div>
            )}

            {/* 2. MAIN CONTENT */}
            <div
                className="design-main-content"
                style={{
                    flex: 1,
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5',
                    width: viewMode === 'preview' ? '100%' : undefined,
                    marginLeft: viewMode === 'preview' ? 0 : undefined,
                    pointerEvents: isSaving ? 'none' : 'auto'
                }}
            >

                {/* 🟢 TOP HEADER */}
                <header className="design-top-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    minHeight: '70px',
                    flexShrink: 0,
                    backgroundColor: '#0d375b',
                    zIndex: 1000
                }}>
                    {/* Left Side: Back Button */}
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}
                        onClick={() => {
                            if (fulfillmentRequest) {
                                navigate('/requests');
                            } else if (location.state?.isEdit) {
                                navigate('/my-shop');
                            } else {
                                navigate('/designer-dashboard');
                            }
                        }}
                    >
                        <img src="/img/back.png" alt="Back" style={{ width: '15px', height: '15px', filter: 'invert(1)' }} />
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>Back</span>
                    </div>

                    {/* Right Side: Profile */}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px', marginRight: '30px' }}>
                        {/* Profile Picture */}
                        <img
                            src={navProfileImg}
                            alt="Profile"
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                            onClick={() => navigate(currentUserRole === 'designer' || currentUserRole === 'admin' ? '/designer-profile' : '/customer-profile')}
                        />
                    </div>
                </header>

                {showVariantPopup && (
                    /* 🚀 Changed to absolute and used top: 10px to match Info Card exactly */
                    <div className="variant-sidebar-overlay" style={{
                        position: 'absolute',
                        top: '80px',
                        right: '10px',
                        zIndex: 3000,
                        pointerEvents: 'auto'
                    }}>
                        <div className="variant-popup-card" onClick={e => e.stopPropagation()} style={{
                            backgroundColor: 'white',
                            width: '280px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                            border: '1px solid #e2e8f0',
                            maxHeight: '320px', // 🚀 Exact match to Info Card
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Tabs */}
                            <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #eee' }}>
                                <button onClick={() => setActiveVariantTab('color')} style={{
                                    flex: 1, padding: '12px', border: 'none',
                                    background: activeVariantTab === 'color' ? '#fff' : 'transparent',
                                    fontWeight: '800', fontSize: '11px', cursor: 'pointer',
                                    color: activeVariantTab === 'color' ? '#0d375b' : '#94a3b8',
                                    textTransform: 'uppercase',
                                    borderBottom: activeVariantTab === 'color' ? '2px solid #0d375b' : 'none'
                                }}>Colors</button>
                                <button onClick={() => setActiveVariantTab('size')} style={{
                                    flex: 1, padding: '12px', border: 'none',
                                    background: activeVariantTab === 'size' ? '#fff' : 'transparent',
                                    fontWeight: '800', fontSize: '11px', cursor: 'pointer',
                                    color: activeVariantTab === 'size' ? '#0d375b' : '#94a3b8',
                                    textTransform: 'uppercase',
                                    borderBottom: activeVariantTab === 'size' ? '2px solid #0d375b' : 'none'
                                }}>Sizes</button>
                            </div>

                            {/* Selection Area */}
                            <div style={{ padding: '15px', overflowY: 'auto', flex: 1 }}>
                                {activeVariantTab === 'color' ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {availableColors.map(c => (
                                            <div key={c.name} onClick={() => c.isAvailable && setSelectedTshirtColor(c.hex)} style={{
                                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
                                                cursor: c.isAvailable ? 'pointer' : 'not-allowed', borderRadius: '8px',
                                                border: selectedTshirtColor === c.hex ? '1.5px solid #0d375b' : '1px solid #f1f5f9',
                                                background: selectedTshirtColor === c.hex ? '#f0f7ff' : 'transparent',
                                                opacity: c.isAvailable ? 1 : 0.4,
                                                filter: c.isAvailable ? 'none' : 'grayscale(1)',
                                                transition: 'all 0.2s ease' // 🚀 Smooth transition for selection
                                            }}>
                                                {/* 🚀 THE UPDATED FABRIC SWATCH CIRCLE */}
                                                <div style={{
                                                    width: '16px', // Slightly larger looks better for textures
                                                    height: '16px',
                                                    borderRadius: '50%',
                                                    background: c.gradient, // Using the textured gradient here
                                                    border: '1px solid rgba(0,0,0,0.1)',
                                                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)' // Mimics light hitting fabric
                                                }} />
                                                <span style={{ fontSize: '10px', fontWeight: '600', color: '#1e293b' }}>{c.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                        {availableSizes.map(s => (
                                            <div key={s.label} style={{
                                                padding: '12px 0', textAlign: 'center', borderRadius: '8px',
                                                border: s.isAvailable ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                                                fontSize: '11px', fontWeight: '800',
                                                backgroundColor: s.isAvailable ? '#fff' : '#f8fafc',
                                                color: s.isAvailable ? '#0f172a' : '#cbd5e1',
                                                cursor: s.isAvailable ? 'default' : 'not-allowed',
                                                opacity: s.isAvailable ? 1 : 0.6,
                                                textDecoration: s.isAvailable ? 'none' : 'line-through'
                                            }}>{s.label}</div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '10px 15px 15px', borderTop: '1px solid #f1f5f9' }}>
                                <button onClick={() => setShowVariantPopup(false)} style={{
                                    width: '100%', padding: '10px', border: 'none',
                                    backgroundColor: '#0d375b', color: 'white',
                                    borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer'
                                }}>{activeVariantTab === 'size' ? 'Available Sizes' : 'Apply'}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🟢 CONDITIONAL RENDERING: EDIT vs PREVIEW */}
                {viewMode === 'edit' ? (
                    <div className="design-wrapper" style={{ display: 'flex', flexDirection: 'row', flex: 1, width: '100%', position: 'relative', overflow: 'hidden' }}>

                        {/* 🟢 SIDE PANELS */}
                        {activePanel === 'text' && (
                            <div className="side-panel-container">
                                <div className="panel-header">
                                    <h3 className="panel-title">Add text</h3>
                                    <button className="panel-close-btn" onClick={() => setActivePanel('none')}>✕</button>
                                </div>

                                {/* 1. FONT SEARCH */}
                                <div className="panel-search-container">
                                    <input
                                        type="text"
                                        placeholder="Search fonts..."
                                        className="panel-search-input"
                                        value={librarySearchTerm}
                                        onChange={(e) => setLibrarySearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="panel-scroll-area">
                                    {/* 2. CRITICAL: THE CUSTOM TEXT ENTRY BOX */}
                                    <div className="panel-section" style={{ padding: '0 15px 20px 15px', borderBottom: '1px solid #eee' }}>
                                        <label style={{ fontSize: '11px', color: '#888', fontWeight: '700', marginBottom: '10px', display: 'block' }}>
                                            EDIT CONTENT
                                        </label>
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Type your words here..."
                                            value={activeTextConfig?.text || ''}
                                            onChange={(e) => updateActiveLayer('text', e.target.value, true)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '6px',
                                                border: '1px solid #bec1c4ff',
                                                fontSize: '12px',
                                                outline: 'none',
                                                backgroundColor: '#fff'
                                            }}
                                        />
                                    </div>

                                    {/* 3. STYLES SECTION */}
                                    <div className="panel-section">
                                        <div className="panel-section-title">Styles</div>
                                        <div className="curved-text-grid">
                                            {TEXT_STYLES_CONFIG.map((style) => (
                                                <div key={style.id} className="curved-text-card" onClick={() => handleTextSelection(style)}>
                                                    {style.img ? (
                                                        <img src={style.img} alt={style.label} className="curved-text-img" />
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '10px', textAlign: 'center', fontWeight: 700, color: '#0d375b' }}>
                                                            {style.label}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 4. FONTS SECTION */}
                                    <div className="panel-section" style={{ borderBottom: 'none' }}>
                                        <div className="panel-section-title">Fonts</div>
                                        {FONT_LIST.filter(f => f.toLowerCase().includes(librarySearchTerm.toLowerCase())).map((font) => (
                                            <div key={font} className="font-list-item" onClick={() => handleFontSelection(font)}>
                                                <span style={{ fontFamily: font }}>{font}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* COLOURS PANEL (With Transparency Slider) */}
                        {activePanel === 'colors' && (
                            <div className="side-panel-container">
                                <div className="panel-header">
                                    <h3 className="panel-title">Text Colour</h3>
                                    <button className="panel-close-btn" onClick={() => setActivePanel('none')}>✕</button>
                                </div>
                                <div className="panel-scroll-area">
                                    <div className="panel-section">
                                        <div className="panel-section-title">Choose a colour</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', padding: '15px' }}>
                                            {TEXT_COLORS.map((colorHex) => (
                                                <div key={colorHex} onClick={() => { const newText = activeTextConfig ? { ...activeTextConfig, color: colorHex } : null; if (newText) { setActiveTextConfig(newText, true); } }}
                                                    style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '50%', backgroundColor: colorHex, cursor: 'pointer', border: '1px solid #ddd', boxShadow: activeTextConfig?.color === colorHex ? '0 0 0 3px #0d375b' : 'none', transition: 'transform 0.1s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="panel-section" style={{ borderTop: '1px solid #eee' }}>
                                        <div className="panel-section-title">Custom Colour</div>
                                        <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ width: '100%' }}>
                                                <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Tap to pick shade</label>
                                                <input type="color" value={activeTextConfig?.color || '#000000'} onChange={(e) => { if (activeTextConfig) { setActiveTextConfig({ ...activeTextConfig, color: e.target.value }); } }} onBlur={() => { if (activeTextConfig) { setActiveTextConfig(activeTextConfig, true); } }} style={{ width: '100%', height: '45px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '8px', padding: '3px', backgroundColor: 'white' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="panel-section">
                                        <div className="panel-section-title">Transparency</div>
                                        <div style={{ padding: '15px' }}>
                                            <input type="range" min="0" max="1" step="0.1" defaultValue="1" style={{ width: '100%', cursor: 'pointer', accentColor: '#0d375b' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SIZE PANEL (Scale, Rotation, X/Y, Spacing, Curve) */}
                        {activePanel === 'size' && (
                            <div className="side-panel-container">
                                <div className="panel-header" style={{ padding: '12px 15px' }}>
                                    <h3 className="panel-title" style={{ fontSize: '15px' }}>Size & Effects</h3>
                                    <button className="panel-close-btn" onClick={() => setActivePanel('none')}>✕</button>
                                </div>
                                <div className="panel-scroll-area">
                                    <div className="panel-section">
                                        <div className="panel-section-title" style={{ fontSize: '12px', padding: '10px 15px' }}>Adjust Layer</div>
                                        <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}> {/* 🟢 Reduced Gap */}

                                            {/* 1. SCALE */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
                                                    <span>Scale</span>
                                                    <span>{Math.round(getCurrentValue('scale') * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0.2" max="3" step="0.1"
                                                    value={getCurrentValue('scale')}
                                                    onChange={(e) => updateActiveLayer('scale', parseFloat(e.target.value), false)}
                                                    style={{ width: '100%', accentColor: '#0d375b', cursor: 'pointer', height: '4px' }}
                                                />
                                            </div>

                                            {/* 2. ROTATION */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
                                                    <span>Rotation</span>
                                                    <span>{Math.round(getCurrentValue('rotation'))}°</span>
                                                </div>
                                                <input
                                                    type="range" min="-180" max="180" step="1"
                                                    value={getCurrentValue('rotation')}
                                                    onChange={(e) => updateActiveLayer('rotation', parseFloat(e.target.value), false)}
                                                    style={{ width: '100%', accentColor: '#0d375b', cursor: 'pointer', height: '4px' }}
                                                />
                                            </div>

                                            {/* 3. X POSITION */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
                                                    <span>Position X</span>
                                                    <span>{Math.round(getCurrentValue('x'))}px</span>
                                                </div>
                                                <input
                                                    type="range" min="-300" max="300" step="1"
                                                    value={getCurrentValue('x')}
                                                    onChange={(e) => updateActiveLayer('x', parseFloat(e.target.value), false)}
                                                    style={{ width: '100%', accentColor: '#0d375b', cursor: 'pointer', height: '4px' }}
                                                />
                                            </div>

                                            {/* 4. Y POSITION */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
                                                    <span>Position Y</span>
                                                    <span>{Math.round(getCurrentValue('y'))}px</span>
                                                </div>
                                                <input
                                                    type="range" min="-400" max="400" step="1"
                                                    value={getCurrentValue('y')}
                                                    onChange={(e) => updateActiveLayer('y', parseFloat(e.target.value), false)}
                                                    style={{ width: '100%', accentColor: '#0d375b', cursor: 'pointer', height: '4px' }}
                                                />
                                            </div>

                                            {/* 🟢 NEW FEATURES: Only show if a Text Layer is selected */}
                                            {textLayers.some(t => t.id === selectedId) && (
                                                <>
                                                    <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '5px 0' }} />

                                                    {/* 5. LETTER SPACING */}
                                                    <div style={{ marginBottom: '20px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
                                                            <span>Letter Spacing</span>
                                                            <span>{getCurrentValue('letterSpacing') || 0}</span>
                                                        </div>

                                                        {/* 🚀 THE MISSING SLIDER BAR */}
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="50"
                                                            step="1"
                                                            value={getCurrentValue('letterSpacing') || 0}
                                                            onChange={(e) => handleLetterSpacingChange(parseInt(e.target.value))}
                                                            style={{
                                                                width: '100%',
                                                                height: '5px',           // Makes the track thin
                                                                accentColor: '#0d375b',
                                                                cursor: 'pointer',
                                                                marginTop: '8px',
                                                                marginBottom: '8px'
                                                            }}
                                                        />
                                                    </div>

                                                    {/* 6. CURVE */}
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
                                                            <span>Curve (Invert/Outvert)</span>
                                                            <span>{getCurrentValue('curve') || 0}</span>
                                                        </div>
                                                        <input
                                                            type="range" min="-100" max="100" step="1"
                                                            value={getCurrentValue('curve') || 0}
                                                            onChange={(e) => updateActiveLayer('curve', parseFloat(e.target.value), false)}
                                                            style={{ width: '100%', accentColor: '#0d375b', cursor: 'pointer', height: '4px' }}
                                                        />
                                                    </div>
                                                </>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activePanel === 'layers' && (
                            <div className="side-panel-container">
                                <div className="panel-header">
                                    <h3 className="panel-title">Layers</h3>
                                    <button className="panel-close-btn" onClick={() => setActivePanel('none')}>✕</button>
                                </div>
                                <div className="panel-scroll-area">
                                    <div className="panel-section">
                                        <div className="panel-section-title">Manage Elements</div>
                                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                                            {[
                                                ...imageLayers.map((img, idx) => ({ ...img, type: 'image', label: `Image ${idx + 1}` })),
                                                ...textLayers.map((txt, idx) => ({ ...txt, type: 'text', label: `Text ${idx + 1}` }))
                                            ]
                                                .sort((a, b) => b.zIndex - a.zIndex)
                                                .map((layer) => (
                                                    <div
                                                        key={`${layer.type}-${layer.id}`}
                                                        className="layer-row"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '10px', // 🟢 Slimmer rows
                                                            border: selectedId === layer.id ? '2px solid #0d375b' : '1px solid #ddd',
                                                            borderRadius: '10px',
                                                            backgroundColor: '#fff',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => {
                                                            setSelectedId(layer.id);
                                                            if (layer.type === 'text') setActivePanel('text');
                                                        }}
                                                    >
                                                        {/* Thumbnail */}
                                                        <div style={{
                                                            width: '34px', // 🟢 Smaller thumbnail
                                                            height: '34px',
                                                            borderRadius: '6px',
                                                            backgroundColor: '#f5f5f5',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            overflow: 'hidden',
                                                            border: '1px solid #eee'
                                                        }}>
                                                            {layer.type === 'image' ? (
                                                                <img
                                                                    src={(layer as ImageLayer).src}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#0d375b' }}>Aa</div>
                                                            )}
                                                        </div>

                                                        {/* Control Buttons */}
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'up'); }}
                                                                style={{ width: '28px', height: '28px', cursor: 'pointer', border: '1px solid #ddd', background: 'white', borderRadius: '6px', fontSize: '12px' }}
                                                            >↑</button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'down'); }}
                                                                style={{ width: '28px', height: '28px', cursor: 'pointer', border: '1px solid #ddd', background: 'white', borderRadius: '6px', fontSize: '12px' }}
                                                            >↓</button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!window.confirm("Remove layer?")) return;
                                                                    if (layer.type === 'text') {
                                                                        const updated = textLayers.filter(t => t.id !== layer.id);
                                                                        setTextLayers(updated);
                                                                    } else {
                                                                        const updated = imageLayers.filter(i => i.id !== layer.id);
                                                                        setImageLayers(updated);
                                                                    }
                                                                    if (selectedId === layer.id) setSelectedId(null);
                                                                }}
                                                                style={{ width: '28px', height: '28px', cursor: 'pointer', border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '12px' }}
                                                            >🗑</button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activePanel === 'library' && (
                            <div className="side-panel-container">
                                {/* PANEL HEADER */}
                                <div className="panel-header" style={{ padding: '12px 15px' }}>
                                    <h3 className="panel-title" style={{ fontSize: '15px' }}>My library</h3>
                                    <button className="panel-close-btn" onClick={() => setActivePanel('none')}>✕</button>
                                </div>

                                {/* COMPACT SEARCH BAR (Matched to 10px Font) */}
                                <div style={{ padding: '0 15px 12px 15px' }}>
                                    <div style={{
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        height: '28px'
                                    }}>
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#888"
                                            strokeWidth="2.5"
                                            style={{ position: 'absolute', left: '10px' }}
                                        >
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search library"
                                            value={librarySearchTerm}
                                            onChange={(e) => setLibrarySearchTerm(e.target.value)}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                padding: '0 10px 0 30px',
                                                borderRadius: '6px',
                                                border: '1px solid #ddd',
                                                backgroundColor: '#f9f9f9',
                                                fontSize: '10px',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* CONTROLS ROW */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0 15px 12px 15px',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <select
                                        value={librarySort}
                                        onChange={(e: any) => setLibrarySort(e.target.value)}
                                        style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '11px', color: '#333' }}
                                    >
                                        <option value="recent">Recently added</option>
                                        <option value="az">A-Z Name</option>
                                    </select>

                                    <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                                        <button onClick={() => setLibraryView('grid')} style={{ padding: '4px 8px', background: libraryView === 'grid' ? '#0d375b' : 'white', border: 'none', cursor: 'pointer' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" stroke={libraryView === 'grid' ? 'white' : '#555'} fill="none" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                                        </button>
                                        <button onClick={() => setLibraryView('list')} style={{ padding: '4px 8px', background: libraryView === 'list' ? '#0d375b' : 'white', border: 'none', cursor: 'pointer' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" stroke={libraryView === 'list' ? 'white' : '#555'} fill="none" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="3.01" y2="6" /></svg>
                                        </button>
                                    </div>
                                </div>

                                {/* LIBRARY CONTENT AREA (Grid & List with Spacing) */}
                                <div style={{
                                    padding: '12px',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '10px',
                                    overflowY: 'auto',
                                    maxHeight: 'calc(100vh - 250px)'
                                }}>
                                    {libraryItems.map((item) => {
                                        const fullImageUrl = `${API_URL}${item.url.startsWith('/') ? item.url : '/' + item.url}`;

                                        return libraryView === 'grid' ? (
                                            <div
                                                key={item._id}
                                                onClick={() => handleAddFromLibrary(fullImageUrl)}
                                                style={{
                                                    width: 'calc(50% - 5px)',
                                                    border: '1px solid #eee',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    backgroundColor: '#fff',
                                                    transition: 'transform 0.1s'
                                                }}
                                            >
                                                <img src={fullImageUrl} alt={item.name} style={{ width: '100%', height: '70px', objectFit: 'contain', padding: '8px' }} />
                                            </div>
                                        ) : (
                                            <div
                                                key={item._id}
                                                onClick={() => handleAddFromLibrary(fullImageUrl)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '8px',
                                                    width: '100%',
                                                    backgroundColor: 'white',
                                                    border: '1px solid #eee',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <img src={fullImageUrl} alt={item.name} style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />
                                                <div style={{ fontWeight: '600', fontSize: '12px', color: '#333' }}>{item.name}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 2. WORKSPACE AREA */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

                            {/* CANVAS TOOLBAR - Precision Layout */}
                            <div className="canvas-header" style={{
                                height: '45px',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0 20px',
                                backgroundColor: 'white',
                                borderBottom: '1px solid #eee',
                                position: 'relative',
                                zIndex: 2500, // 🚀 High priority to stay above canvas
                                pointerEvents: 'auto'
                            }}>
                                {/* 🟢 LEFT GROUP */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <button title="Info" style={toolBtnStyle(true)} onClick={() => setShowInfoPopup(true)}>
                                        <img src="/img/info.png" alt="" style={{ width: '18px', height: '18px' }} />
                                    </button>

                                    {/* Undo/Redo - Using your image files */}
                                    <button title="Undo" onClick={handleUndo} disabled={historyIndex === 0} style={toolBtnStyle(historyIndex > 0)}>
                                        <img src="/img/leftarrow.png" alt="" style={{ width: '18px', height: '18px' }} />
                                    </button>
                                    <button title="Redo" onClick={handleRedo} disabled={historyIndex === history.length - 1} style={toolBtnStyle(historyIndex < history.length - 1)}>
                                        <img src="/img/rightarrow.png" alt="" style={{ width: '18px', height: '18px' }} />
                                    </button>

                                    <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 10px' }}></div>

                                    {/* Action Tools - Using Original SVG Icons */}
                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('flipX')}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12H20M4 12L8 8M4 12L8 16" /></svg>
                                        <span style={toolLabelStyle}>Flip H</span>
                                    </button>

                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('flipY')}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: 'rotate(90deg)' }}><path d="M4 12H20M4 12L8 8M4 12L8 16" /></svg>
                                        <span style={toolLabelStyle}>Flip V</span>
                                    </button>

                                    <button style={toolBtnStyle(isSomethingSelected)} onClick={() => handleImageTool('duplicate')}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                        <span style={toolLabelStyle}>Duplicate</span>
                                    </button>

                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('fit')}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 10V4h6M20 10V4h-6M4 14v6h6M20 14v6h-6" /></svg>
                                        <span style={toolLabelStyle}>Fit</span>
                                    </button>

                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('fill')}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                                        <span style={toolLabelStyle}>Fill</span>
                                    </button>

                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('crop')}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path></svg>
                                        <span style={toolLabelStyle}>Crop</span>
                                    </button>

                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('cutout')}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                                        <span style={toolLabelStyle}>Cutout</span>
                                    </button>

                                    <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 10px' }}></div>

                                    {/* 🚀 DELETE - Set to Red Color */}
                                    <button style={toolBtnStyle(isSomethingSelected, true)} onClick={() => handleImageTool('delete')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        <span style={toolLabelStyle}>Delete</span>
                                    </button>
                                </div>

                                {/* 🟢 RIGHT GROUP */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div className="mode-toggle" style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '20px', padding: '3px', border: '1px solid #e2e8f0' }}>
                                        <button
                                            onClick={() => handleToggleView('edit')}
                                            style={(viewMode as string) === 'edit' ? activeToggleStyle : inactiveToggleStyle}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleView('preview')}
                                            style={(viewMode as string) === 'preview' ? activeToggleStyle : inactiveToggleStyle}
                                        >
                                            Preview
                                        </button>
                                    </div>

                                    {/* Variant Icon - Using your image file */}
                                    <img
                                        src="/img/editing.png"
                                        alt="Variants"
                                        style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                                        onClick={() => setShowVariantPopup(true)}
                                    />
                                </div>
                            </div>

                            {/* T-SHIRT CANVAS AREA */}
                            <div className="workspace-scroll-container" style={{ flex: 1, width: '100%', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '0px', backgroundColor: '#f5f5f5', minHeight: 0, position: 'relative', zIndex: 1 }}>
                                {/* 🟢 INFO POPUP LOGIC */}
                                {showInfoPopup && (
                                    <div className="product-info-card" style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '10px',
                                        width: '260px',
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                                        zIndex: 2500,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        maxHeight: '320px',
                                        border: '1px solid #f1f5f9',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
                                            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0d375b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Specifications</h3>
                                            <span onClick={() => setShowInfoPopup(false)} style={{ cursor: 'pointer', fontSize: '16px', color: '#cbd5e1', fontWeight: 'bold' }}>✕</span>
                                        </div>

                                        {/* Scrollable Content Container */}
                                        <div style={{ padding: '0 15px', overflowY: 'auto', flex: 1 }} className="custom-scrollbar">

                                            {/* 1. Fulfillment Details Section (If in fulfillment mode) */}
                                            {fulfillmentRequest && (
                                                <div style={{ borderTop: '1px solid #f1f5f9', padding: '15px 0' }}>
                                                    <h4 style={{ fontSize: '10px', fontWeight: '800', color: '#0d375b', textTransform: 'uppercase', marginBottom: '8px' }}>Customer Request</h4>
                                                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                        <p style={{ fontSize: '11px', fontWeight: '700', margin: '0 0 4px 0', color: '#1e293b' }}>Message:</p>
                                                        <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 10px 0', lineHeight: '1.4' }}>{fulfillmentRequest.message}</p>

                                                        {fulfillmentRequest.extraNote && (
                                                            <>
                                                                <p style={{ fontSize: '11px', fontWeight: '700', margin: '0 0 4px 0', color: '#1e293b' }}>Additional Notes:</p>
                                                                <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.4' }}>{fulfillmentRequest.extraNote}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 2. Header Section */}
                                            <div style={{ display: 'flex', gap: '12px', padding: '15px 0' }}>
                                                {designImage ? (
                                                    <img src={designImage} alt="Base" style={{ width: '45px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' }} />
                                                ) : (
                                                    <div style={{ width: '45px', height: '60px', backgroundColor: '#f1f5f9', borderRadius: '6px' }} />
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '800', fontSize: '12px', color: '#0f172a', lineHeight: '1.2' }}>{designTitle}</div>
                                                    <div style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>Professional Grade Base</div>
                                                    <div style={{ fontWeight: '700', fontSize: '12px', color: '#0d375b', marginTop: '4px' }}>{designPrice}</div>
                                                </div>
                                            </div>

                                            {/* 2. Product Details Section (with top separator) */}
                                            <div style={{ borderTop: '1px solid #f1f5f9', padding: '15px 0' }}>
                                                <h4 style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Product Details</h4>
                                                <p style={{ fontSize: '11px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                                                    This premium blank is engineered specifically for high-end digital printing. Featuring a tight-knit 24-singles
                                                    construction, the surface provides an ultra-smooth canvas that ensures ink pigments bond deeply with the
                                                    cotton fibers.
                                                </p>
                                            </div>

                                            {/* 3. Print Guidelines Section (with top separator) */}
                                            <div style={{ borderTop: '1px solid #f1f5f9', padding: '15px 0' }}>
                                                <h4 style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Print Guidelines</h4>
                                                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.6' }}>
                                                    <li>Upload high-resolution PNGs with transparent backgrounds (300 DPI).</li>
                                                    <li>Avoid fine lines thinner than 0.5pt to prevent "ink bleeding."</li>
                                                    <li>Ensure all colors are within the CMYK gamut for accuracy.</li>
                                                </ul>
                                            </div>

                                            {/* 4. Maintenance Section (with top separator) */}
                                            <div style={{ borderTop: '1px solid #f1f5f9', padding: '15px 0 20px' }}>
                                                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                    <h4 style={{ fontSize: '10px', fontWeight: '800', color: '#0d375b', marginBottom: '5px' }}>Fulfillment Note</h4>
                                                    <p style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                                                        Our quality control team inspects every print. Standard processing time is 24-48 hours before shipping.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ padding: '0px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {/* 🟢 CHANGE THIS: Use the scaled height plus a little padding (e.g., 40px) */}
                                    <div style={{
                                        // 🟢 Calculation change: Use the scaled height plus just enough padding (e.g., 60px)
                                        height: `${(800 * mockupScale) + 60}px`,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start', // Keeps the shirt high, but not cut off
                                        width: '100%',
                                        marginTop: '20px', // Small space below the toolbar
                                        position: 'relative' // Anchor the submit button properly if needed
                                    }}>
                                        {renderTShirtWorkspace()}
                                    </div>

                                    {/* SUBMIT BUTTON */}
                                    <div style={{ marginTop: '5px', marginBottom: '40px', zIndex: 100 }}>
                                        <button
                                            className="finish-btn"
                                            onClick={handleNavigateToSubmit}
                                            disabled={isSaving}
                                            style={{
                                                backgroundColor: '#0d375b',
                                                color: 'white',
                                                padding: '12px 50px',
                                                borderRadius: '30px',
                                                fontWeight: '800',
                                                fontSize: '14px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 15px rgba(13, 55, 91, 0.2)',
                                                transition: 'transform 0.2s, background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0a2a45'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0d375b'}
                                        >
                                            {isSaving ? "Saving..." : (fulfillmentRequest ? "Send to Customer" : "Submit Product")}
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    /* --- PREVIEW MODE LAYOUT --- */
                    <div className="preview-layout" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: '#f5f5f5',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        overflow: 'hidden',
                        zIndex: 1000
                    }}>


                        {/* 🟢 MAIN AREA */}
                        <div className="preview-layout-container">
                            <div className="preview-main-area" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* 🟢 Centered wrapper without restricted height math */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '100%',
                                    height: '100%'
                                }}>
                                    {renderTShirtWorkspace()}
                                </div>
                            </div>

                            <div className="preview-sidebar">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Mockup view</h3>
                                    <div className="mode-toggle" style={{ display: 'flex', backgroundColor: '#f0f0f0', borderRadius: '20px', padding: '3px', border: '1px solid #ddd' }}>
                                        <button onClick={() => handleToggleView('edit')} style={{ padding: '5px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '11px', color: '#666', background: 'transparent' }}>Edit</button>
                                        <button onClick={() => handleToggleView('preview')} style={{ padding: '5px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '11px', backgroundColor: '#0d375b', color: 'white' }}>Preview</button>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                    {Object.entries(MOCKUP_CONFIG).map(([key, config]: any) => {
                                        // Use the same mask logic from your main workspace
                                        const maskSrc = config.mask || config.img;

                                        return (
                                            <div key={key} onClick={() => setCurrentSide(key)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                                                <div style={{
                                                    border: currentSide === key ? '2px solid #0d375b' : '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    padding: '6px',
                                                    height: '110px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#f9f9f9',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    isolation: 'isolate'
                                                }}>

                                                    {/* 1. Base Mockup Image (The White Shirt) */}
                                                    <img
                                                        src={config.img}
                                                        alt={config.label}
                                                        style={{
                                                            maxWidth: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain',
                                                            position: 'relative',
                                                            zIndex: 1
                                                        }}
                                                    />


                                                    {/* 2. Color Overlay (Masked to the T-shirt shape) */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        backgroundColor: selectedTshirtColor,
                                                        mixBlendMode: 'multiply',
                                                        WebkitMaskImage: `url(${maskSrc})`,
                                                        maskImage: `url(${maskSrc})`,

                                                        WebkitMaskSize: config.thumbnailMaskScale || '90%',
                                                        maskSize: config.thumbnailMaskScale || '90%',

                                                        WebkitMaskPosition: 'center',
                                                        maskPosition: 'center',
                                                        WebkitMaskRepeat: 'no-repeat',
                                                        maskRepeat: 'no-repeat',
                                                        zIndex: 2,
                                                        pointerEvents: 'none',
                                                        boxSizing: 'border-box'
                                                    }}></div>

                                                    {/* 3. Design/Logo Overlay */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        zIndex: 10,
                                                        pointerEvents: 'none',
                                                        width: '100%',
                                                        height: '100%',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {/* @ts-ignore */}
                                                        {renderThumbnailDesign(key)}
                                                    </div>
                                                </div>
                                                <p style={{ marginTop: '4px', fontSize: '11px', fontWeight: 500 }}>{config.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ marginTop: '14px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                                    <h4 style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>T-shirt color</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {VARIANT_COLORS.map((color: any) => (
                                            <button key={color.hex} onClick={() => setSelectedTshirtColor(color.hex)} style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: color.hex, border: selectedTshirtColor === color.hex ? '2px solid #0d375b' : '1px solid #ddd', cursor: 'pointer' }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 🟢 FOOTER INSIDE PREVIEW */}
                        <div style={{ flexShrink: 0, backgroundColor: 'white', borderTop: '1px solid #eee' }}>
                            <Footer />
                        </div>
                    </div>
                )}

                <Footer />

                {/* 🟢 REFERENCE IMAGE WIDGET (For Fulfillment Mode) */}
                {fulfillmentRequest?.referenceImage && (
                    <div style={{
                        position: 'fixed',
                        bottom: '40px',
                        right: '40px',
                        zIndex: 2000,
                        background: 'white',
                        padding: '12px',
                        borderRadius: '16px',
                        boxShadow: '0 12px 35px rgba(13, 55, 91, 0.15)',
                        width: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        border: '1px solid #e2e8f0',
                        animation: 'slideInUp 0.5s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reference Image</span>
                            <button onClick={() => setFulfillmentRequest({ ...fulfillmentRequest, referenceImage: null })} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}>×</button>
                        </div>
                        <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <img src={fulfillmentRequest.referenceImage} alt="Reference" style={{ width: '100%', display: 'block', maxHeight: '200px', objectFit: 'contain' }} />
                        </div>
                        <a
                            href={fulfillmentRequest.referenceImage}
                            download={`ref-${fulfillmentRequest.id}.png`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                padding: '8px',
                                background: '#f0f9ff',
                                color: '#0369a1',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: '800',
                                textDecoration: 'none',
                                transition: '0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#e0f2fe'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f0f9ff'}
                        >
                            <span>Download Original</span>
                            <span style={{ fontSize: '14px' }}>↓</span>
                        </a>
                    </div>
                )}

                {/* 🟢 CROP MODAL (MUST BE INSIDE THE DASHBOARD CONTAINER) */}
                {showCropModal && cropImageSrc && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', maxWidth: '90vw' }}>
                            <h3 style={{ marginBottom: '15px' }}>Adjust Crop</h3>
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={cropAspect}
                            >
                                <img
                                    ref={imgRef} // 🚀 This connects the image to the handleApplyCrop function
                                    src={cropImageSrc || ''}
                                    style={{ maxHeight: '60vh' }}
                                    alt="Crop preview"
                                />
                            </ReactCrop>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowCropModal(false)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleApplyCrop} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#0d375b', color: 'white', border: 'none', cursor: 'pointer' }}>Apply Crop</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div> // This closes main-content (or dashboard-container depending on your start)
    ); // This closes the return (
} // This closes the export default function
