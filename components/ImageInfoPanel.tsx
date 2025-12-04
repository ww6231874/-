
import React from 'react';
import { ImageMetadata, AppTheme } from '../types';
import { Info, Maximize, Palette, FileDigit, HardDrive } from 'lucide-react';

interface ImageInfoPanelProps {
  metadata: ImageMetadata | null;
  theme: AppTheme;
  t: any;
}

export const ImageInfoPanel: React.FC<ImageInfoPanelProps> = ({ metadata, theme, t }) => {
  if (!metadata) return null;

  const glassClass = theme === 'dark'
    ? 'bg-gray-900/90 border-gray-700 text-gray-300'
    : 'bg-white/10 backdrop-blur-md border-white/20 text-white';

  return (
    <div className={`absolute right-6 top-6 w-64 rounded-xl border p-4 shadow-xl z-30 transition-all duration-300 ${glassClass}`}>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
        <Info className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-bold uppercase tracking-wider">{t.infoPanel.title}</span>
      </div>

      <div className="space-y-4">
        {/* Dimensions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs opacity-70">
            <Maximize className="w-3 h-3" />
            <span>{t.infoPanel.resolution}</span>
          </div>
          <span className="text-xs font-mono font-medium">{metadata.width} x {metadata.height}</span>
        </div>

        {/* Size */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs opacity-70">
            <HardDrive className="w-3 h-3" />
            <span>{t.infoPanel.size}</span>
          </div>
          <span className="text-xs font-mono font-medium">{metadata.size}</span>
        </div>

        {/* Format */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs opacity-70">
            <FileDigit className="w-3 h-3" />
            <span>{t.infoPanel.format}</span>
          </div>
          <span className="text-xs font-mono font-medium text-yellow-400">{metadata.format}</span>
        </div>

        {/* Palette */}
        <div>
          <div className="flex items-center gap-2 text-xs opacity-70 mb-2">
            <Palette className="w-3 h-3" />
            <span>{t.infoPanel.palette}</span>
          </div>
          <div className="flex gap-1 h-6 w-full rounded-md overflow-hidden ring-1 ring-white/10">
            {metadata.palette.map((color, i) => (
              <div 
                key={i} 
                className="flex-1 hover:flex-[2] transition-all duration-300 relative group cursor-pointer"
                style={{ backgroundColor: color }}
                title={color}
              >
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1 py-0.5 bg-black text-[9px] text-white rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
                      {color}
                  </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
