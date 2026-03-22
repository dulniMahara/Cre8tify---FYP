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
    { name: "White", hex: "#ffffff", isAvailable: true },
    { name: "Black", hex: "#000000", isAvailable: false},
    { name: "Athletic Heather", hex: "#cfcfcf", isAvailable: true }, 
    { name: "Dark Grey", hex: "#555555", isAvailable: true },
    { name: "Navy", hex: "#000080", isAvailable: true },
    { name: "Red", hex: "#d32f2f", isAvailable: true },
    { name: "Royal Blue", hex: "#1565c0", isAvailable: true },
    { name: "Maroon", hex: "#800000", isAvailable: true },
    { name: "Forest Green", hex: "#228b22", isAvailable: true},
    { name: "Gold", hex: "#ffd700", isAvailable: true },
];

const VARIANT_SIZES = [
    { label: "S", isAvailable: true },
    { label: "M", isAvailable: false },
    { label: "L", isAvailable: true },
    { label: "XL", isAvailable: true },
    { label: "2XL", isAvailable: true },
    { label: "3XL", isAvailable: true },
];

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
            printArea: { top: '56%', left: '46%', width: '30%', height: '42%', rotation: 5 }
        },
        model_front: { 
            img: "/img/mockups/girl_front.png",
            label: 'Model Front',
            mask: "/img/mockups/girl_frontmask.png",
            maskSize: '90% auto', 
            maskPosition: '50% 85%',
            showDesign: true,
            // 🟢 UPDATED: Width is now 20%
            printArea: { top: '57%', left: '40%', width: '42%', height: '40%', rotation: 3 }
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
            maskSize: 'contain',
            maskPosition: 'center',
            showDesign: true,
            printArea: { top: '53%', left: '49%', width: '38%', height: '35%', rotation: 0 }, // 🟢 Added comma here!
            thumbnailMaskScale: '45%',
            thumbnailMaskTop: '32%',
            thumbnailMaskBottom: '52%',
        }
    };

   useEffect(() => {
        // 1. PRIORITY: Check if we are coming from the "Edit" or "Fix Design" button in the shop
        if (location.state?.isEdit && location.state?.savedLayers) {
            const { imageLayers, textLayers } = location.state.savedLayers;
            if (imageLayers) setImageLayers(imageLayers);
            if (textLayers) setTextLayers(textLayers);
            
            // Clear the navigation state so a refresh doesn't keep forcing old data
            window.history.replaceState({}, document.title);
            return; // Stop here if we loaded from the database
        }

        // 2. FALLBACK: If not editing from DB, check the local storage for drafts
        const savedDesign = localStorage.getItem('temp_design_state');
        if (savedDesign) {
            try {
                const parsed = JSON.parse(savedDesign);
                
                if (parsed.imageLayers) {
                    // Your existing normalization logic for local images
                    const normalized = (parsed.imageLayers as ImageLayer[]).map((layer) => {
                        if (typeof layer.src === 'string' && layer.src.includes('/upload') && !layer.src.includes('/uploads/')) {
                            const filename = layer.src.split('/upload').pop()?.replace(/^\/+/, '');
                            if (filename) {
                                return { ...layer, src: `${API_URL}/uploads/library/${filename}` };
                            }
                        }
                        return layer;
                    });
                    setImageLayers(normalized as any);
                }
                if (parsed.textLayers) setTextLayers(parsed.textLayers as any);
                if (parsed.selectedTshirtColor) setSelectedTshirtColor(parsed.selectedTshirtColor);
            } catch (err) {
                console.error("Failed to load saved design", err);
            }
        }
    }, [location.state]); // 🟢 Add location.state here so it triggers on navigation

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
                    zIndex: maxZ + 1, // 🟢 Starts on top
                };

                const updatedImages = [...imageLayers, newImage];
                setImageLayers(updatedImages);
                setSelectedId(newImage.id);
                addToHistory(updatedImages, textLayers);
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
        zIndex: maxZ + 1, // 🟢 Starts on top
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
                // Since libraryItems comes from useLibrary(), 
                // you might need a 'refreshLibrary' function from that hook,
                // or simply reload the page for now to see changes:
                window.location.reload(); 
            } else {
                alert("Failed to delete image from server.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
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
    
    // Check if we are editing a text layer
    const isText = textLayers.some(t => t.id === selectedId);
    
    if (isText) {
        setTextLayers(prev => prev.map(t => 
            t.id === selectedId ? { ...t, [prop]: value } : t
        ));
        
        // Save to history only when user stops typing or clicks away
        if (isFinal) {
            const updatedTexts = textLayers.map(t => t.id === selectedId ? { ...t, [prop]: value } : t);
            addToHistory(imageLayers, updatedTexts);
        }
    } else {
        // Image logic stays the same
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

        const waitForPaint = () => new Promise<void>(resolve => {
            // Double requestAnimationFrame ensures the browser has finished a full paint cycle
            requestAnimationFrame(() => {
                requestAnimationFrame(() => resolve());
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

        const normalizeImageLayers = async (layers: ImageLayer[]) => {
            const normalized = await Promise.all(layers.map(async (layer) => {
                if (layer.src.startsWith('blob:')) {
                    try {
                        const res = await fetch(layer.src);
                        const blob = await res.blob();
                        const dataUrl = await blobToDataURL(blob);
                        return { ...layer, src: dataUrl };
                    } catch {
                        return layer;
                    }
                }
                return layer;
            }));
            return normalized;
        };

        const printAreaPxMap: Record<string, { width: number; height: number } | null> = {
            front: null,
            folded: null,
            hanging: null
        };

        const captureDesignOnly = async (side: 'front' | 'folded' | 'hanging') => {
            setCurrentSide(side);
            await new Promise(resolve => setTimeout(resolve, 400)); 
            await waitForPaint();

            const workspaceElement = document.getElementById('tshirt-capture-area');
            const printArea = workspaceElement?.querySelector('.print-area') as HTMLElement | null;
            
            if (!printArea) return null;

            // 🟢 THE FIX: Temporarily disable cropping for the capture
            const originalOverflow = printArea.style.overflow;
            printArea.style.overflow = 'visible';

            try {
                const canvas = await html2canvas(printArea, {
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: null,
                    scale: 2,
                    logging: true,
                    
                });

                // Restore original style
                printArea.style.overflow = originalOverflow;
                const trimmed = trimTransparent(canvas);
                return trimmed.toDataURL("image/png");
            } catch (err) {
                printArea.style.overflow = originalOverflow;
                console.error("Snapshot failed:", err);
                return null;
            }
        };

    const captureMockup = async (side: 'front' | 'folded') => {
            setCurrentSide(side);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await waitForPaint();

            const workspaceElement = document.getElementById('tshirt-capture-area');
            if (!workspaceElement) return null;

            try {
                const canvas = await html2canvas(workspaceElement, {
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: null,
                    scale: 2,
                });
                return canvas.toDataURL("image/png");
            } catch (err) {
                console.error("Mockup snapshot failed:", err);
                return null;
            }
        };

        // 🟢 CRITICAL: Sequential capturing
        const frontDesign = await captureDesignOnly('front');
        const foldedDesign = await captureDesignOnly('folded');
        const hangingDesign = await captureDesignOnly('hanging');
        const frontSnapshot = await captureMockup('front');
        const foldedSnapshot = await captureMockup('folded');

        // Restore UI state
        setCurrentSide(prevSide);
        setViewMode(prevMode);

        const normalizedImageLayers = await normalizeImageLayers(imageLayers);

       const submissionData = { 
            productImages: [
                // 🟢 THE FIX: Use frontSnapshot (the photo with your design)
                // instead of MOCKUP_CONFIG.front.img (the blank shirt)
                frontSnapshot,      // This is what will show in "My Shop"
                foldedSnapshot,     // This is the second view
                MOCKUP_CONFIG.back.img,
                MOCKUP_CONFIG.neck.img,
                MOCKUP_CONFIG.hanging.img
            ], 
            productType: productData?.name || 'Women Fit Boxy T-shirt',
            // 🟢 CRITICAL: Send normalizedImageLayers (Base64) so it saves permanently
            canvasState: { imageLayers: normalizedImageLayers, textLayers },
            tshirtColor: selectedTshirtColor || "#ffffff",
            
            // Link the snapshots to the specific mockup fields
            frontMockup: frontSnapshot,
            frontPrintArea: MOCKUP_CONFIG.front.printArea,
            foldedMockup: foldedSnapshot,
            foldedMask: (MOCKUP_CONFIG.folded as any).mask,
            foldedPrintArea: MOCKUP_CONFIG.folded.printArea,
            foldedMaskSize: (MOCKUP_CONFIG.folded as any).maskSize,
            foldedMaskPosition: (MOCKUP_CONFIG.folded as any).maskPosition,
            
            hangingMockup: MOCKUP_CONFIG.hanging.img,
            hangingMask: (MOCKUP_CONFIG.hanging as any).mask,
            hangingPrintAreaPx: printAreaPxMap.hanging,
            hangingMaskSize: (MOCKUP_CONFIG.hanging as any).maskSize,
            hangingMaskPosition: (MOCKUP_CONFIG.hanging as any).maskPosition,
            
            // Design-only captures (the "PNG" versions)
            frontDesign,
            foldedDesign,
            hangingDesign,
            
            frontPrintAreaPx: printAreaPxMap.front,
            foldedPrintAreaPx: printAreaPxMap.folded,
        };

        // Save local backup
        localStorage.setItem('temp_design_state', JSON.stringify({ 
            imageLayers, 
            textLayers, 
            selectedTshirtColor 
        }));

        console.log("Snapshot Preview:", frontSnapshot);
        // Navigate to the next page
        navigate('/submit-product', { state: submissionData });
    };


    const moveLayer = (id: number, direction: 'up' | 'down') => {
        // 1. Combine all layers into a single master list to see the full stack
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

        // 4. Split them back into their original state arrays
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
        // 1. Safety check: ensure we have a crop area, a target image, and the image source
        if (!completedCrop || !cropTargetId || !cropImageSrc) return;

        const image = new Image();
        image.crossOrigin = "anonymous"; // tells browser to request CORS permission
        image.src = cropImageSrc + (cropImageSrc.includes('?') ? '&' : '?') + 't=' + Date.now();
        
        image.onload = () => {
            // 2. Create a canvas to draw the cropped section
            const canvas = document.createElement('canvas');
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            
            canvas.width = completedCrop.width;
            canvas.height = completedCrop.height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                // 3. Draw only the selected portion of the image onto the canvas
                ctx.drawImage(
                    image,
                    completedCrop.x * scaleX,
                    completedCrop.y * scaleY,
                    completedCrop.width * scaleX,
                    completedCrop.height * scaleY,
                    0, 0, completedCrop.width, completedCrop.height
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
    };

    
    const renderTShirtWorkspace = () => {
        const config = viewMode === 'edit' 
        ? MOCKUP_CONFIG.front 
        : (MOCKUP_CONFIG[currentSide as keyof typeof MOCKUP_CONFIG] || MOCKUP_CONFIG.front);
            
        // Safety checks for mask properties
        const maskSrc = (config as any).mask || config.img;
        const mSize = (config as any).maskSize || 'contain';
        const mPos = (config as any).maskPosition || 'center';
        
        const isPreview = viewMode === 'preview';
        const useRealisticPreview = isPreview && REALISTIC_PREVIEW_SIDES.has(currentSide);
        const shouldShowDesign = viewMode === 'edit' ? true : config.showDesign;

        return (
            <div id="tshirt-capture-area" style={{ 
                position: 'relative', 
                width: 'fit-content', 
                backgroundColor: '#f5f5f5', // Uniform Ash Background
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                
                // @ts-ignore
                isolation: 'isolate',
                /* 🟢 TARGETED SIZE INCREASE */
                /* If currentSide is 'hanging', we scale it up. Otherwise, stay at 1. */
                transform: currentSide === 'hanging' ? 'scale(1.25)' : 'scale(1)',
                
                /* Optional: If the hanging one needs more vertical room to not look cramped */
                height: currentSide === 'hanging' ? '850px' : '800px',
                
                transition: 'transform 0.3s ease, height 0.3s ease', 
                margin: '0 auto'
            }}>
                
                {/* 1. Base Mockup Image */}
                <img 
                    src={config.img} 
                    alt="Mockup" 
                    crossOrigin="anonymous" 
                    style={{ display: 'block', height: '100%', position: 'relative', zIndex: 1 }} 
                />

                {/* 2. Color Overlay Layer */}
                <div style={{ 
                    position: 'absolute', inset: 0, 
                    backgroundColor: selectedTshirtColor, 
                    mixBlendMode: 'multiply',
                    WebkitMaskImage: `url(${maskSrc})`, maskImage: `url(${maskSrc})`, 
                    WebkitMaskSize: mSize, maskSize: mSize, 
                    WebkitMaskPosition: (config as any).thumbnailMaskTop ? `center ${(config as any).thumbnailMaskTop}` : 'center', 
                    maskPosition: (config as any).thumbnailMaskTop ? `center ${(config as any).thumbnailMaskTop}` : 'center',
                        WebkitMaskRepeat: 'no-repeat', 
                        maskRepeat: 'no-repeat', 
                        zIndex: 2, 
                        pointerEvents: 'none',
                }}></div>

                {/* 3. Design Print Area (The Dashed Box / Clipping Window) */}
                <div 
                    ref={printAreaRef} 
                    className={`print-area ${currentSide === 'back' ? 'back-view' : ''}`} 
                    style={{ 
                        position: 'absolute', 
                        zIndex: 20, 
                        top: config.printArea.top, 
                        left: config.printArea.left, 
                        width: config.printArea.width, 
                        height: config.printArea.height, 
                        transform: `translate(-50%, -50%) rotate(${(config.printArea as any).rotation ?? 0}deg)`, 
                        // Dashed border logic
                        border: viewMode === 'edit' && !isSaving ? '2px dashed rgba(0,0,0,0.4)' : 'none',
                        overflow: 'hidden', // Clips gallery images to the t-shirt
                        boxSizing: 'border-box',
                        pointerEvents: isPreview ? 'none' : 'auto',
                        // @ts-ignore
                        isolation: 'isolate' 
                    }}
                >
                    {/* Gallery Images */}
                    {shouldShowDesign && imageLayers.map((layer) => (
                        <img 
                            key={layer.id} 
                            src={layer.src} 
                            style={{ 
                                position: 'absolute', 
                                zIndex: layer.zIndex, 
                                transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale}) rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
                                mixBlendMode: (isPreview && selectedTshirtColor.toLowerCase() !== '#ffffff') ? 'multiply' : 'normal',
                                opacity: isPreview ? 0.92 : 1,
                                cursor: 'move',
                                border: (selectedId === layer.id && viewMode === 'edit' && !isSaving) ? '1px dashed #0d375b' : 'none' 
                            }} 
                            onMouseDown={(e) => handleDragStart(e, layer.id, 'image', layer.x, layer.y)} 
                        />
                    ))}

                    {/* Text Layers */}
                    {shouldShowDesign && textLayers.map((t) => (
                        <div 
                            key={t.id} 
                            style={{ 
                                position: 'absolute', 
                                zIndex: t.zIndex,
                                transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale}) rotate(${t.rotation}deg)`, 
                                cursor: 'move', 
                                border: (selectedId === t.id && viewMode === 'edit' && !isSaving) ? '1px solid #0d375b' : 'none', 
                                display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px'
                            }} 
                            onMouseDown={(e) => handleDragStart(e, t.id, 'text', t.x, t.y)}
                        >
                            {t.styleId === 'default' ? (
                                <div style={{ 
                                    fontFamily: t.font, color: t.color, fontSize: '24px', fontWeight: 'bold', whiteSpace: 'nowrap',
                                    textShadow: isPreview ? '0px 1px 3px rgba(0,0,0,0.3)' : 'none'
                                }}>
                                    {t.text}
                                </div>
                            ) : (
                                <CurvedText text={t.text} styleId={t.styleId} fontFamily={t.font} color={t.color} />
                            )}
                        </div>
                    ))}
                </div>

                {/* 4. Realistic Wrinkles/Shadows (Preview Only) */}
                {shouldShowDesign && useRealisticPreview && (
                    <div style={{ 
                        position: 'absolute', inset: 0, 
                        backgroundImage: `url(${config.img})`, 
                        backgroundSize: 'cover', backgroundPosition: 'center', 
                        mixBlendMode: 'multiply', opacity: 0.15, 
                        pointerEvents: 'none', zIndex: 15 
                    }} />
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
                {imageLayers.map((layer) => (   
                    <img 
                        key={layer.id} 
                        src={layer.src} 
                        style={{ 
                            position: 'absolute', 
                            zIndex: layer.zIndex, 
                            // 🟢 NO MATH HERE: Use exact same transform as DesignTool
                            transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale}) rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1})`,
                            transformOrigin: 'center center',
                            maxWidth: 'none',
                            width: '100%',
                            height: 'auto'
                        }} 
                    />
                ))}

                {/* 2. Text Layers */}
                {textLayers.map((t) => (
                    <div 
                        key={t.id} 
                        style={{ 
                            position: 'absolute', 
                            zIndex: t.zIndex,
                            // 🟢 NO MATH HERE: Use exact same transform as DesignTool
                            transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale}) rotate(${t.rotation}deg)`,
                            transformOrigin: 'center center'
                        }}
                    >
                        {t.styleId === 'default' ? (
                            <div style={{ fontFamily: t.font, color: t.color, fontSize: '24px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                {t.text}
                            </div>
                        ) : (
                            <CurvedText text={t.text} styleId={t.styleId} fontFamily={t.font} color={t.color} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
   
         const handleToggleView = (mode: 'edit' | 'preview') => {
            setViewMode(mode);
            if (mode === 'edit') {
                // 🟢 This ensures that whenever you switch to Edit, 
                // the workspace resets to the Front view.
                setCurrentSide('front');
            }
        };        

        return (
        <div className="dashboard-container" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
            
            {/* 1. SIDEBAR (Restored original style and logo) */}
            {viewMode === 'edit' && (
                <div className="sidebar" style={{ width: '260px', flexShrink: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
                className="main-content"
                style={{
                    flex: 1,
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5',
                    width: viewMode === 'preview' ? '100%' : undefined,
                    marginLeft: viewMode === 'preview' ? 0 : undefined,
                    opacity: isSaving ? 0 : 1,
                    pointerEvents: isSaving ? 'none' : 'auto'
                }}
            >                
                
                {/* 🟢 TOP HEADER - Now always visible */}
                <header className="top-header" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0 20px', 
                    minHeight: '70px', 
                    flexShrink: 0,
                    backgroundColor: '#0d375b', // Keeps your dark blue theme
                    zIndex: 1000 
                }}>
                    {/* Left Side: Back Button */}
                    <div 
                        style={{display:'flex', alignItems:'center', gap:'15px', cursor: 'pointer'}} 
                        onClick={() => navigate('/designer-dashboard')}
                    >
                        <img src="/img/back.png" alt="Back" style={{width:'30px', height:'30px', filter:'invert(1)'}} /> 
                        <span style={{color:'white', fontWeight:700, fontSize: '20px'}}>Back</span>
                    </div>

                    {/* Right Side: Profile */}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px', marginRight: '30px' }}>
                        {/* Profile Picture */}
                        <img 
                            src={navProfileImg} 
                            alt="Profile" 
                            style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)', cursor: 'pointer' }} 
                            onClick={() => navigate('/profile')}
                        />
                    </div>
                    
                </header>
               {showVariantPopup && (
                    <div className="modal-overlay" onClick={() => setShowVariantPopup(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '170px' }}>
                        <div className="variant-popup-card" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', width: '450px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', marginTop: '80px' }}>
                            <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                                <button onClick={() => setActiveVariantTab('color')} style={{ flex: 1, padding: '20px', border: 'none', background: activeVariantTab === 'color' ? '#fff' : '#f5f5f5', fontWeight: activeVariantTab === 'color' ? 'bold' : 'normal', cursor: 'pointer' }}>Color</button>
                                <button onClick={() => setActiveVariantTab('size')} style={{ flex: 1, padding: '20px', border: 'none', background: activeVariantTab === 'size' ? '#fff' : '#f5f5f5', fontWeight: activeVariantTab === 'size' ? 'bold' : 'normal', cursor: 'pointer' }}>Size</button>
                            </div>
                            
                            <div style={{ padding: '20px', maxHeight: '350px', overflowY: 'auto' }}>
                                {activeVariantTab === 'color' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {VARIANT_COLORS.map(c => (
                                            <div key={c.name} onClick={() => c.isAvailable && setSelectedTshirtColor(c.hex)} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', cursor: c.isAvailable ? 'pointer' : 'not-allowed', borderRadius: '8px', opacity: c.isAvailable ? 1 : 0.4, background: selectedTshirtColor === c.hex ? '#f0f7ff' : 'none' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: c.hex, border: '1px solid #ddd' }} />
                                                <span>{c.name} {!c.isAvailable && "(Unavailable)"}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                        {VARIANT_SIZES.map(s => (
                                            <div key={s.label} style={{ padding: '15px 10px', textAlign: 'center', borderRadius: '8px', border: '1px solid #ddd', fontWeight: '700', fontSize: '14px', backgroundColor: s.isAvailable ? '#fff' : '#f5f5f5', color: s.isAvailable ? '#0d375b' : '#aaa', opacity: s.isAvailable ? 1 : 0.6, position: 'relative' }}>
                                                {s.label}
                                                {!s.isAvailable && <div style={{ fontSize: '8px', color: '#d32f2f', marginTop: '4px' }}>OUT OF STOCK</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setShowVariantPopup(false)} style={{ width: '100%', padding: '20px', border: 'none', backgroundColor: '#0d375b', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>Apply Variants</button>
                        </div>
                    </div>
                )}

               {/* 🟢 CONDITIONAL RENDERING: EDIT vs PREVIEW */}
                {viewMode === 'edit' ? (
                    <div className="design-wrapper" style={{ display: 'flex', flexDirection: 'row', flex: 1, width: '100%', position: 'relative', overflow: 'hidden' }}>
                        
                       {/* 🟢 SIDE PANEL - Universal Features */}
                        {activePanel !== 'none' && (
                            <div className="side-panel-container" style={{ width: '320px', flexShrink: 0, backgroundColor: 'white', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', zIndex: 1200 }}>
                                
                                {/* UNIVERSAL PANEL HEADER */}
                                <div className="panel-header" style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', textTransform: 'capitalize' }}>
                                        {activePanel === 'colors' ? 'Colours' : activePanel === 'text' ? 'Add Text' : activePanel}
                                    </h3>
                                </div>

                                {/* SEARCH BAR (For Text and Library) */}
                                {(activePanel === 'text' || activePanel === 'library') && (
                                   <div style={{ padding: '0 20px 20px 20px', borderBottom: '1px solid #eee' }}>
                                        <label style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                                            TYPE YOUR TEXT HERE
                                        </label>
                                        <input 
                                            key={selectedId}
                                            type="text" 
                                            placeholder="Enter your text..." 
                                            autoFocus
                                            // 🟢 Bind this to the selected text layer's text
                                            value={activeTextConfig?.text || ''} 
                                            onChange={(e) => {
                                                // Pass 'false' for isFinal so it updates the shirt instantly without lagging the app
                                                updateActiveLayer('text', e.target.value, false); 
                                            }}
                                            // Add onBlur to save the final word to history once the user clicks out
                                            onBlur={(e) => {
                                                updateActiveLayer('text', e.target.value, true);
                                            }}
                                            style={{ 
                                                width: '100%', 
                                                padding: '12px', 
                                                borderRadius: '8px', 
                                                border: '2px solid #0d375b', // Using your theme color
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                outline: 'none'
                                            }} 
                                        />
                                    </div> 
                                )}

                                <div className="panel-scroll-area" style={{ flex: 1, overflowY: 'auto' }}>
                                    
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
                                            value={librarySearchTerm} // Reusing search state
                                            onChange={(e) => setLibrarySearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="panel-scroll-area">
                                        {/* 2. CRITICAL: THE CUSTOM TEXT ENTRY BOX */}
                                        <div className="panel-section" style={{ padding: '0 15px 20px 15px', borderBottom: '1px solid #eee' }}>
                                            <label style={{ fontSize: '11px', color: '#888', fontWeight: '700', marginBottom: '8px', display: 'block' }}>
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
                                                    borderRadius: '8px', 
                                                    border: '2px solid #0d375b', 
                                                    fontSize: '16px',
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

                                    {/* SIZE PANEL (Scale, Rotation, X/Y) */}
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
                                                        
                                                        {/* 🟢 UNIFIED SORTED LIST: Orders cards by their actual Z-Index */}
                                                        {[
                                                            ...imageLayers.map((img, idx) => ({ ...img, type: 'image', label: `Image ${idx + 1}` })),
                                                            ...textLayers.map((txt, idx) => ({ ...txt, type: 'text', label: `Text ${idx + 1}` }))
                                                        ]
                                                        .sort((a, b) => b.zIndex - a.zIndex) // 🟢 Higher zIndex (top layers) appear at the top of the list
                                                        .map((layer) => (
                                                            <div 
                                                                key={`${layer.type}-${layer.id}`} 
                                                                className="layer-row" 
                                                                style={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    justifyContent: 'space-between', 
                                                                    padding: '15px', 
                                                                    border: selectedId === layer.id ? '2px solid #0d375b' : '1px solid #ddd', 
                                                                    borderRadius: '12px', 
                                                                    backgroundColor: '#fff', 
                                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
                                                                    cursor: 'pointer' 
                                                                }} 
                                                                onClick={() => {
                                                                    setSelectedId(layer.id);
                                                                    if (layer.type === 'text') setActivePanel('text');
                                                                }}
                                                            >
                                                                <div style={{ 
                                                                        width: '40px', 
                                                                        height: '40px', 
                                                                        borderRadius: '6px', 
                                                                        backgroundColor: '#f5f5f5', 
                                                                        display: 'flex', 
                                                                        alignItems: 'center', 
                                                                        justifyContent: 'center',
                                                                        overflow: 'hidden',
                                                                        border: '1px solid #eee'
                                                                    }}>
                                                                        {/* 🟢 FIXED: Using type assertion (as any) or checking the layer type explicitly */}
                                                                        {layer.type === 'image' ? (
                                                                            <img 
                                                                                src={(layer as ImageLayer).src} 
                                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                                            />
                                                                        ) : (
                                                                            <div style={{ 
                                                                                fontSize: '12px', 
                                                                                fontWeight: 'bold', 
                                                                                color: '#0d375b',
                                                                                fontFamily: (layer as TextConfig).font // Optional: shows a font preview
                                                                            }}>
                                                                                Aa
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                <div style={{ display:'flex', gap:'6px' }}>
                                                                    <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'up'); }} style={{ width:'32px', height:'32px', cursor:'pointer', border:'1px solid #ddd', background:'white', borderRadius:'6px' }}>↑</button>
                                                                    <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'down'); }} style={{ width:'32px', height:'32px', cursor:'pointer', border:'1px solid #ddd', background:'white', borderRadius:'6px' }}>↓</button>
                                                                    <button onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if(!window.confirm("Remove layer?")) return;
                                                                        if (layer.type === 'text') {
                                                                            const updated = textLayers.filter(t => t.id !== layer.id);
                                                                            setTextLayers(updated);
                                                                            addToHistory(imageLayers, updated);
                                                                        } else {
                                                                            const updated = imageLayers.filter(i => i.id !== layer.id);
                                                                            setImageLayers(updated);
                                                                            addToHistory(updated, textLayers);
                                                                        }
                                                                        if (selectedId === layer.id) setSelectedId(null);
                                                                    }} style={{ width:'32px', height:'32px', cursor:'pointer', border:'none', background:'#fee2e2', color:'#dc2626', borderRadius:'6px' }}>🗑</button>
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
                                </div>
                            </div>
                        )}
                            {/* 2. WORKSPACE AREA */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                                
                            {/* CANVAS TOOLBAR - Kept clean and at the top */}
                            <div className="canvas-header" style={{ height: '80px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 25px', backgroundColor: 'white', borderBottom: '1px solid #eee', flexShrink: 0, zIndex: 1100 }}>
                                <div className="header-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
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
                                <div style={{ width: '1px', height: '30px', background: '#ddd', margin: '0 10px' }}></div>

                                {/* RESTORED: Tools with SVG Icons and Text Labels */}
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('flipX')} title="Flip Horizontal">
                                        <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12H20M4 12L8 8M4 12L8 16"/></svg>
                                        <span style={{marginLeft: '5px'}}>Flip H</span>
                                    </button>
                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('flipY')} title="Flip Vertical">
                                        <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{transform:'rotate(90deg)'}}><path d="M4 12H20M4 12L8 8M4 12L8 16"/></svg>
                                        <span style={{marginLeft: '5px'}}>Flip V</span>
                                    </button>
                                    <button style={toolBtnStyle(isSomethingSelected)} onClick={() => handleImageTool('duplicate')} title="Duplicate">
                                        <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                        <span style={{marginLeft: '5px'}}>Duplicate</span>
                                    </button>
                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('fit')} title="Fit">
                                        <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 10V4h6"/><path d="M20 10V4h-6"/><path d="M4 14v6h6"/><path d="M20 14v6h-6"/></svg>
                                        <span style={{marginLeft: '5px'}}>Fit</span>
                                    </button>
                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('fill')} title="Fill">
                                        <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
                                        <span style={{marginLeft: '5px'}}>Fill</span>
                                    </button>
                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('crop')} title="Crop">
                                        <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path></svg>
                                        <span style={{marginLeft: '5px'}}>Crop</span>
                                    </button>
                                    <button style={toolBtnStyle(isImageSelected)} onClick={() => handleImageTool('cutout')} title="Cutout">
                                        <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                                        <span style={{marginLeft: '5px'}}>Cutout</span>
                                    </button>

                                    <div style={{ width: '1px', height: '30px', background: '#ddd', margin: '0 5px' }}></div>

                                    <button style={{...toolBtnStyle(isSomethingSelected), color: isSomethingSelected ? '#d32f2f' : '#ccc'}} onClick={() => handleImageTool('delete')} title="Delete">
                                        <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                        <span style={{marginLeft: '5px'}}>Delete</span>
                                    </button>
                                </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginRight: '60px' }}>
                                    <div className="mode-toggle" style={{ display: 'flex', backgroundColor: '#f0f0f0', borderRadius: '30px', padding: '4px', border: '1px solid #ddd' }}>
                                        <button 
                                            onClick={() => {
                                                setViewMode('edit');
                                                setCurrentSide('front'); 
                                            }} 
                                            style={{ 
                                                padding: '8px 24px', 
                                                borderRadius: '25px', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                fontWeight: '600', 
                                                backgroundColor: viewMode === 'edit' ? '#0d375b' : 'transparent', 
                                                color: viewMode === 'edit' ? 'white' : '#666' 
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button onClick={() => setViewMode('preview')} style={{ padding: '8px 24px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: '600', color: '#666' }}>Preview</button>
                                    </div>
                                    <img src="/img/editing.png" alt="Variants" style={{ width: '30px', cursor: 'pointer' }} onClick={() => setShowVariantPopup(true)} />
                                </div>
                            </div>

                            {/* T-SHIRT CANVAS AREA */}
                            <div className="workspace-scroll-container" style={{ flex: 1, width: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '60px', backgroundColor: '#f5f5f5', minHeight: 0, position: 'relative', zIndex: 1 }}>
                                {/* 🟢 RESTORED INFO POPUP LOGIC */}
                                    {showInfoPopup && (
                                        <div className="product-info-card" style={{
                                            position: 'absolute',
                                            top: '20px',
                                            left: '20px',
                                            width: '340px',
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 25px rgba(0,0,0,0.15)',
                                            zIndex: 1500, // Increased to be above everything
                                            fontSize: '13px',
                                            color: '#333',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            maxHeight: '90%', 
                                            overflow: 'hidden'
                                        }}>
                                            {/* Header */}
                                            <div style={{ display:'flex', alignItems:'center', padding:'15px 20px', borderBottom:'1px solid #eee', position: 'relative' }}>
                                                <h3 style={{margin:0, fontSize:'16px', fontWeight:'700', color:'#222'}}>Important Product Information</h3>
                                                <span onClick={()=>setShowInfoPopup(false)} style={{ position: 'absolute', right: '15px', top: '15px', cursor:'pointer', fontSize:'18px', color:'#888', fontWeight: 'bold' }}>✕</span>
                                            </div>

                                            {/* Scrollable Content */}
                                            <div style={{padding:'20px', overflowY:'auto'}}>
                                                <div style={{display:'flex', gap:'15px', marginBottom:'20px'}}>
                                                    <img src={designImage} alt="Base" style={{width:'70px', height:'90px', objectFit:'cover', borderRadius:'4px', backgroundColor:'#f5f5f5'}} />
                                                    <div>
                                                        <div style={{fontWeight:'700', fontSize:'15px', marginBottom:'2px'}}>{designTitle}</div>
                                                        <div style={{color:'#666', fontSize:'12px'}}>Bella+Canvas 3001</div>
                                                        <div style={{color:'#666', fontSize:'11px', marginTop:'2px'}}>Fulfilled by Cre8tify Choice</div>
                                                    </div>
                                                </div>
                                                <div style={{borderTop:'1px solid #eee', padding:'12px 0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                                    <span>Base T-shirt cost:</span>
                                                    <span style={{fontWeight:'600'}}>{designPrice}</span>
                                                </div>
                                                <div style={{backgroundColor:'#f5f9ff', padding:'15px', borderRadius:'6px', marginTop:'10px', border:'1px solid #e1eaf7'}}>
                                                    <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#0d375b', fontWeight:'700', marginBottom:'10px', fontSize:'13px'}}>
                                                        ℹ Product and design guidelines
                                                    </div>
                                                    <div style={{lineHeight:'1.5', color:'#666', fontSize:'12px'}}>
                                                        Using DTG technique, pigmented water-based inks are applied to the garment's surface and are absorbed by the product's fibers.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                                    {renderTShirtWorkspace()}

                                    <div style={{ marginTop: '20px', zIndex: 100 }}>
                                        <div style={{ padding: '10px 28px', borderRadius: '30px', backgroundColor: '#082749', color: 'white', fontSize: '14px', fontWeight: '700' }}>
                                            Front Side Only
                                        </div>
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
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                        {renderTShirtWorkspace()}
                    </div>
                    
                    <div style={{ width: '450px', backgroundColor: 'white', borderLeft: '1px solid #eee', padding: '30px', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Mockup view</h3>
                            <div className="mode-toggle" style={{ display: 'flex', backgroundColor: '#f0f0f0', borderRadius: '30px', padding: '4px', border: '1px solid #ddd' }}>
                                <button onClick={() => setViewMode('edit')} style={{ padding: '8px 24px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: '600', color: '#666', background: 'transparent' }}>Edit</button>
                                <button onClick={() => setViewMode('preview')} style={{ padding: '8px 24px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: '#0d375b', color: 'white' }}>Preview</button>
                            </div>
                        </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            {Object.entries(MOCKUP_CONFIG).map(([key, config]: any) => {
                                // Use the same mask logic from your main workspace
                                const maskSrc = config.mask || config.img;
                                
                                return (
                                    <div key={key} onClick={() => setCurrentSide(key)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                                        <div style={{ 
                                            border: currentSide === key ? '2px solid #0d375b' : '1px solid #ddd', 
                                            borderRadius: '8px', 
                                            padding: '10px', 
                                            height: '180px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            backgroundColor: '#f9f9f9', // Box background
                                            overflow: 'hidden', 
                                            position: 'relative',
                                            isolation: 'isolate' // Keeps blend modes contained
                                        }}>
                                            
                                            {/* 1. Base Mockup Image (The White Shirt) */}
                                            <img 
                                                src={config.img} 
                                                alt={config.label} 
                                                style={{ 
                                                    width: '100%', 
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
                                        <p style={{ marginTop: '8px', fontWeight: 500 }}>{config.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <h4 style={{ fontSize: '16px', marginBottom: '15px', color: '#666' }}>T-shirt color</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {VARIANT_COLORS.map((color: any) => (
                                    <button key={color.hex} onClick={() => setSelectedTshirtColor(color.hex)} style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: color.hex, border: selectedTshirtColor === color.hex ? '2px solid #0d375b' : '1px solid #ddd', cursor: 'pointer' }} />
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

            {/* 🟢 PINNED BOTTOM BAR (FOR EDIT MODE) */}
                        <div 
                            className="bottom-pinned-wrapper" 
                            style={{ 
                                flexShrink: 0, 
                                zIndex: 1300, 
                                backgroundColor: 'white', 
                                borderTop: '1px solid #eee',
                                display: viewMode === 'edit' ? 'block' : 'none' 
                            }}
                        >
                            <div className="finish-button-container" style={{ padding: '15px 40px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="finish-btn" onClick={handleSaveProduct} disabled={isSaving} style={{ backgroundColor: '#0d375b', color: 'white', padding: '12px 40px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                                    {isSaving ? "Saving..." : "Submit Product"}
                                </button>
                            </div>
                            
                            <Footer />
                        </div>

                        {/* 🟢 CROP MODAL (MUST BE INSIDE THE DASHBOARD CONTAINER) */}
                        {showCropModal && cropImageSrc && (
                            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', maxWidth: '90vw' }}>
                                    <h3 style={{ marginBottom: '15px' }}>Adjust Crop</h3>
                                    <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)} aspect={cropAspect}>
                                        <img src={cropImageSrc || ''} style={{ maxHeight: '60vh' }} />
                                    </ReactCrop>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setShowCropModal(false)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>Cancel</button>
                                        <button onClick={handleSaveCrop} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#0d375b', color: 'white', border: 'none', cursor: 'pointer' }}>Apply Crop</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>
                    </div> // This closes main-content (or dashboard-container depending on your start)
                ); // This closes the return (
            } // This closes the export default function