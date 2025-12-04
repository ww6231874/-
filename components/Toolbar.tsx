
import React from 'react';
import { Undo, Redo, ZoomIn, ZoomOut, SplitSquareHorizontal, RefreshCw } from 'lucide-react';
import { AppTheme } from '../types';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  scale: number;
  setScale: (s: number) => void;
  isComparing: boolean;
  toggleCompare: () => void;
  onReset: () => void;
  theme: AppTheme;
  t: any;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  scale,
  setScale,
  isComparing,
  toggleCompare,
  onReset,
  theme,
  t
}) => {
  
  const containerClass = theme === 'dark' 
    ? 'bg-gray-800/90 border-gray-700' 
    : 'bg-black/40 backdrop-blur-lg border-white/10';

  const btnClass = (disabled: boolean = false, active: boolean = false) => `
    p-2 rounded-lg transition-all duration-200
    ${disabled 
      ? 'opacity-30 cursor-not-allowed text-gray-500' 
      : active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
        : 'hover:bg-white/10 text-gray-200 hover:text-white'
    }
  `;

  return (
    <div className={`absolute top-6 left-1/2 -translate-x-1/2 h-12 px-4 rounded-xl border shadow-2xl flex items-center gap-2 z-30 ${containerClass}`}>
      
      {/* History */}
      <div className="flex items-center gap-1 pr-2 border-r border-white/10">
        <button onClick={onUndo} disabled={!canUndo} className={btnClass(!canUndo)} title="Undo">
          <Undo className="w-4 h-4" />
        </button>
        <button onClick={onRedo} disabled={!canRedo} className={btnClass(!canRedo)} title="Redo">
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Compare & Reset */}
      <div className="flex items-center gap-1 px-2 border-r border-white/10">
        <button 
            onClick={toggleCompare} 
            className={btnClass(false, isComparing)}
            title={t.common.compare}
        >
          <SplitSquareHorizontal className="w-4 h-4" />
          <span className="ml-2 text-xs font-medium hidden md:inline">{t.common.compare}</span>
        </button>
         <button onClick={onReset} className={btnClass()} title={t.reset}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-2 pl-2">
        <button onClick={() => setScale(Math.max(0.1, scale - 0.1))} className={btnClass()}>
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono w-12 text-center text-gray-300">
          {Math.round(scale * 100)}%
        </span>
        <button onClick={() => setScale(Math.min(3, scale + 0.1))} className={btnClass()}>
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
