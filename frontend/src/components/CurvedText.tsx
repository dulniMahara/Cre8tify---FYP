import React, { CSSProperties } from 'react';

interface CurvedTextProps {
  id?: number | string;
  text: string;
  styleId?: string;
  fontFamily: string;
  color: string;
  curve?: number;
  letterSpacing?: number;
}

export default function CurvedText({ id, text, styleId, fontFamily, color, curve = 0, letterSpacing = 0 }: CurvedTextProps) {
  const activeStyle = styleId || 'default';
  const safeFont = fontFamily || 'Arial';
  const pathId = `path-component-${id || 'static'}`;

  const commonStyle: CSSProperties = {
    fontFamily: safeFont,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAnchor: "middle",
    dominantBaseline: "middle",
    whiteSpace: 'pre',
    userSelect: 'none'
  };

  // --- RENDERING LOGIC ---

  // 1. STACK (Dreamer Style)
  if (activeStyle === 'style-stack') {
    return (
      <svg viewBox="0 0 300 300" style={{ overflow: 'visible', width: '100%', height: '100%' }}>
        <text x="150" y="80" style={{ ...commonStyle, fill: color, opacity: 0.3, fontSize: '40px' }}>{text}</text>
        <text x="150" y="130" style={{ ...commonStyle, fill: color, opacity: 0.6, fontSize: '40px' }}>{text}</text>
        <text x="150" y="180" style={{ ...commonStyle, fill: color, opacity: 1, fontSize: '40px' }}>{text}</text>
      </svg>
    );
  }

  // 2. WAVE (Blue 3D Wave Style)
  if (activeStyle === 'style-wave') {
    const wavePath = "M 10,120 Q 85,60 160,110 T 310,100";
    return (
      <svg viewBox="0 0 320 240" style={{ overflow: 'visible', width: '100%', height: '100%' }}>
        <defs><path id={`${pathId}-wave`} d={wavePath} /></defs>
        <text width="320" style={{ ...commonStyle, fontSize: '50px', fill: color }}>
          <textPath href={`#${pathId}-wave`} startOffset="50%">{text}</textPath>
        </text>
      </svg>
    );
  }

  // 3. CIRCLE or DYNAMIC ARC
  if (activeStyle === 'style-circle' || (activeStyle === 'default' && curve !== 0)) {
    const isFullCircle = activeStyle === 'style-circle';
    const cx = 250; const cy = 250; const r = 160;
    
    let pathData = "";
    if (isFullCircle) {
      pathData = `M ${cx - r}, ${cy} a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`;
    } else {
      const intensity = curve * 2.5;
      pathData = `M 50,250 Q 250,${250 - intensity} 450,250`;
    }

    return (
      <svg viewBox="0 0 500 500" style={{ overflow: 'visible', width: '100%', height: '100%' }}>
        <defs><path id={`${pathId}-arc`} d={pathData} fill="none" /></defs>
        <text fill={color} style={{ ...commonStyle, fontSize: isFullCircle ? '32px' : '40px', letterSpacing: `${letterSpacing}px` }}>
          <textPath xlinkHref={`#${pathId}-arc`} startOffset="50%">{text}</textPath>
        </text>
      </svg>
    );
  }

  // 4. FISH / NEVERMIND (Arch)
  if (activeStyle === 'style-fish') {
    const archPath = "M 20,150 Q 150,50 280,150";
    return (
      <svg viewBox="0 0 300 200" style={{ overflow: 'visible', width: '100%', height: '100%' }}>
        <defs><path id={`${pathId}-arch`} d={archPath} /></defs>
        <text style={{ ...commonStyle, fontSize: '45px', fill: color }}>
          <textPath href={`#${pathId}-arch`} startOffset="50%">{text}</textPath>
        </text>
      </svg>
    );
  }

  // 5. DEFAULT (Straight)
  return (
    <svg viewBox="0 0 300 150" style={{ overflow: 'visible', width: '100%', height: '100%' }}>
      <text x="150" y="75" style={{ ...commonStyle, fontSize: '45px', fill: color, letterSpacing: `${letterSpacing}px` }}>
        {text}
      </text>
    </svg>
  );
}