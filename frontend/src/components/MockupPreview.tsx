import React from 'react';

// --- INTERFACES ---
export interface TextConfig {
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

export interface ImageLayer {
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

export type PrintArea = { top: string; left: string; width: string; height: string; rotation?: number };

export interface MockupPreviewProps {
    mockupSrc: string;
    maskSrc: string;
    tshirtColor: string;
    printArea?: PrintArea;
    designSrc?: string;
    overallScale?: number;
    designScale?: number;
    canvasState?: {
        imageLayers: ImageLayer[];
        textLayers: TextConfig[];
    };
}

const CurvedText = ({ text, fontFamily, color, curve, letterSpacing, id, styleId }: {
    text: string,
    fontFamily: string,
    color: string,
    curve: number,
    letterSpacing: number,
    id: number,
    styleId?: string
}) => {
    const pathId = `path-shared-${id}`;
    const isFullCircle = styleId === 'style-circle';
    const cx = 250;
    const cy = 250;
    const r = 160;

    let pathData = "";
    if (isFullCircle) {
        pathData = `
            M ${cx - r}, ${cy}
            a ${r},${r} 0 1,1 ${r * 2},0
            a ${r},${r} 0 1,1 -${r * 2},0
        `;
    } else {
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
                <path id={pathId} d={pathData} fill="none" />
            </defs>
            <text
                fill={color}
                style={{
                    fontFamily: fontFamily,
                    fontSize: isFullCircle ? '32px' : '40px',
                    fontWeight: 'bold',
                    letterSpacing: `${letterSpacing}px`,
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

const MockupPreview: React.FC<MockupPreviewProps & { isPopup?: boolean }> = ({
    mockupSrc,
    maskSrc,
    tshirtColor,
    canvasState,
    designSrc,
    printArea,
    overallScale = 1.0,
    isPopup = false
}) => {
    const imageLayers = canvasState?.imageLayers || [];
    const textLayers = canvasState?.textLayers || [];

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
                width: '100%',
                aspectRatio: '550 / 800',
                transform: `scale(${overallScale})`,
                transformOrigin: 'center center',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* 1. Shirt Base */}
                <img src={mockupSrc} alt="Shirt" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', top: 0, left: 0, zIndex: 1 }} />

                {/* 2. Color Overlay */}
                {tshirtColor && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: tshirtColor,
                        display: tshirtColor.toLowerCase() === '#ffffff' ? 'none' : 'block',
                        mixBlendMode: 'multiply',
                        WebkitMaskImage: `url(${maskSrc || mockupSrc})`, maskImage: `url(${maskSrc || mockupSrc})`,
                        WebkitMaskSize: 'contain', WebkitMaskPosition: 'center', WebkitMaskRepeat: 'no-repeat', zIndex: 2
                    }}></div>
                )}

                {/* 3. Design Layers (Direct Rendering with Hardcoded Overrides) */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
                    WebkitMaskImage: `url(${maskSrc || mockupSrc})`, maskImage: `url(${maskSrc || mockupSrc})`,
                    WebkitMaskSize: 'contain', WebkitMaskPosition: 'center', WebkitMaskRepeat: 'no-repeat',
                }}>
                    {/* Render single designSrc if provided (fallback/legacy support) */}
                    {designSrc && !imageLayers.length && (
                        <img
                            src={designSrc.startsWith('/uploads') ? `http://localhost:5000${designSrc}` : designSrc}
                            alt="Design"
                            style={{
                                position: 'absolute',
                                zIndex: 5,
                                ...(printArea || { top: '45%', left: '50%', width: '35%', height: '45%' }),
                                transform: 'translate(-50%, -50%)',
                                objectFit: 'contain',
                                mixBlendMode: (tshirtColor && tshirtColor.toLowerCase() !== '#ffffff') ? 'multiply' : 'normal',
                                opacity: 0.95
                            }}
                        />
                    )}

                    {/* Render Image Layers */}
                    {imageLayers.map((layer: any) => (
                        <img key={layer.id} src={layer.src.startsWith('/uploads') ? `http://localhost:5000${layer.src}` : layer.src} alt="Design Layer" style={{
                            position: 'absolute',
                            zIndex: layer.zIndex,
                            transform: isPopup
                                ? `translate(-121px, -125px) scale(0.12)`
                                : `translate(-171px, -197px) scale(0.078) rotate(0deg) scaleX(1)`,
                            mixBlendMode: (tshirtColor && tshirtColor.toLowerCase() !== '#ffffff') ? 'multiply' : 'normal',
                            opacity: 0.95, width: 'auto', height: 'auto', maxWidth: 'none'
                        }} />
                    ))}

                    {/* Render Text Layers */}
                    {textLayers.map((t: any) => (
                        <div key={t.id} style={{
                            position: 'absolute', zIndex: t.zIndex,
                            transform: isPopup
                                ? `translate(73px, 187px) scale(0.32)`
                                : `translate(23px, 108px) scale(0.2)`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px'
                        }}>
                            {t.styleId === 'default' ? (
                                (t.curve !== 0 && t.curve !== undefined) ? (
                                    <CurvedText id={t.id} text={t.text} fontFamily={t.font} color={t.color} curve={t.curve ?? 0} letterSpacing={t.letterSpacing || 0} />
                                ) : (
                                    <div style={{ fontFamily: t.font, color: t.color, fontSize: '24px', fontWeight: 'bold', whiteSpace: 'nowrap', letterSpacing: `${t.letterSpacing || 0}px` }}>{t.text}</div>
                                )
                            ) : (
                                <>
                                    {t.styleId === 'style-wave' && (
                                        <div style={{ fontFamily: t.font, color: '#00d2ff', fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', textShadow: '2px 2px 0px #0d375b', transform: 'skewX(-10deg)', fontStyle: 'italic', letterSpacing: `${t.letterSpacing || 0}px` }}>{t.text}</div>
                                    )}
                                    {t.styleId === 'style-stack' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '0.9', alignItems: 'center', letterSpacing: `${t.letterSpacing || 0}px` }}>
                                            {[1, 2, 3].map((i: any) => (
                                                <span key={i} style={{ fontFamily: t.font, color: i === 2 ? t.color : 'transparent', WebkitTextStroke: i === 2 ? 'none' : `1px ${t.color}`, fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>{t.text}</span>
                                            ))}
                                        </div>
                                    )}
                                    {t.styleId === 'style-fish' && (
                                        <div style={{ fontFamily: t.font, color: t.color, fontSize: '26px', fontWeight: 'bold', transform: 'scaleY(1.4) scaleX(0.9)', letterSpacing: `${(t.letterSpacing || 0) - 1}px` }}>{t.text}</div>
                                    )}
                                    {!['style-wave', 'style-stack', 'style-fish'].includes(t.styleId || '') && (
                                        <CurvedText id={t.id} text={t.text} styleId={t.styleId} fontFamily={t.font} color={t.color} curve={t.styleId === 'style-circle' ? (t.curve ?? 120) : (t.curve ?? 0)} letterSpacing={t.letterSpacing || 0} />
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MockupPreview;
