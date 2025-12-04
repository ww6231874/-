
import React, { useState } from 'react';
import { AppTheme } from '../types';
import { Loader2, Scissors, Layers, Download, Brush, X, Undo, Redo } from 'lucide-react';

interface CutoutPanelProps {
  onAutoCutout: (description: string, useMask: boolean) => void;
  isProcessing: boolean;
  theme: AppTheme;
  t: any;
  downloadLayer: () => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  clearMask: () => void;
  onUndoBrush: () => void;
  onRedoBrush: () => void;
}

export const CutoutPanel: React.FC<CutoutPanelProps> = ({ 
  onAutoCutout, 
  isProcessing, 
  theme, 
  t, 
  downloadLayer,
  brushSize,
  setBrushSize,
  clearMask,
  onUndoBrush,
  onRedoBrush
}) => {
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  
  const isLight = theme === 'light';
  
  const cardClass = isLight
    ? 'bg-gray-50 border-gray-200'
    : 'bg-white/5 border-white/10';

  const inputClass = isLight
    ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'
    : 'bg-black/30 border-white/10 text-white placeholder-gray-400 focus:ring-blue-500';

  const tabClass = (active: boolean) => 
    `flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all 
    ${active 
        ? (isLight ? 'bg-black text-white shadow-md' : 'bg-white text-black shadow-md') 
        : (isLight ? 'text-gray-400 hover:bg-gray-100' : 'text-gray-500 hover:bg-white/10')}`;

  const actionBtnClass = `
    w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-all shadow-md
    ${isProcessing ? 'opacity-70 cursor-wait' : ''}
    ${isLight 
        ? 'bg-blue-600 text-white hover:bg-blue-700' 
        : 'bg-white text-black hover:bg-gray-200'
    }
  `;

  return (
    <div className="flex flex-col h-full space-y-6">
        <div>
            <h3 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{t.cutout?.title || "Intelligent Cutout"}</h3>
            <p className={`text-sm mt-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              {t.cutout?.desc || "Separate subject from background using AI."}
            </p>
        </div>

        {/* Mode Toggles */}
        <div className={`flex gap-1 p-1 rounded-xl ${isLight ? 'bg-gray-100' : 'bg-white/5 border border-white/10'}`}>
           <button onClick={() => setMode('auto')} className={tabClass(mode === 'auto')}>
              <Scissors className="w-3 h-3" /> {t.cutout?.autoRemove || "Smart"}
           </button>
           <button onClick={() => setMode('manual')} className={tabClass(mode === 'manual')}>
              <Brush className="w-3 h-3" /> {t.cutout?.manualSelect || "Manual"}
           </button>
        </div>

        {mode === 'auto' ? (
          // AUTO MODE
          <div className={`p-5 rounded-2xl border space-y-4 ${cardClass}`}>
              <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isLight ? 'bg-purple-100 text-purple-600' : 'bg-purple-500/20 text-purple-400'}`}>
                      <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                      <h4 className={`font-bold text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>{t.cutout?.autoRemove}</h4>
                      <p className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{t.cutout?.autoRemoveDesc}</p>
                  </div>
              </div>

              <div>
                  <label className={`text-xs uppercase font-bold tracking-widest mb-2 block ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t.cutout?.targetDesc || "Describe Subject"}
                  </label>
                  <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t.cutout?.targetPlaceholder || "e.g., The woman in the red dress"}
                      className={`w-full h-24 rounded-lg p-3 text-sm resize-none border ${inputClass}`}
                  />
              </div>

              <button
                  onClick={() => onAutoCutout(description, false)}
                  disabled={isProcessing}
                  className={actionBtnClass}
              >
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t.cutout?.startRemove || "Start Cutout"}
              </button>
          </div>
        ) : (
          // MANUAL MODE
          <div className={`p-5 rounded-2xl border space-y-4 ${cardClass}`}>
             <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isLight ? 'bg-purple-100 text-purple-600' : 'bg-purple-500/20 text-purple-400'}`}>
                      <Brush className="w-5 h-5" />
                  </div>
                  <div>
                      <h4 className={`font-bold text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>{t.cutout?.manualSelect}</h4>
                      <p className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{t.cutout?.manualSelectDesc}</p>
                  </div>
              </div>

              {/* Brush Controls */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className={`text-xs uppercase font-bold tracking-widest ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                        {t.common.brushSize}
                    </label>
                    <span className={`text-xs font-mono ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>{brushSize}px</span>
                </div>
                <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`}
                />
                <div className="flex items-center gap-2">
                     <button 
                        onClick={onUndoBrush}
                        className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-200 text-gray-600' : 'hover:bg-white/20 text-gray-300'}`}
                        title="Undo"
                     >
                         <Undo className="w-4 h-4" />
                     </button>
                     <button 
                        onClick={onRedoBrush}
                        className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-200 text-gray-600' : 'hover:bg-white/20 text-gray-300'}`}
                        title="Redo"
                     >
                         <Redo className="w-4 h-4" />
                     </button>
                     <div className="flex-1" />
                     <button 
                        onClick={clearMask}
                        className="text-xs font-bold flex items-center gap-1.5 text-red-500 hover:text-red-600 transition-colors py-1.5 px-3 rounded-lg hover:bg-red-500/10"
                    >
                        <X className="w-3 h-3" /> {t.common.clearSelection}
                    </button>
                </div>
              </div>

              <button
                  onClick={() => onAutoCutout("", true)} 
                  disabled={isProcessing}
                  className={actionBtnClass}
              >
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t.cutout?.paintMode || "Cutout Area"}
              </button>
          </div>
        )}

        {/* Layer Export */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${cardClass}`}>
            <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}>
                    <Layers className="w-4 h-4" />
                </div>
                <span className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{t.cutout?.exportPng}</span>
            </div>
            
            <button
                onClick={downloadLayer}
                className={`p-2 rounded-lg transition-colors ${isLight ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
                <Download className="w-4 h-4" />
            </button>
        </div>
    </div>
  );
};