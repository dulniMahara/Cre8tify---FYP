import React, { CSSProperties } from 'react';

interface CurvedTextProps {
  text: string;
  styleId?: string;
  curveType?: string;
  fontFamily: string;
  color: string;
}

export default function CurvedText({ text, styleId, curveType, fontFamily, color }: CurvedTextProps) {
  
  const activeStyle = styleId || 'default';
  const safeFont = fontFamily || 'Arial';

  // --- COLORS FOR WAVE STYLE ---
  // These match the reference image
  const waveMainColor = "#42d1e4"; // Cyan/Light Blue
  const waveShadowColor = "#0a6c8a"; // Darker Blue Shadow

  // --- DEFINE PATHS ---
  const paths = {
    // A deeper, more pronounced wave to get the slanted effect
    wave: "M 10,120 Q 85,60 160,110 T 310,100", 
    circle: "M 150, 150 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0",
    arch: "M 20,150 Q 150,50 280,150"
  };

  const commonStyle: CSSProperties = {
    fontFamily: safeFont, 
    fontWeight: 'bold', 
    fontStyle: 'italic',
    textAnchor: "middle",
    dominantBaseline: "middle",
    whiteSpace: 'pre',
    userSelect: 'none',
    letterSpacing: '1px'
  };

  // --- RENDER STYLES ---

  // A. STACK (Dreamer Style)
  if (activeStyle === 'style-stack') {
    return (
      <svg viewBox="0 0 300 300" style={{ overflow: 'visible', width: '100%', height: '100%' }}>
        <text x="150" y="80" style={{ ...commonStyle, fill: color, opacity: 0.3, fontSize: '40px' }}>{text}</text>
        <text x="150" y="130" style={{ ...commonStyle, fill: color, opacity: 0.6, fontSize: '40px' }}>{text}</text>
        <text x="150" y="180" style={{ ...commonStyle, fill: color, opacity: 1, fontSize: '40px' }}>{text}</text>
      </svg>
    );
  }

  // B. WAVE (Blue 3D Wave Style)
  if (activeStyle === 'style-wave') {
    // Increase font size for impact
    const waveStyle = { ...commonStyle, fontSize: '55px' };
    
    const shadowEffect = "#000000";

    return (
      <svg viewBox="0 0 320 240" style={{ overflow: 'visible', width: '100%', height: '100%' }}>
        <defs><path id="path-wave" d={paths.wave} /></defs>
        
       {/* Layer 1: Bottom Shadow (Deepest) */}
        <g transform="translate(6, 6)">
            <text width="320" style={{ ...waveStyle, fill: shadowEffect, opacity: 0.2 }}>
              <textPath href="#path-wave" startOffset="50%">{text}</textPath>
            </text>
        </g>

        {/* Layer 2: Middle Layer (Matches your color, but shifted slightly for depth) */}
        <g transform="translate(3, 3)">
            <text width="320" style={{ ...waveStyle, fill: color, opacity: 0.8 }}>
              <textPath href="#path-wave" startOffset="50%">{text}</textPath>
            </text>
        </g>
        
        {/* Layer 3: Main Text Face (The top layer) */}
        <text width="320" style={{ ...waveStyle, fill: color, stroke: shadowEffect, strokeWidth: '0.5px' }}>
            <textPath href="#path-wave" startOffset="50%">{text}</textPath>
        </text>
      </svg>
    );
  }

  // C. CIRCLE (Full Circle)
  if (activeStyle === 'style-circle') {
     return (
      <svg viewBox="0 0 300 300" style={{ overflow: 'visible', width: '100%', height: '100%' }}>
        <defs><path id="path-circle" d={paths.circle} /></defs>
        <text width="300" style={{ ...commonStyle, fontSize: '30px', fill: color }}>
           <textPath href="#path-circle" startOffset="50%">{text}</textPath>
        </text>
      </svg>
    );
  }

  // D. FISH / NEVERMIND (Arch)
  if (activeStyle === 'style-fish') {
    return (
     <svg viewBox="0 0 300 200" style={{ overflow: 'visible', width: '100%', height: '100%' }}>
       <defs><path id="path-arch" d={paths.arch} /></defs>
       <text width="300" style={{ ...commonStyle, fontSize: '45px', fill: color }}>
          <textPath href="#path-arch" startOffset="50%">{text}</textPath>
       </text>
     </svg>
   );
 }

  // E. DEFAULT / OTHERS (Straight Text)
  return (
      <svg viewBox="0 0 300 150" style={{ overflow: 'visible', width: '100%', height: '100%' }}>
        <text x="150" y="80" style={{ ...commonStyle, fontSize: '45px', fill: color }}>
          {text}
        </text>
      </svg>
  );
}