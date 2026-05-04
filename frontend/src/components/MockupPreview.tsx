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

const MockupPreview: React.FC<MockupPreviewProps> = ({
    mockupSrc,
    maskSrc,
    tshirtColor,
    printArea,
    designSrc,
    overallScale = 1.0,
    designScale = 1.0,
    canvasState
}) => {
    // Combine and sort layers by zIndex
    const allLayers = [
        ...(canvasState?.imageLayers?.map((l: any) => ({ ...l, layerType: 'image' })) || []),
        ...(canvasState?.textLayers?.map((t: any) => ({ ...t, layerType: 'text' })) || [])
    ].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    const hasLayers = allLayers.length > 0;

    // Apply the designScale to the printArea dimensions
    const finalPrintArea = printArea ? {
        ...printArea,
        width: `calc(${printArea.width} * ${designScale})`,
        height: `calc(${printArea.height} * ${designScale})`
    } : { top: '50%', left: '50%', width: '100%', height: '100%', rotation: 0 };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{
                width: '100%',
                height: '100%',
                transform: `scale(${overallScale})`,
                transformOrigin: 'center center',
                position: 'relative'
            }}>
                {/* 1. Base Mockup Image */}
                <img
                    src={mockupSrc}
                    alt="Mockup"
                    style={{
                        width: '100%', height: '100%', objectFit: 'contain',
                        position: 'absolute', inset: 0, zIndex: 1
                    }}
                />

                {/* 2. Color Layer */}
                {tshirtColor && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: tshirtColor,
                        WebkitMaskImage: `url(${maskSrc || mockupSrc})`,
                        maskImage: `url(${maskSrc || mockupSrc})`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskPosition: 'center',
                        WebkitMaskRepeat: 'no-repeat',
                        zIndex: 2,
                        mixBlendMode: 'multiply',
                        pointerEvents: 'none'
                    }} />
                )}

                {/* 3. Design Layer */}
                {(hasLayers || designSrc) && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        WebkitMaskImage: `url(${maskSrc || mockupSrc})`,
                        maskImage: `url(${maskSrc || mockupSrc})`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskPosition: 'center',
                        WebkitMaskRepeat: 'no-repeat',
                        zIndex: 3,
                        pointerEvents: 'none'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: finalPrintArea.top,
                            left: finalPrintArea.left,
                            width: finalPrintArea.width,
                            height: finalPrintArea.height,
                            transform: `translate(-50%, -50%) rotate(${finalPrintArea.rotation || 0}deg)`,
                            transformOrigin: 'center center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {designSrc ? (
                                <img
                                    src={designSrc.startsWith('/uploads') ? `http://localhost:5000${designSrc}` : designSrc}
                                    alt="Design"
                                    style={{
                                        width: '100%', height: '100%', objectFit: 'contain',
                                        mixBlendMode: (tshirtColor && tshirtColor.toLowerCase() !== '#ffffff') ? 'multiply' : 'normal'
                                    }}
                                />
                            ) : (
                                <div style={{ position: 'relative', width: '100%', height: '100%', isolation: 'isolate' }}>
                                    {allLayers.map((layer: any) => (
                                        layer.layerType === 'image' ? (
                                            <img
                                                key={layer.id}
                                                src={layer.src.startsWith('/uploads') ? `http://localhost:5000${layer.src}` : layer.src}
                                                style={{
                                                    position: 'absolute',
                                                    zIndex: layer.zIndex,
                                                    transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale}) rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
                                                    mixBlendMode: (tshirtColor && tshirtColor.toLowerCase() !== '#ffffff') ? 'multiply' : 'normal',
                                                    opacity: 0.95,
                                                    width: 'auto',
                                                    height: 'auto'
                                                }}
                                                alt=""
                                            />
                                        ) : (
                                            <div
                                                key={layer.id}
                                                style={{
                                                    position: 'absolute',
                                                    zIndex: layer.zIndex,
                                                    transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center'
                                                }}
                                            >
                                                {layer.styleId === 'default' && (
                                                    <>
                                                        {(layer.curve !== 0 && layer.curve !== undefined) ? (
                                                            <CurvedText
                                                                id={layer.id}
                                                                text={layer.text}
                                                                fontFamily={layer.font}
                                                                color={layer.color}
                                                                curve={layer.curve ?? 0}
                                                                letterSpacing={layer.letterSpacing || 0}
                                                            />
                                                        ) : (
                                                            <div style={{
                                                                fontFamily: layer.font,
                                                                color: layer.color,
                                                                fontSize: '24px',
                                                                fontWeight: 'bold',
                                                                whiteSpace: 'nowrap',
                                                                letterSpacing: `${layer.letterSpacing || 0}px`
                                                            }}>
                                                                {layer.text}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {layer.styleId === 'style-wave' && (
                                                    <div style={{
                                                        fontFamily: layer.font, color: '#00d2ff', fontSize: '28px', fontWeight: '900',
                                                        textTransform: 'uppercase', textShadow: '2px 2px 0px #0d375b',
                                                        transform: 'skewX(-10deg)', fontStyle: 'italic',
                                                        letterSpacing: `${layer.letterSpacing || 0}px`
                                                    }}>
                                                        {layer.text}
                                                    </div>
                                                )}
                                                {layer.styleId === 'style-stack' && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '0.9', alignItems: 'center', letterSpacing: `${layer.letterSpacing || 0}px` }}>
                                                        {[1, 2, 3].map((i) => (
                                                            <span key={i} style={{ fontFamily: layer.font, color: i === 2 ? layer.color : 'transparent', WebkitTextStroke: i === 2 ? 'none' : `1px ${layer.color}`, fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>{layer.text}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {layer.styleId === 'style-fish' && (
                                                    <div style={{ fontFamily: layer.font, color: layer.color, fontSize: '26px', fontWeight: 'bold', transform: 'scaleY(1.4) scaleX(0.9)', letterSpacing: `${(layer.letterSpacing || 0) - 1}px` }}>
                                                        {layer.text}
                                                    </div>
                                                )}
                                                {!['default', 'style-wave', 'style-stack', 'style-fish'].includes(layer.styleId || '') && (
                                                    <CurvedText
                                                        id={layer.id} text={layer.text} styleId={layer.styleId} fontFamily={layer.font} color={layer.color}
                                                        curve={layer.styleId === 'style-circle' ? (layer.curve ?? 120) : (layer.curve ?? 0)}
                                                        letterSpacing={layer.letterSpacing || 0}
                                                    />
                                                )}
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockupPreview;
