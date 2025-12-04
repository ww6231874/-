
import React, { useState, useRef, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface ComparisonViewProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
  t: any;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ beforeImage, afterImage, className, t }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  return (
    <div 
        ref={containerRef}
        className={`relative w-full h-full select-none overflow-hidden cursor-ew-resize group ${className}`}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
    >
        {/* After Image (Background) */}
        <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />

        {/* Before Image (Clipped) */}
        <div 
            className="absolute inset-0 overflow-hidden pointer-events-none border-r-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            style={{ width: `${sliderPosition}%` }}
        >
            <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-contain max-w-none" style={{ width: containerRef.current?.clientWidth }} />
            
            {/* Label */}
            <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
                {t.common.original}
            </div>
        </div>
        
        {/* After Label */}
        <div className="absolute top-4 right-4 bg-blue-600/80 text-white text-xs px-2 py-1 rounded backdrop-blur pointer-events-none">
            {t.common.result}
        </div>

        {/* Handle */}
        <div 
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-lg transform -translate-x-1/2"
            style={{ left: `${sliderPosition}%` }}
        >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl text-gray-900 scale-90 group-hover:scale-110 transition-transform">
                <ChevronsLeftRight className="w-4 h-4" />
            </div>
        </div>
    </div>
  );
};
