import React, { useState } from 'react';

// 1. Define your 5 specific views here
const mockupViews = [
  { id: 'front', name: 'Front', src: '/img/mockups/girl_front.png', hasDesignArea: true },
  { id: 'back', name: 'Back', src: '/img/mockups/girl_back.png', hasDesignArea: true },
  { id: 'collar', name: 'Collar Detail', src: '/img/mockups/collar.png', hasDesignArea: false },
  { id: 'folded', name: 'Folded', src: '/img/mockups/folded.png', hasDesignArea: false }, // Usually hard to warp design onto folded without advanced code
  { id: 'hanging', name: 'Hanging', src: '/img/mockups/hanging.png', hasDesignArea: true },
];

const ProductMockupViewer = () => {
  const [activeView, setActiveView] = useState(mockupViews[0]);
  const [mode, setMode] = useState('preview'); // 'edit' or 'preview'

  // This represents the user's uploaded design (Logo/Art)
  // In a real app, this URL comes from the user's upload
  const userDesignUrl = "https://via.placeholder.com/150/000000/FFFFFF/?text=MY+DESIGN"; 

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      
      {/* Container */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex gap-8 max-w-6xl w-full">
        
        {/* LEFT SIDE: The Main Stage */}
        <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden min-h-[600px]">
          
          {/* The Mockup Image */}
          <div className="relative w-[500px] h-[600px] flex items-center justify-center">
            <img 
              src={activeView.src} 
              alt={activeView.name}
              className="w-full h-full object-contain z-10 relative pointer-events-none"
            />

            {/* THE DESIGN OVERLAY (The Magic Part) */}
            {/* We only show the design if this view supports it (hasDesignArea: true) */}
            {activeView.hasDesignArea && (
              <div 
                className="absolute top-[30%] left-[25%] w-[50%] h-[40%] z-20 flex items-center justify-center border-2 border-dashed border-transparent hover:border-blue-400 group"
                style={{ mixBlendMode: 'multiply' }} // This makes the logo blend into shirt texture
              >
                <img 
                  src={userDesignUrl} 
                  alt="User Design" 
                  className="w-full h-full object-contain"
                />
                {/* Visual cue for editing */}
                {mode === 'edit' && (
                  <span className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Drag to move
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Controls & Thumbnails */}
        <div className="w-80 flex flex-col">
          
          {/* Header Controls */}
          <div className="mb-6 flex space-x-2">
            <button 
              onClick={() => setMode('edit')}
              className={`flex-1 py-2 rounded-md font-medium text-sm transition-colors ${mode === 'edit' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Edit
            </button>
            <button 
              onClick={() => setMode('preview')}
              className={`flex-1 py-2 rounded-md font-medium text-sm transition-colors ${mode === 'preview' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Preview
            </button>
          </div>

          <h3 className="font-bold text-gray-800 mb-4">Mockup view</h3>

          {/* Grid of 5 Thumbnails */}
          <div className="grid grid-cols-2 gap-4">
            {mockupViews.map((view) => (
              <button 
                key={view.id}
                onClick={() => setActiveView(view)}
                className={`
                  relative rounded-lg border-2 p-1 transition-all overflow-hidden aspect-square
                  ${activeView.id === view.id ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200 hover:border-gray-400'}
                `}
              >
                <img src={view.src} alt={view.name} className="w-full h-full object-contain" />
                <span className="absolute bottom-0 left-0 w-full bg-white/90 text-[10px] font-bold py-1 text-center">
                  {view.name}
                </span>
              </button>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>Dev Note:</strong> The "Folded" and "Collar" views are set to NOT show the design overlay in this code, because warping a logo onto folds requires advanced 3D logic.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductMockupViewer;