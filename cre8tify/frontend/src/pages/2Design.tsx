import React, { useState, useEffect, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import CurvedText from '../components/CurvedText'; 
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
}

// --- HISTORY INTERFACE ---
interface HistoryState {
    imageLayers: ImageLayer[];
    textLayers: TextConfig[];
}


// --- MOCK DATA ---
const VARIANT_COLORS = [
    { name: "White", hex: "#ffffff" },
    { name: "Black", hex: "#000000" },
    { name: "Athletic Heather", hex: "#cfcfcf" }, 
    { name: "Dark Grey", hex: "#555555" },
    { name: "Navy", hex: "#000080" },
    { name: "Red", hex: "#d32f2f" },
    { name: "Royal Blue", hex: "#1565c0" },
    { name: "Maroon", hex: "#800000" },
    { name: "Forest Green", hex: "#228b22" },
    { name: "Gold", hex: "#ffd700" },
];

const VARIANT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];

const TEXT_STYLES_CONFIG = [
    { id: 'default',        img: "",              label: "Blank Text" },
    { id: 'style-wave',     img: "/img/Text1.png",  label: "Blue Wave" },
    { id: 'style-stack',    img: "/img/Text2.png",  label: "Dreamer Stack" }, 
    { id: 'style-fish',     img: "/img/Text5.png",  label: "Nevermind" },    
    { id: 'style-circle',   img: "/img/Text4.png",  label: "Full Circle" },    
    { id: 'style-diamond',  img: "/img/Text3.png",  label: "Diamond Box" },
    { id: 'style-glitch',   img: "/img/Text6.png",  label: "Anxiety" },        
];

const FONT_LIST = ["Abril Fatface", "Chewy", "Shrikhand", "Lobster", "Oswald", "Anton", "Roboto", "Inter"];
const TEXT_COLORS = [
    "#000000", "#ffffff", "#333333", "#808080", 
    "#ff0000", "#00ff00", "#0000ff", "#ffff00", 
    "#ffa500", "#800080", "#ffc0cb", "#008080", 
    "#8B4513", "#FFD700", "#C0C0C0"               
];
const ICON_SIZE = 18;

export default function DesignTool() {
    const navigate = useNavigate(); 
    
    // --- 1. HOOKS ---
    const { libraryItems, addToLibrary } = useLibrary();

    // --- 2. STATE ---
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [imageLayers, setImageLayers] = useState<ImageLayer[]>([]);
    const [textLayers, setTextLayers] = useState<TextConfig[]>([]);

    // 🟢 UPDATE STATE: Added all 7 mockup views
    const [currentSide, setCurrentSide] = useState<'front' | 'back' | 'neck' | 'folded'|'model_front' | 'model_back' | 'hanging'>('front');
    
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

    // 🟢 ADD THIS: Profile Image State
    const [navProfileImg, setNavProfileImg] = useState("/img/profile-picture.png");
    const printAreaRef = useRef<HTMLDivElement | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const [cropTargetId, setCropTargetId] = useState<number | null>(null);
    const [cropAspect, setCropAspect] = useState<number | undefined>(undefined);
    const cropImageRef = useRef<HTMLImageElement | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const location = useLocation();
    const productData = location.state?.selectedProduct; 
    const designTitle = productData ? productData.name : "Untitled Design";
    const designPrice = productData ? productData.price : "LKR 1200.00";
    
    // Default Images
    const designImage = productData ? productData.img : "/img/dashwoman1.png";

    const activeTextConfig = textLayers.find(t => t.id === selectedId) || null;
    const isImageSelected = imageLayers.some(i => i.id === selectedId);
    const isSomethingSelected = selectedId !== null;

    const REALISTIC_PREVIEW_SIDES = new Set(['front', 'back', 'model_front', 'model_back']);
    
    // 🟢 MOCKUP CONFIGURATION
    const MOCKUP_CONFIG = {
        front: { 
            img: productData?.mockup ? productData.mockup : "/img/womenfront-mockup.png", 
            label: 'Front',
            showDesign: true,
            // Standard Front View
            printArea: { top: '50%', left: '50%', width: '25%', height: '40%', rotation: 0 }
        },
        back: { 
            img: "/img/womenback-mockup.png", 
            label: 'Back',
            showDesign: false,
            printArea: { top: '50%', left: '50%', width: '25%', height: '40%', rotation: 0 }
        },
        neck: { 
            img: "/img/mockups/collar.png", 
            label: 'Neck',
            showDesign: false, // Hides design
            printArea: { top: '50%', left: '50%', width: '0%', height: '0%', rotation: 0 }
        },
        folded: { 
            img: "/img/mockups/folded.png", 
            label: 'Folded',
            mask: "/img/mockups/foldedmask.png",
            maskSize: 'contain',
            maskPosition: 'center',
            showDesign: true,
            // Folded view settings
            printArea: { top: '56%', left: '46%', width: '36%', height: '42%', rotation: 5 }
        },
        model_front: { 
            img: "/img/mockups/girl_front.png",
            label: 'Model Front',
            mask: "/img/mockups/girl_frontmask.png",
            maskSize: '90% auto', 
            maskPosition: '50% 85%',
            showDesign: true,
            // 🟢 UPDATED: Width is now 20%
            printArea: { top: '45%', left: '50%', width: '22%', height: '35%', rotation: 0 }
        },
        model_back: { 
            img: "/img/mockups/girl_back.png",
            label: 'Model Back',
            mask: "/img/mockups/girl_backmask.png",
            maskSize: '92% auto', 
            maskPosition: '40% 90%',
            showDesign: false,
            // 🟢 UPDATED: Width is now 20%
            printArea: { top: '42%', left: '50%', width: '20%', height: '30%', rotation: 0 }
        },
        hanging: { 
            img: "/img/mockups/hanging.png", 
            label: 'Hanging',
            mask: "/img/mockups/hanging_mask.png",
            maskSize: '74% auto', 
            maskPosition: '45% 58%',
            showDesign: true,
            // Hanging view settings
            printArea: { top: '58%', left: '50%', width: '28%', height: '35%', rotation: 0 }
        }
    };

    useEffect(() => {
        const savedDesign = localStorage.getItem('temp_design_state');
        if (savedDesign) {
            try {
                const parsed = JSON.parse(savedDesign);
                
                // 🟢 Use "as any" to tell TypeScript you know what you're doing
                if (parsed.imageLayers) setImageLayers(parsed.imageLayers as any);
                if (parsed.textLayers) setTextLayers(parsed.textLayers as any);
                if (parsed.selectedTshirtColor) setSelectedTshirtColor(parsed.selectedTshirtColor);
            } catch (err) {
                console.error("Failed to load saved design", err);
            }
        }
    }, []);

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
                const newItem = await addToLibrary(file);
                if (newItem) {
                    const fullImageUrl = `${API_URL}${newItem.url.startsWith('/') ? newItem.url : '/' + newItem.url}`;
                    handleAddFromLibrary(fullImageUrl); // This actually puts it on the shirt
                    setActivePanel('library');
                }
                event.target.value = '';
            } catch (error) {
                console.error("Upload failed:", error);
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
        const maxZ = Math.max(0, ...imageLayers.map(l => l.zIndex), ...textLayers.map(t => t.zIndex));
        const styleId = typeof style === 'string' ? style : style.id;
        const newText: TextConfig = {
            id: Date.now(),
            text: styleId === 'default' ? "Plain Text" : "New Style",
            font: 'Anton',
            styleId: styleId,
            color: "#000000",
            zIndex: maxZ + 1,
            x: 0, y: 0, scale: 1, rotation: 0
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



    const getCurrentValue = (prop: 'scale' | 'x' | 'y' | 'rotation') => {
        const txt = textLayers.find(t => t.id === selectedId);
        if (txt) return (txt as any)[prop];
        const img = imageLayers.find(i => i.id === selectedId);
        if (img) return (img as any)[prop];
        return prop === 'scale' ? 1 : 0;
    };

    const updateActiveLayer = (prop: string, value: any, isFinal: boolean = false) => {
        if (!selectedId) return;
        const isText = textLayers.some(t => t.id === selectedId);
        if (isText) {
            const updated = textLayers.map(t => t.id === selectedId ? { ...t, [prop]: value } : t);
            setTextLayers(updated);
            if (isFinal) addToHistory(imageLayers, updated);
        } else {
            const updated = imageLayers.map(img => img.id === selectedId ? { ...img, [prop]: value } : img);
            setImageLayers(updated);
            if (isFinal) addToHistory(updated, textLayers);
        }
    };

    const getPrintAreaSize = () => {
        if (!printAreaRef.current) return { width: 1, height: 1 };
        const rect = printAreaRef.current.getBoundingClientRect();
        return { width: rect.width || 1, height: rect.height || 1 };
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
        // The backend expects the field name 'image'
        formData.append('image', imageBlob, 'input.png');

        const res = await fetch(`${API_URL}/api/cutout`, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header; the browser does it for FormData
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
            // 🟢 FORCE UPDATE: Use map to create a new object reference
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
            setCropTargetId(img.id);
            setCropImageSrc(img.src);
            setCrop({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
            setCompletedCrop(null);
            setShowCropModal(true);
            return;
        }

        // 🟢 THE FIX: Always update these three things at the end of the function
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

    const toolBtnStyle = (enabled: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        border: 'none',
        background: 'none',
        cursor: enabled ? 'pointer' : 'default',
        color: enabled ? '#333' : '#aaa',
        opacity: enabled ? 1 : 0.5
    });

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
        if (!cropImageSrc || !completedCrop || !cropTargetId || !cropImageRef.current) {
            setShowCropModal(false);
            return;
        }
        const croppedSrc = await getCroppedImg(cropImageRef.current, completedCrop);
        const updatedImages = imageLayers.map(i => i.id === cropTargetId ? { ...i, src: croppedSrc } : i);
        setImageLayers(updatedImages);
        addToHistory(updatedImages, textLayers);
        setShowCropModal(false);
    };

     const handleSaveProduct = async () => {
        setIsSaving(true);
        const prevSide = currentSide;
        const prevMode = viewMode;

        const waitForPaint = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        const captureDesignOnly = async (side: 'front' | 'folded' | 'hanging') => {
            if (currentSide !== side) setCurrentSide(side);
            await waitForPaint();
            await waitForPaint();
            const workspaceElement = document.getElementById('tshirt-capture-area');
            const printArea = workspaceElement?.querySelector('.print-area') as HTMLElement | null;
            if (!printArea) return null;
            try {
                const canvas = await html2canvas(printArea, {
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: null,
                    scale: 2
                });
                return canvas.toDataURL("image/png");
            } catch (err) {
                console.error("Snapshot failed:", err);
                return null;
            }
        };

        const frontDesign = await captureDesignOnly('front');
        const foldedDesign = await captureDesignOnly('folded');
        const hangingDesign = await captureDesignOnly('hanging');

        console.log('design snapshots', {
            front: frontDesign ? frontDesign.slice(0, 50) : null,
            folded: foldedDesign ? foldedDesign.slice(0, 50) : null,
            hanging: hangingDesign ? hangingDesign.slice(0, 50) : null
        });

        // Restore UI state
        if (prevSide !== currentSide) setCurrentSide(prevSide);
        if (prevMode !== viewMode) setViewMode(prevMode);

        // 2. Prepare data for navigation
        const submissionData = { 
            productImages: [
                MOCKUP_CONFIG.front.img,
                MOCKUP_CONFIG.back.img,
                MOCKUP_CONFIG.neck.img,
                MOCKUP_CONFIG.folded.img,
                MOCKUP_CONFIG.hanging.img
            ], 
            productType: productData?.name || 'Women Fit Boxy T-shirt',
            canvasState: { imageLayers, textLayers },
            tshirtColor: selectedTshirtColor || "#ffffff",
            frontMockup: MOCKUP_CONFIG.front.img,
            frontPrintArea: MOCKUP_CONFIG.front.printArea,
            foldedMockup: MOCKUP_CONFIG.folded.img,
            foldedMask: (MOCKUP_CONFIG.folded as any).mask,
            foldedPrintArea: MOCKUP_CONFIG.folded.printArea,
            foldedMaskSize: (MOCKUP_CONFIG.folded as any).maskSize,
            foldedMaskPosition: (MOCKUP_CONFIG.folded as any).maskPosition,
            hangingMockup: MOCKUP_CONFIG.hanging.img,
            hangingMask: (MOCKUP_CONFIG.hanging as any).mask,
            hangingPrintArea: MOCKUP_CONFIG.hanging.printArea,
            hangingMaskSize: (MOCKUP_CONFIG.hanging as any).maskSize,
            hangingMaskPosition: (MOCKUP_CONFIG.hanging as any).maskPosition,
            frontDesign,
            foldedDesign,
            hangingDesign
        };

        // Keep a local fallback in case router state is lost (refresh)
        localStorage.setItem('temp_design_snapshots', JSON.stringify({
            frontDesign,
            foldedDesign,
            hangingDesign
        }));

        // 3. Save layers for the "Back" button
        localStorage.setItem('temp_design_state', JSON.stringify({
            imageLayers,
            textLayers,
            selectedTshirtColor: selectedTshirtColor || "#ffffff"
        }));

        navigate('/submit-product', { state: submissionData });
    };  

    const moveLayer = (id: number, direction: 'up' | 'down') => {
        const allLayers = [
            ...imageLayers.map(l => ({ type: 'image' as const, id: l.id, zIndex: l.zIndex })),
            ...textLayers.map(t => ({ type: 'text' as const, id: t.id, zIndex: t.zIndex }))
        ].sort((a, b) => a.zIndex - b.zIndex);

        const idx = allLayers.findIndex(l => l.id === id);
        if (idx === -1) return;

        const swapIdx = direction === 'up' ? idx + 1 : idx - 1;
        if (swapIdx < 0 || swapIdx >= allLayers.length) return;

        const target = allLayers[idx];
        const swap = allLayers[swapIdx];

        const newImages = imageLayers.map(img => {
            if (img.id === target.id) return { ...img, zIndex: swap.zIndex };
            if (img.id === swap.id) return { ...img, zIndex: target.zIndex };
            return img;
        });

        const newTexts = textLayers.map(txt => {
            if (txt.id === target.id) return { ...txt, zIndex: swap.zIndex };
            if (txt.id === swap.id) return { ...txt, zIndex: target.zIndex };
            return txt;
        });

        setImageLayers(newImages);
        setTextLayers(newTexts);
        addToHistory(newImages, newTexts);
    };

    const renderTShirtWorkspace = () => {
        const config = MOCKUP_CONFIG[currentSide as keyof typeof MOCKUP_CONFIG] || MOCKUP_CONFIG.front;
        const maskSrc = (config as any).mask || config.img;
        const isPreview = viewMode === 'preview';
        const useRealisticPreview = isPreview && REALISTIC_PREVIEW_SIDES.has(currentSide);
        const previewInkStyle = useRealisticPreview
            ? { mixBlendMode: 'multiply' as const, filter: 'contrast(1.05) saturate(0.95)', opacity: 0.92 }
            : {};
        const shouldShowDesign = viewMode === 'edit' ? true : config.showDesign;

        return (
            /* 🟢 ADDED ID HERE: id="tshirt-capture-area" ensures the snapshot captures everything */
            <div id="tshirt-capture-area" style={{ position: 'relative', width: 'fit-content', height: viewMode === 'preview' ? '85vh' : '90vh', transform: viewMode === 'edit' ? 'translateY(-20px)' : 'none', transition: 'all 0.3s' }}>
                
                {/* Base T-shirt Image */}
                <img 
                    src={config.img} 
                    alt="Mockup" 
                    crossOrigin="anonymous" 
                    style={{ display: 'block', height: '100%', zIndex: 2, position: 'relative' }} 
                />

                {/* Color Overlay Layer */}
                <div style={{ 
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                    backgroundColor: selectedTshirtColor, 
                    maskImage: `url(${maskSrc})`, WebkitMaskImage: `url(${maskSrc})`, 
                    maskSize: (config as any).maskSize || 'contain', WebkitMaskSize: (config as any).maskSize || 'contain', 
                    maskPosition: (config as any).maskPosition || 'center', WebkitMaskPosition: (config as any).maskPosition || 'center', 
                    maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', 
                    mixBlendMode: 'multiply', zIndex: 3, pointerEvents: 'none' 
                }}></div>

                {/* Design Print Area */}
                <div ref={printAreaRef} className={`print-area ${currentSide === 'back' ? 'back-view' : ''}`} style={{ zIndex: 10, position: 'absolute', top: config.printArea.top, left: config.printArea.left, width: config.printArea.width, height: config.printArea.height, transform: `translate(-50%, -50%) rotate(${(config.printArea as { rotation?: number }).rotation ?? 0}deg)`, overflow: 'hidden', border: viewMode === 'edit' ? '1px dashed rgba(0,0,0,0.3)' : 'none' }}>
                    
                    {/* Image Layers */}
                    {shouldShowDesign && imageLayers.map((layer) => (
                        <img 
                            key={layer.id} 
                            src={layer.src} 
                            style={{ 
                                position: 'absolute', 
                                zIndex: layer.zIndex, 
                                transform: `translate(${layer.x}px, ${layer.y}px) 
                                            scale(${layer.scale}) 
                                            rotate(${layer.rotation}deg) 
                                            scaleX(${layer.flipX ? -1 : 1}) 
                                            scaleY(${layer.flipY ? -1 : 1})`,
                                mixBlendMode: (viewMode === 'preview' && selectedTshirtColor.toLowerCase() !== '#ffffff') ? 'multiply' : 'normal',
                                filter: viewMode === 'preview' ? 'drop-shadow(0px 1px 1px rgba(0,0,0,0.1))' : 'none',
                                opacity: 1,
                                cursor: 'move',
                                border: (selectedId === layer.id && viewMode === 'edit') ? '1px dashed #0d375b' : 'none' 
                            }} 
                            onMouseDown={(e) => handleDragStart(e, layer.id, 'image', layer.x, layer.y)} 
                        />
                    ))}

                    {/* Text Layers */}
                    {shouldShowDesign && textLayers.map((t) => (
                        <div key={t.id} style={{ position: 'absolute', zIndex: t.zIndex, transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale}) rotate(${t.rotation}deg)`, cursor: 'move', border: (selectedId === t.id && viewMode === 'edit') ? '1px solid #0d375b' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px', ...previewInkStyle }} onMouseDown={(e) => handleDragStart(e, t.id, 'text', t.x, t.y)}>
                            {t.styleId === 'default' ? <div style={{ fontFamily: t.font, color: t.color, fontSize: '24px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{t.text}</div> : <CurvedText text={t.text} styleId={t.styleId} fontFamily={t.font} color={t.color} />}
                            {isEditing && selectedId === t.id && (
                                <input autoFocus value={t.text} onChange={(e) => updateActiveLayer('text', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)} onBlur={() => setIsEditing(false)} style={{ marginTop: '5px', textAlign: 'center', width: '150px' }} onClick={(e) => e.stopPropagation()} />
                            )}
                        </div>
                    ))}

                    {/* Realistic Texture Overlays */}
                    {shouldShowDesign && useRealisticPreview && (
                        <>
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${config.img})`, backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply', opacity: 0.28, pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(0,0,0,0.08), rgba(255,255,255,0.06))', mixBlendMode: 'multiply', opacity: 0.8, pointerEvents: 'none' }} />
                        </>
                    )}
                </div>
            </div>
        );
    }; 

    return (
        <div className="dashboard-container">
            
            {/* 1. SIDEBAR (Only visible in Edit Mode) */}
            {viewMode === 'edit' && (
                <div className="sidebar">
                    <div className="sidebar-logo">Cre8tify</div>
                    <div className="sidebar-menu">
                        <label className="sidebar-btn">
                            <img src="/img/upload.png" alt="Upload" className="sidebar-icon" />
                            Upload
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        </label>
                        <div className="sidebar-btn" onClick={() => setActivePanel('text')}>
                            <img src="/img/text.png" alt="Text" className="sidebar-icon" />
                            Add Text
                        </div>
                        <div className="sidebar-btn" onClick={() => setActivePanel('colors')}>
                            <img src="/img/brush.png" alt="Colours" className="sidebar-icon" />
                            Colours
                        </div>
                        <div className={`sidebar-btn ${activePanel === 'size' ? 'active' : ''}`} onClick={() => setActivePanel('size')}>
                            <img src="/img/resize.png" alt="Size" className="sidebar-icon" />
                            Size
                        </div>
                        <div className="sidebar-btn" onClick={() => setActivePanel('layers')}>
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
                className="main-content"
                style={{
                    height: '100vh',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    width: viewMode === 'preview' ? '100%' : undefined,
                    marginLeft: viewMode === 'preview' ? 0 : undefined,
                    opacity: isSaving ? 0 : 1,
                    pointerEvents: isSaving ? 'none' : 'auto'
                }}
            >                
                
                {/* 🟢 HEADER (Only visible in Edit Mode) */}
                {viewMode === 'edit' && (
                    <header className="top-header" style={{ paddingLeft: '20px' }}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <img src="/img/back.png" alt="Back" style={{width:'20px', height:'20px', filter:'invert(1)'}} /> 
                            <Link to="/designer-dashboard" style={{color:'white', textDecoration:'none', fontWeight:600}}>Back</Link>
                        </div>
                        <div style={{fontSize:'18px', fontWeight:600}}>{designTitle}</div>
                        <div style={{display:'flex', gap:'15px'}}>
                        <img 
                            src={navProfileImg} 
                            alt="Profile" 
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)' }} 
                            onClick={() => navigate('/profile')}
                            onError={(e) => { (e.target as HTMLImageElement).src = "/img/profile-picture.png"; }}
                        />
                        </div>
                    </header>
                )}

                {/* 🟢 CONDITIONAL RENDERING: EDIT vs PREVIEW */}
                
                {viewMode === 'edit' ? (
                    // --- EDIT MODE LAYOUT ---
                    <div className="design-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        
                      {activePanel === 'text' && (
                            <div className="side-panel-container">
                                <div className="panel-header">
                                    <h3 className="panel-title">Add text</h3>
                                    <button className="panel-close-btn" onClick={() => setActivePanel('none')}>✕</button>
                                </div>
                                <div className="panel-search-container">
                                    <input type="text" placeholder="Search fonts" className="panel-search-input" />
                                </div>
                                
                                <div className="panel-scroll-area">
                                    
                                    {/* 1. STYLES SECTION */}
                                    <div className="panel-section">
                                        <div className="panel-section-title">Styles</div>
                                        <div className="curved-text-grid">
                                            {TEXT_STYLES_CONFIG.map((style) => (
                                                <div key={style.id} className="curved-text-card" onClick={() => handleTextSelection(style)}>
                                                    {style.img ? (
                                                        <img src={style.img} alt={style.label} className="curved-text-img" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '10px', textAlign: 'center', fontWeight: 700, color: '#0d375b' }}>
                                                            {style.label}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. FONTS SECTION (Color section removed) */}
                                    <div className="panel-section" style={{borderBottom:'none'}}>
                                        <div className="panel-section-title">Fonts</div>
                                        {FONT_LIST.map((font) => (
                                            <div key={font} className="font-list-item" onClick={() => handleFontSelection(font)}>
                                                <span style={{ fontFamily: font }}>{font}</span>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        )}

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
                                                <div key={colorHex} onClick={() => { const newText = activeTextConfig ? { ...activeTextConfig, color: colorHex } : null; if(newText) { setActiveTextConfig(newText, true); }}}
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
                                                <label style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'block', textTransform:'uppercase', fontWeight:'600' }}>Tap to pick shade</label>
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

                        {activePanel === 'layers' && (
                             <div className="side-panel-container">
                                <div className="panel-header">
                                    <h3 className="panel-title">Layers</h3>
                                    <button className="panel-close-btn" onClick={() => setActivePanel('none')}>✕</button>
                                </div>
                                <div className="panel-scroll-area">
                                    <div className="panel-section">
                                        <div className="panel-section-title">Manage Elements</div>
                                        <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {[...imageLayers.map(img => ({ type: 'image', data: img, zIndex: img.zIndex })), ...(activeTextConfig ? [{ type: 'text', data: activeTextConfig, zIndex: activeTextConfig.zIndex }] : [])].sort((a, b) => b.zIndex - a.zIndex).map((layerItem) => (
                                                <div key={layerItem.type === 'text' ? (layerItem.data as TextConfig).id : (layerItem.data as ImageLayer).id} className="layer-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', border: '1px solid #ddd', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }} onClick={() => { if(layerItem.type === 'text') setActivePanel('text'); }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#333' }}>{layerItem.type === 'text' ? "Text Layer" : `Image Layer`}</div>
                                                    </div>
                                                    <div style={{ display:'flex', gap:'8px' }}>
                                                        <button onClick={(e) => { e.stopPropagation(); moveLayer((layerItem.data as any).id, 'up'); }} style={{ width:'40px', height:'40px', cursor:'pointer', border:'1px solid #ddd', background:'white', borderRadius:'8px' }}>↑</button>
                                                        <button onClick={(e) => { e.stopPropagation(); moveLayer((layerItem.data as any).id, 'down'); }} style={{ width:'40px', height:'40px', cursor:'pointer', border:'1px solid #ddd', background:'white', borderRadius:'8px' }}>↓</button>
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            if(!window.confirm("Remove layer?")) return;
                                                            let newLayers = imageLayers;
                                                            let newTexts = textLayers;
                                                            if (layerItem.type === 'text') {
                                                                newTexts = textLayers.filter(t => t.id !== (layerItem.data as TextConfig).id);
                                                                if (selectedId === (layerItem.data as TextConfig).id) setSelectedId(null);
                                                            } else {
                                                                newLayers = imageLayers.filter(i => i.id !== (layerItem.data as ImageLayer).id);
                                                                if (selectedId === (layerItem.data as ImageLayer).id) setSelectedId(null);
                                                            }
                                                            setImageLayers(newLayers);
                                                            setTextLayers(newTexts);
                                                            addToHistory(newLayers, newTexts);
                                                        }} style={{ width:'40px', height:'40px', cursor:'pointer', border:'none', background:'#fee2e2', color:'#dc2626', borderRadius:'8px' }}>🗑</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activePanel === 'size' && (
                             <div className="side-panel-container">
                                <div className="panel-header">
                                    <h3 className="panel-title">Size & Position</h3>
                                    <button className="panel-close-btn" onClick={() => setActivePanel('none')}>✕</button>
                                </div>
                                <div className="panel-scroll-area">
                                    <div className="panel-section">
                                        <div className="panel-section-title">Adjust Layer</div>
                                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                            
                                            {/* 🟢 1. SCALE (Existing) */}
                                            <div>
                                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'14px', fontWeight:'600', color:'#555'}}>
                                                    <span>Scale</span>
                                                    <span>{Math.round(getCurrentValue('scale') * 100)}%</span>
                                                </div>
                                                <input 
                                                    type="range" min="0.2" max="3" step="0.1" 
                                                    value={getCurrentValue('scale')} 
                                                    onChange={(e) => updateActiveLayer('scale', parseFloat(e.target.value), false)} 
                                                    onMouseUp={(e) => updateActiveLayer('scale', parseFloat((e.target as HTMLInputElement).value), true)} 
                                                    style={{ width: '100%', accentColor: '#0d375b', cursor:'pointer', height:'6px' }} 
                                                />
                                            </div>

                                            {/* 🟢 2. ROTATION (Restored) */}
                                            <div>
                                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'14px', fontWeight:'600', color:'#555'}}>
                                                    <span>Rotation</span>
                                                    <span>{Math.round(getCurrentValue('rotation'))}°</span>
                                                </div>
                                                <input 
                                                    type="range" min="-180" max="180" step="1" 
                                                    value={getCurrentValue('rotation')} 
                                                    onChange={(e) => updateActiveLayer('rotation', parseFloat(e.target.value), false)} 
                                                    onMouseUp={(e) => updateActiveLayer('rotation', parseFloat((e.target as HTMLInputElement).value), true)} 
                                                    style={{ width: '100%', accentColor: '#0d375b', cursor:'pointer', height:'6px' }} 
                                                />
                                            </div>

                                            {/* 🟢 3. X POSITION (Restored) */}
                                            <div>
                                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'14px', fontWeight:'600', color:'#555'}}>
                                                    <span>Position X (Left/Right)</span>
                                                    <span>{Math.round(getCurrentValue('x'))}px</span>
                                                </div>
                                                <input 
                                                    type="range" min="-300" max="300" step="1" 
                                                    value={getCurrentValue('x')} 
                                                    onChange={(e) => updateActiveLayer('x', parseFloat(e.target.value), false)} 
                                                    onMouseUp={(e) => updateActiveLayer('x', parseFloat((e.target as HTMLInputElement).value), true)} 
                                                    style={{ width: '100%', accentColor: '#0d375b', cursor:'pointer', height:'6px' }} 
                                                />
                                            </div>

                                            {/* 🟢 4. Y POSITION (Restored) */}
                                            <div>
                                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'14px', fontWeight:'600', color:'#555'}}>
                                                    <span>Position Y (Up/Down)</span>
                                                    <span>{Math.round(getCurrentValue('y'))}px</span>
                                                </div>
                                                <input 
                                                    type="range" min="-400" max="400" step="1" 
                                                    value={getCurrentValue('y')} 
                                                    onChange={(e) => updateActiveLayer('y', parseFloat(e.target.value), false)} 
                                                    onMouseUp={(e) => updateActiveLayer('y', parseFloat((e.target as HTMLInputElement).value), true)} 
                                                    style={{ width: '100%', accentColor: '#0d375b', cursor:'pointer', height:'6px' }} 
                                                />
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activePanel === 'library' && (
                             <div className="side-panel-container">
                                <div className="panel-header">
                                    <h3 className="panel-title">My library</h3>
                                    <button className="panel-close-btn" onClick={() => setActivePanel('none')}>✕</button>
                                </div>
                                
                                {/* Search Bar */}
                                <div style={{ padding: '0 15px 15px 15px' }}>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ position: 'absolute', left: '10px' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                            <input type="text" placeholder="Search library" value={librarySearchTerm} onChange={(e) => setLibrarySearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', fontSize:'14px' }} />
                                    </div>
                                </div>

                                {/* Controls Row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 15px 15px 15px', borderBottom: '1px solid #eee' }}>
                                    <select value={librarySort} onChange={(e: any) => setLibrarySort(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: 'white', fontSize:'13px', color:'#333', cursor:'pointer' }}>
                                            <option value="recent">Recently added</option>
                                            <option value="oldest">Oldest first</option>
                                            <option value="az">A-Z Name</option>
                                    </select>
                                    <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                                            <button onClick={() => setLibraryView('grid')} style={{ padding: '6px 10px', background: libraryView === 'grid' ? '#0d375b' : 'white', border: 'none', cursor: 'pointer' }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" stroke={libraryView === 'grid' ? 'white' : '#555'} strokeWidth="2" fill={libraryView === 'grid' ? 'white' : 'none'}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                            </button>
                                            <button onClick={() => setLibraryView('list')} style={{ padding: '6px 10px', background: libraryView === 'list' ? '#0d375b' : 'white', borderLeft: '1px solid #ddd', border: 'none', cursor: 'pointer' }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" stroke={libraryView === 'list' ? 'white' : '#555'} strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                                            </button>
                                    </div>
                                </div>

                                <div style={{ padding: '15px' }}>
                                    {libraryItems.map((item) => {
                                        const fullImageUrl = `${API_URL}${item.url.startsWith('/') ? item.url : '/' + item.url}`;
                                        
                                        return libraryView === 'grid' ? (
                                            <div key={item._id} onClick={() => handleAddFromLibrary(fullImageUrl)} style={{ display: 'inline-block', width:'48%', marginBottom:'10px', marginRight: '2%', border:'1px solid #eee', borderRadius:'8px', overflow:'hidden', cursor:'pointer' }}>
                                                <img src={fullImageUrl} alt={item.name} style={{ width: '100%', height: '80px', objectFit: 'contain', padding:'5px' }} />
                                            </div>
                                        ) : (
                                            <div key={item._id} onClick={() => handleAddFromLibrary(fullImageUrl)} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', backgroundColor: 'white', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', marginBottom:'10px' }}>
                                                <img src={fullImageUrl} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* CANVAS TOOLBAR */}
                        <div className="canvas-header" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '30px' }}>
                            
                            {/* LEFT SIDE: Tools */}
                            <div className="header-controls">
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button title="Info" style={{border:'none', background:'none', cursor:'pointer'}} onClick={() => setShowInfoPopup(true)}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                    </button>
                                    <button title="Undo" onClick={handleUndo} disabled={historyIndex === 0} style={{border:'none', background:'none', cursor: historyIndex > 0 ? 'pointer' : 'default', opacity: historyIndex > 0 ? 1 : 0.4 }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
                                    </button>
                                    <button title="Redo" onClick={handleRedo} disabled={historyIndex === history.length - 1} style={{border:'none', background:'none', cursor: historyIndex < history.length - 1 ? 'pointer' : 'default', opacity: historyIndex < history.length - 1 ? 1 : 0.4 }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></svg>
                                    </button>
                                </div>
                                <div style={{ width: '1px', height: '30px', background: '#ddd', margin: '0 20px' }}></div>
                                <div style={{ display: 'flex', gap: '15px', alignItems:'center' }}>
                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('flipX')} disabled={!isImageSelected} title="Flip Horizontal"><svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12H20M4 12L8 8M4 12L8 16"/></svg><span>Flip H</span></button>
                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('flipY')} disabled={!isImageSelected} title="Flip Vertical"><svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{transform:'rotate(90deg)'}}><path d="M4 12H20M4 12L8 8M4 12L8 16"/></svg><span>Flip V</span></button>
                                    <button style={toolBtnStyle(isSomethingSelected)} onClick={() => handleImageTool('duplicate')} disabled={!isSomethingSelected} title="Duplicate"><svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Duplicate</span></button>
                                    
                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('fit')} disabled={!isImageSelected} title="Fit to Placeholder"><svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 10V4h6"/><path d="M20 10V4h-6"/><path d="M4 14v6h6"/><path d="M20 14v6h-6"/></svg><span>Fit</span></button>
                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('fill')} disabled={!isImageSelected} title="Fill Placeholder"><svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg><span>Fill</span></button>
                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('crop')} disabled={!isImageSelected} title="Crop Image"><svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path></svg><span>Crop</span></button>
                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('cutout')} disabled={!isImageSelected} title="Remove Background (White)"><svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg><span>Cutout</span></button>

                                    <div style={{ width: '1px', height: '30px', background: '#ddd', margin: '0 5px' }}></div>
                                    <button style={{...toolBtnStyle(isSomethingSelected), color: isSomethingSelected ? '#d32f2f' : '#ccc', opacity: isSomethingSelected ? 1 : 0.5}} onClick={() => handleImageTool('delete')} disabled={!isSomethingSelected} title="Delete"><svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg><span>Delete</span></button>
                                </div>
                            </div>

                            {/* RIGHT SIDE: ONLY Variants & Toggle (Edit Mode) */}
                            <div style={{display:'flex', alignItems:'center', gap: '20px'}}>
                                <div className="mode-toggle" style={{display:'flex', backgroundColor:'#f0f0f0', borderRadius:'30px', padding:'4px', border:'1px solid #ddd'}}>
                                    {/* Edit Button: Hardcoded to look ACTIVE (Blue) */}
                                    <button 
                                        onClick={() => setViewMode('edit')} 
                                        style={{ padding: '8px 24px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontSize:'14px', fontWeight:'600', backgroundColor: '#0d375b', color: 'white' }}
                                    >
                                        Edit
                                    </button>

                                    {/* Preview Button: Hardcoded to look INACTIVE (Transparent) */}
                                    <button 
                                        onClick={() => setViewMode('preview')} 
                                        style={{ padding: '8px 24px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontSize:'14px', fontWeight:'600', backgroundColor: 'transparent', color: '#666' }}
                                    >
                                        Preview
                                    </button>
                                </div>
                                <img src="/img/editing.png" alt="Variants" title="Select Variants" style={{width:'32px', cursor:'pointer'}} onClick={() => setShowVariantPopup(true)} />
                            </div>
                        </div>

                        <div className="workspace" style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', width: '100%', position: 'relative' }}> 
                            {showInfoPopup && (
                                <div className="product-info-card" style={{
                                    position: 'absolute',
                                    top: '20px',
                                    left: '20px',
                                    width: '340px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 25px rgba(0,0,0,0.15)',
                                    zIndex: 60,
                                    fontSize: '13px',
                                    color: '#333',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxHeight: '90%', 
                                    overflow: 'hidden'
                                }}>
                                    {/* Header - Pinned 'X' to the right */}
                                    <div style={{
                                        display:'flex', 
                                        alignItems:'center', 
                                        padding:'15px 20px', 
                                        borderBottom:'1px solid #eee',
                                        position: 'relative' 
                                    }}>
                                        <h3 style={{margin:0, fontSize:'16px', fontWeight:'700', color:'#222'}}>Important Product Information</h3>
                                        
                                        <span 
                                            onClick={()=>setShowInfoPopup(false)}
                                            style={{
                                                position: 'absolute',
                                                right: '15px', 
                                                top: '15px',
                                                cursor:'pointer', 
                                                fontSize:'18px', 
                                                color:'#888',
                                                fontWeight: 'bold'
                                            }} 
                                        >
                                            ✕
                                        </span>
                                    </div>

                                    {/* Scrollable Content */}
                                    <div style={{padding:'20px', overflowY:'auto'}}>
                                        
                                        {/* Product Thumbnail Row */}
                                        <div style={{display:'flex', gap:'15px', marginBottom:'20px'}}>
                                            <img src={designImage} alt="Base" style={{width:'70px', height:'90px', objectFit:'cover', borderRadius:'4px', backgroundColor:'#f5f5f5'}} />
                                            <div>
                                                <div style={{fontWeight:'700', fontSize:'15px', marginBottom:'2px'}}>{designTitle}</div>
                                                <div style={{color:'#666', fontSize:'12px'}}>Bella+Canvas 3001</div>
                                                <div style={{color:'#666', fontSize:'11px', marginTop:'2px'}}>Fulfilled by Cre8tify Choice</div>
                                                <div style={{color:'#666', fontSize:'11px'}}>All in stock</div>
                                            </div>
                                        </div>

                                        {/* Details List */}
                                        <div style={{borderTop:'1px solid #eee', padding:'12px 0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                            <span>Base T-shirt cost:</span>
                                            <span style={{fontWeight:'600'}}>{designPrice}</span>
                                        </div>
                                        <div style={{borderTop:'1px solid #eee', padding:'12px 0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                            <span>Print area size:</span>
                                            <span style={{fontWeight:'600'}}>4200 x 4800 px</span>
                                        </div>

                                        {/* Blue Info Box */}
                                        <div style={{backgroundColor:'#f5f9ff', padding:'15px', borderRadius:'6px', marginTop:'10px', border:'1px solid #e1eaf7'}}>
                                            <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#0d375b', fontWeight:'700', marginBottom:'10px', fontSize:'13px'}}>
                                                <span style={{fontSize:'16px'}}>ℹ</span> Product and design guidelines
                                            </div>
                                            
                                            <div style={{fontSize:'12px', fontWeight:'700', marginBottom:'4px', color:'#444'}}>Multiple decoration methods</div>
                                            <div style={{fontSize:'12px', fontWeight:'700', marginBottom:'4px', color:'#444'}}>DTG decoration method</div>
                                            
                                            <div style={{lineHeight:'1.5', color:'#666', fontSize:'12px', marginTop:'5px'}}>
                                                Using this technique, pigmented water-based inks are applied to the garment's surface and are absorbed by the product's fibers and can accommodate precise and detailed designs.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showVariantPopup && (
                            <div className="modal-overlay" onClick={()=>setShowVariantPopup(false)} style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:3000, display:'flex', justifyContent:'center', alignItems:'flex-start', paddingTop:'170px'}}>
                                <div className="variant-popup-card" onClick={e=>e.stopPropagation()} style={{backgroundColor:'white', width:'450px', borderRadius:'15px', overflow:'hidden', boxShadow:'0 10px 40px rgba(0,0,0,0.2)', marginTop:'80px'}}>
                                    <div style={{display:'flex', borderBottom:'1px solid #eee'}}>
                                        <button onClick={()=>setActiveVariantTab('color')} style={{flex:1, padding:'20px', border:'none', background: activeVariantTab==='color'?'#fff':'#f5f5f5', fontWeight: activeVariantTab==='color'?'bold':'normal', cursor:'pointer'}}>Color</button>
                                        <button onClick={()=>setActiveVariantTab('size')} style={{flex:1, padding:'20px', border:'none', background: activeVariantTab==='size'?'#fff':'#f5f5f5', fontWeight: activeVariantTab==='size'?'bold':'normal', cursor:'pointer'}}>Size</button>
                                    </div>
                                    <div style={{padding:'20px', maxHeight:'350px', overflowY:'auto'}}>
                                        {activeVariantTab === 'color' ? VARIANT_COLORS.map(c => (
                                            <div key={c.name} onClick={()=>setSelectedTshirtColor(c.hex)} style={{display:'flex', alignItems:'center', gap:'15px', padding:'12px', cursor:'pointer', borderRadius:'8px', background: selectedTshirtColor===c.hex?'#f0f7ff':'none'}}>
                                                <div style={{width:'24px', height:'24px', borderRadius:'50%', backgroundColor:c.hex, border:'1px solid #ddd'}} />
                                                <span>{c.name}</span>
                                            </div>
                                        )) : VARIANT_SIZES.map(s => <div key={s} style={{padding:'10px'}}><input type="checkbox" defaultChecked /> <span style={{marginLeft:'10px'}}>{s}</span></div>)}
                                    </div>
                                    <button onClick={()=>setShowVariantPopup(false)} style={{width:'100%', padding:'20px', border:'none', backgroundColor:'#0d375b', color:'white', fontSize:'16px', fontWeight:'bold', cursor:'pointer'}}>Apply Variants</button>
                                </div>
                            </div>
                        )}
                            <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {renderTShirtWorkspace()}
                                
                               {/* View Toggles (Edit Mode) */}
                                <div style={{ display: 'flex', gap: '30px', marginTop: '-50px', marginBottom: '60px', zIndex: 100, position: 'relative' }}>
                                    {/* 🟢 FRONT BUTTON ONLY (Active Style) */}
                                    <button 
                                        onClick={() => setCurrentSide('front')} 
                                        style={{ 
                                            padding: '15px 30px', 
                                            borderRadius: '30px', 
                                            border: 'none', 
                                            backgroundColor: '#0d375b', // Always Blue (Active)
                                            color: 'white', 
                                            fontSize: '18px', 
                                            fontWeight: '600', 
                                            cursor: 'default', // Cursor shows it's not clickable since it's the only option
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)' 
                                        }}
                                    >
                                        Front Side Only
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 🟢 RESTORED BOTTOM BAR HERE (Inside Edit Mode Wrapper) */}
                        <div className="bottom-bar" style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', padding:'15px 30px', borderTop:'1px solid #eee', backgroundColor:'white', marginTop: 'auto' }}>
                            <button 
                                className="finish-btn" 
                                onClick={handleSaveProduct} 
                                style={{ backgroundColor: '#0d375b', color: 'white', fontSize: '20px', fontWeight: 'bold', padding: '18px 35px', borderRadius: '15px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(13, 55, 91, 0.3)', transition: 'transform 0.2s' }} 
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} 
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Save Product
                            </button>
                        </div>

                    </div>
                ) : (
                    // 🟢 PREVIEW MODE LAYOUT
                    <div className="preview-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9f9f9', position: 'relative' }}>
                        
                        {/* 🟢 FLOATING TOGGLE BUTTONS (Top Right) */}
                        <div style={{ position: 'absolute', top: '20px', right: '30px', zIndex: 100 }}>
                            <div className="mode-toggle" style={{display:'flex', backgroundColor:'#f0f0f0', borderRadius:'30px', padding:'4px', border:'1px solid #ddd'}}>
                                {/* EDIT BUTTON (Always Inactive style here) */}
                                <button 
                                    onClick={() => { setCurrentSide('front'); setViewMode('edit'); }} 
                                    style={{ 
                                        padding: '8px 24px', 
                                        borderRadius: '25px', 
                                        border: 'none', 
                                        cursor: 'pointer', 
                                        fontSize:'14px', 
                                        fontWeight:'600', 
                                        backgroundColor: 'transparent', 
                                        color: '#666'                    
                                    }}
                                >
                                    Edit
                                </button>

                                {/* PREVIEW BUTTON (Always Active style here) */}
                                <button 
                                    onClick={() => setViewMode('preview')} 
                                    style={{ 
                                        padding: '8px 24px', 
                                        borderRadius: '25px', 
                                        border: 'none', 
                                        cursor: 'pointer', 
                                        fontSize:'14px', 
                                        fontWeight:'600', 
                                        backgroundColor: '#333',
                                        color: 'white'
                                    }}
                                >
                                    Preview
                                </button>
                            </div>
                        </div>

                        {/* LEFT: Large Preview Area */}
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                            {renderTShirtWorkspace()}
                        </div>

                        {/* RIGHT: Preview Options Sidebar */}
                        <div style={{ width: '600px', backgroundColor: 'white', borderLeft: '1px solid #eee', padding: '30px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                            
                            <div style={{fontSize:'20px', fontWeight:'700', marginBottom:'25px'}}>Mockup view</div>
                            
                            {/* 🟢 1. THUMBNAIL GRID WITH COLOR OVERLAY */}
                            <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'20px', marginBottom:'40px'}}>
                                {Object.entries(MOCKUP_CONFIG).map(([key, config]) => {
                                    // 🟢 Determine mask for thumbnail
                                    const maskImageSrc = (config as any).mask || config.img;
                                    const isLargeThumb = key === 'model_front' || key === 'model_back' || key === 'hanging';
                                    const thumbSize = '100%';
                                    const thumbMaskSize = (config as any).maskSize || 'contain';
                                    const thumbOverlayInset = isLargeThumb ? '10%' : '0%';
                                    const thumbOverlaySize = isLargeThumb ? '80%' : '100%';
                                    return (
                                    <div key={key} onClick={() => setCurrentSide(key as any)} style={{cursor:'pointer'}}>
                                            <div style={{
                                                border: currentSide === key ? '2px solid #0d375b' : '1px solid #ddd',
                                                borderRadius:'8px',
                                                padding:'10px',
                                                height:'200px',
                                                display:'flex', alignItems:'center', justifyContent:'center',
                                                backgroundColor: '#f6f6f6', // Light gray bg behind image
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                {/* Container for Image + Overlay */}
                                                <div style={{ position: 'relative', width: thumbSize, height: thumbSize }}>
                                                    {/* Base Image */}
                                                    <img 
                                                        src={config.img} 
                                                        alt={config.label} 
                                                        style={{width:'100%', height:'100%', objectFit:'contain', position: 'relative', zIndex: 1}} 
                                                    />
                                                    
                                                    {/* Color Overlay for Thumbnail */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: thumbOverlayInset,
                                                        left: thumbOverlayInset,
                                                        width: thumbOverlaySize,
                                                        height: thumbOverlaySize,
                                                        backgroundColor: selectedTshirtColor,
                                                        zIndex: 2,
                                                        mixBlendMode: 'multiply',
                                                        // 🟢 Use the determined maskImageSrc
                                                        maskImage: `url(${maskImageSrc})`,
                                                        WebkitMaskImage: `url(${maskImageSrc})`,
                                                        
                                                        maskSize: thumbMaskSize,
                                                        WebkitMaskSize: thumbMaskSize,
                                                        maskPosition: (config as any).maskPosition || 'center',
                                                        WebkitMaskPosition: (config as any).maskPosition || 'center',
                                                        
                                                        maskRepeat: 'no-repeat',
                                                        WebkitMaskRepeat: 'no-repeat',
                                                        pointerEvents: 'none'
                                                    }} />
                                                </div>
                                            </div>
                                            <div style={{textAlign:'center', fontSize:'16px', marginTop:'8px', color:'#333', fontWeight:'500'}}>{config.label}</div>
                                    </div>
                                )})}
                            </div>

                            {/* 🟢 2. COLOR PICKER GRID */}
                            <div style={{fontSize:'18px', fontWeight:'700', marginBottom:'15px'}}>Colors</div>
                            
                            <div style={{display:'flex', flexWrap:'wrap', gap:'15px', marginBottom:'30px'}}>
                                {VARIANT_COLORS.map((color) => (
                                    <div 
                                        key={color.name}
                                        onClick={() => setSelectedTshirtColor(color.hex)}
                                        title={color.name}
                                        style={{
                                            width: '40px', 
                                            height: '40px', 
                                            borderRadius: '50%', 
                                            backgroundColor: color.hex, 
                                            border: selectedTshirtColor === color.hex ? '3px solid #0d375b' : '1px solid #ccc',
                                            boxShadow: selectedTshirtColor === color.hex ? '0 0 0 2px white inset' : 'none', // Inner white ring for selected state
                                            cursor: 'pointer',
                                            transition: 'transform 0.1s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} 
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                ))}
                            </div>

                            <div style={{marginTop:'auto', paddingTop:'20px', borderTop:'1px solid #eee'}}>
                                <button style={{display:'flex', alignItems:'center', gap:'10px', background:'none', border:'none', fontSize:'16px', fontWeight:'600', cursor:'pointer', color:'#333'}}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    Download mockup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showCropModal && cropImageSrc && (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '70vw', height: '70vh', background: '#fff', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 700 }}>Crop Image</div>
                                <button onClick={() => setShowCropModal(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                            </div>
                            <div style={{ position: 'relative', flex: 1, background: '#111', padding: '16px' }}>
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={cropAspect}
                                    keepSelection
                                >
                                    <img
                                        ref={cropImageRef}
                                        src={cropImageSrc}
                                        alt="Crop"
                                        style={{ maxHeight: '55vh', maxWidth: '100%', display: 'block', margin: '0 auto' }}
                                    />
                                </ReactCrop>
                            </div>
                            <div style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <label style={{ fontSize: '12px', color: '#666' }}>Aspect</label>
                                    <button onClick={() => applyCropPreset(undefined)} style={{ padding: '6px 10px', border: '1px solid #ccc', background: cropAspect === undefined ? '#0d375b' : '#fff', color: cropAspect === undefined ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer' }}>Free</button>
                                    <button onClick={() => applyCropPreset(1)} style={{ padding: '6px 10px', border: '1px solid #ccc', background: cropAspect === 1 ? '#0d375b' : '#fff', color: cropAspect === 1 ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer' }}>1:1</button>
                                    <button onClick={() => applyCropPreset(4 / 3)} style={{ padding: '6px 10px', border: '1px solid #ccc', background: cropAspect === 4 / 3 ? '#0d375b' : '#fff', color: cropAspect === 4 / 3 ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer' }}>4:3</button>
                                    <button onClick={() => applyCropPreset(3 / 4)} style={{ padding: '6px 10px', border: '1px solid #ccc', background: cropAspect === 3 / 4 ? '#0d375b' : '#fff', color: cropAspect === 3 / 4 ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer' }}>3:4</button>
                                    <button onClick={() => applyCropPreset(16 / 9)} style={{ padding: '6px 10px', border: '1px solid #ccc', background: cropAspect === 16 / 9 ? '#0d375b' : '#fff', color: cropAspect === 16 / 9 ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer' }}>16:9</button>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => setShowCropModal(false)} style={{ padding: '8px 14px', border: '1px solid #ccc', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                    <button onClick={handleApplyCrop} style={{ padding: '8px 14px', border: 'none', background: '#0d375b', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Apply Crop</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* 🟢 FOOTER (Only visible in Edit Mode) */}
                {viewMode === 'edit' && <Footer />}
            </div> {/* Closes main-content */}

            {isSaving && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 5000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                }}>
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.92)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '22px',
                        padding: '36px 44px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 16px 50px rgba(0,0,0,0.4)'
                    }}>
                        <svg width="44" height="44" viewBox="0 0 50 50" aria-label="Loading">
                            <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="4" />
                            <circle cx="25" cy="25" r="20" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 94.2">
                                <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite" />
                            </circle>
                        </svg>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.3px' }}>
                                Preparing submission
                            </div>
                            <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                                Capturing design and generating previews
                            </div>
                        </div>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
