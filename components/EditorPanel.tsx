
import React, { useState, useEffect } from 'react';
import { EditorTool, AppTheme, OutpaintSettings } from '../types';
import { Loader2, AlertCircle, Eraser, Brush, Check, X, Shield, ShieldAlert, Crop, Ratio, Undo, Redo, Sparkles, Wand2, Expand } from 'lucide-react';
import { ColorPanel } from './ColorPanel';
import { CutoutPanel } from './CutoutPanel';

interface EditorPanelProps {
  tool: EditorTool;
  onApply: (params: any) => void;
  isProcessing: boolean;
  theme: AppTheme;
  t: any;
  brushSize: number;
  setBrushSize: (s: number) => void;
  clearMask: () => void;
  onUndoBrush: () => void;
  onRedoBrush: () => void;
  originalDimensions: { width: number; height: number };
  onApplyFilter: (filter: string, intensity: number) => void;
  downloadLayer: () => void;
  onSetCropRatio: (ratio: number | null) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
  tool, 
  onApply, 
  isProcessing, 
  theme, 
  t,
  brushSize,
  setBrushSize,
  clearMask,
  onUndoBrush,
  onRedoBrush,
  originalDimensions,
  onApplyFilter,
  downloadLayer,
  onSetCropRatio
}) => {
  const [prompt, setPrompt] = useState('');
  const [strictMode, setStrictMode] = useState(true);

  const [outpaintSettings, setOutpaintSettings] = useState<OutpaintSettings>({
      width: 1024,
      height: 1024,
      keepBackground: true
  });

  useEffect(() => {
    if (originalDimensions.width > 0 && tool === EditorTool.OUTPAINT) {
        setOutpaintSettings(prev => ({
            ...prev,
            width: Math.floor(originalDimensions.width * 1.5),
            height: Math.floor(originalDimensions.height * 1.5)
        }));
    }
  }, [originalDimensions.width, originalDimensions.height, tool]);

  const isLight = theme === 'light';

  // Styles
  const containerClass = isLight
    ? 'bg-white border-l border-gray-100 shadow-2xl'
    : 'bg-[#0f1115] border-l border-white/5';

  const textPrimary = isLight ? 'text-gray-900' : 'text-white';
  const textSecondary = isLight ? 'text-gray-500' : 'text-gray-400';
  
  const cardClass = isLight
    ? 'bg-gray-50 border-gray-200 hover:border-gray-300'
    : 'bg-white/5 border-white/10 hover:border-white/20';
    
  const inputClass = isLight
    ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-black'
    : 'bg-black/30 border-white/10 text-white placeholder-gray-500 focus:ring-white';

  const actionBtnClass = `
    w-full py-4 rounded-xl font-bold tracking-wide flex justify-center items-center gap-2 transition-all shadow-xl hover:scale-[1.02]
    ${isProcessing ? 'opacity-70 cursor-wait' : ''}
    ${isLight 
        ? 'bg-black text-white hover:bg-gray-800' 
        : 'bg-white text-black hover:bg-gray-200'
    }
  `;

  const renderBrushControls = () => (
      <div className={`space-y-4 p-5 rounded-2xl border ${cardClass} mb-6`}>
          <div className="flex justify-between items-center">
              <label className={`text-[10px] uppercase font-bold tracking-widest ${textSecondary}`}>{t.common.brushSize}</label>
              <span className={`text-xs font-mono font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>{brushSize}px</span>
          </div>
          <input 
              type="range" 
              min="10" 
              max="100" 
              value={brushSize} 
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`}
          />
          <div className="flex items-center gap-2 pt-2">
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
                  className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-red-500 hover:text-red-600 transition-colors py-1.5 px-3 rounded-lg hover:bg-red-500/10"
              >
                  <X className="w-3 h-3" /> {t.common.clearSelection}
              </button>
          </div>
      </div>
  );

  const renderContent = () => {
    switch (tool) {
      case EditorTool.COLOR:
        return (
            <ColorPanel 
                onApplyFilter={onApplyFilter} 
                isProcessing={isProcessing} 
                theme={theme} 
                t={t} 
            />
        );
      
      case EditorTool.CUTOUT:
          return (
              <CutoutPanel
                  onAutoCutout={(desc, useMask) => onApply({ type: 'cutout', description: desc, useMask })}
                  isProcessing={isProcessing}
                  theme={theme}
                  t={t}
                  downloadLayer={downloadLayer}
                  brushSize={brushSize}
                  setBrushSize={setBrushSize}
                  clearMask={clearMask}
                  onUndoBrush={onUndoBrush}
                  onRedoBrush={onRedoBrush}
              />
          );

      case EditorTool.UPSCALE:
        return (
          <div className="space-y-6">
            <div>
                <h3 className={`text-3xl font-black tracking-tight ${textPrimary}`}>{t.editor.upscaleTitle}</h3>
                <p className={`text-sm mt-2 leading-relaxed font-medium ${textSecondary}`}>
                {t.editor.upscaleDesc}
                </p>
            </div>
            
            <div className={`p-5 rounded-2xl border ${cardClass}`}>
                <div className={`text-[10px] font-bold tracking-widest uppercase mb-3 ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>MODEL CONFIG</div>
                <div className={`text-sm font-medium ${textPrimary}`}>Autofix: Sharpness, Denoise, 4K Detail Reconstruction</div>
            </div>
            
            <button
              onClick={() => onApply({ type: 'upscale' })}
              disabled={isProcessing}
              className={actionBtnClass}
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {t.editor.applyUpscale}
            </button>
          </div>
        );

      case EditorTool.REMOVE_WATERMARK:
        return (
          <div className="space-y-6">
             <div>
                <h3 className={`text-3xl font-black tracking-tight ${textPrimary}`}>{t.editor.cleanTitle}</h3>
                <p className={`text-sm mt-2 leading-relaxed font-medium ${textSecondary}`}>
                {t.editor.cleanDesc}
                </p>
            </div>
            
            {renderBrushControls()}
            
            <button
              onClick={() => onApply({ type: 'cleanup' })}
              disabled={isProcessing}
              className={actionBtnClass}
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eraser className="w-5 h-5" />}
              {t.editor.applyClean}
            </button>
          </div>
        );

      case EditorTool.INPAINT:
        return (
          <div className="space-y-6">
            <div>
                <h3 className={`text-3xl font-black tracking-tight ${textPrimary}`}>{t.editor.modifyTitle}</h3>
                <p className={`text-sm mt-2 leading-relaxed font-medium ${textSecondary}`}>
                {t.editor.modifyDesc}
                </p>
            </div>
            
            {renderBrushControls()}
            
            <div className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${cardClass}`} onClick={() => setStrictMode(!strictMode)}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${strictMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {strictMode ? <Shield className="w-5 h-5"/> : <ShieldAlert className="w-5 h-5"/>}
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-sm font-bold ${textPrimary}`}>{t.editor.preservationMode}</span>
                        <span className={`text-[10px] uppercase tracking-wide ${textSecondary}`}>{strictMode ? t.editor.strictDesc : t.editor.creativeDesc}</span>
                    </div>
                </div>
                <div className={`w-12 h-7 rounded-full relative transition-colors ${strictMode ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`absolute w-5 h-5 bg-white rounded-full top-1 shadow-sm transition-all ${strictMode ? 'left-6' : 'left-1'}`} />
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <label className={`text-[10px] uppercase font-bold tracking-widest ${textSecondary}`}>{t.editor.instruction}</label>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t.editor.modifyPlaceholder}
                    className={`w-full h-32 rounded-2xl p-4 text-sm font-medium resize-none border transition-all ${inputClass}`}
                />
            </div>
            <button
              onClick={() => onApply({ type: 'inpaint', prompt, strictMode })}
              disabled={isProcessing || !prompt.trim()}
              className={actionBtnClass}
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              {t.editor.applyModify}
            </button>
          </div>
        );

      case EditorTool.OUTPAINT:
        return (
          <div className="space-y-6">
            <div>
                <h3 className={`text-3xl font-black tracking-tight ${textPrimary}`}>{t.editor.expandTitle}</h3>
                <p className={`text-sm mt-2 leading-relaxed font-medium ${textSecondary}`}>
                {t.editor.expandDesc}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${textSecondary}`}>{t.common.width}</label>
                    <input 
                        type="number" 
                        value={outpaintSettings.width}
                        onChange={(e) => setOutpaintSettings({...outpaintSettings, width: Number(e.target.value)})}
                        className={`w-full rounded-xl p-3 text-sm font-medium border ${inputClass}`}
                    />
                 </div>
                 <div>
                    <label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${textSecondary}`}>{t.common.height}</label>
                    <input 
                        type="number" 
                        value={outpaintSettings.height}
                        onChange={(e) => setOutpaintSettings({...outpaintSettings, height: Number(e.target.value)})}
                        className={`w-full rounded-xl p-3 text-sm font-medium border ${inputClass}`}
                    />
                 </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center justify-between ${cardClass}`}>
                <span className={`text-sm font-bold ${textPrimary}`}>{t.editor.changeBg}</span>
                <button 
                    onClick={() => setOutpaintSettings(p => ({...p, keepBackground: !p.keepBackground}))}
                    className={`w-12 h-7 rounded-full relative transition-colors ${!outpaintSettings.keepBackground ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                    <div className={`absolute w-5 h-5 bg-white rounded-full top-1 shadow-sm transition-all ${!outpaintSettings.keepBackground ? 'left-6' : 'left-1'}`} />
                </button>
            </div>

             <div className="space-y-3">
                <label className={`text-[10px] uppercase font-bold tracking-widest ${textSecondary}`}>{t.editor.contextPrompt}</label>
                <input 
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t.editor.promptPlaceholder}
                    className={`w-full rounded-xl p-4 text-sm font-medium border ${inputClass}`}
                />
            </div>
            <button
              onClick={() => onApply({ type: 'outpaint', prompt: prompt || "Fill the background naturally matching the scene", ...outpaintSettings })}
              disabled={isProcessing}
              className={actionBtnClass}
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Expand className="w-5 h-5" />}
              {t.editor.applyExpand}
            </button>
          </div>
        );

      case EditorTool.CROP:
          return (
            <div className="space-y-6">
                <div>
                    <h3 className={`text-3xl font-black tracking-tight ${textPrimary}`}>{t.editor.cropTitle}</h3>
                    <p className={`text-sm mt-2 leading-relaxed font-medium ${textSecondary}`}>
                        {t.editor.cropDesc}
                    </p>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Free', val: null },
                        { label: '1:1', val: 1 },
                        { label: '3:4', val: 3/4 },
                        { label: '4:3', val: 4/3 },
                        { label: '16:9', val: 16/9 },
                        { label: '9:16', val: 9/16 },
                    ].map((r) => (
                        <button
                            key={r.label}
                            onClick={() => onSetCropRatio(r.val)}
                            className={`py-3 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${cardClass} ${isLight ? 'hover:bg-gray-100 hover:text-black' : 'hover:bg-white/10 hover:text-white'}`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                <div className={`rounded-2xl border flex items-center justify-center py-12 ${cardClass}`}>
                    <Crop className={`w-16 h-16 ${isLight ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <button
                    onClick={() => onApply({ type: 'crop' })}
                    className={actionBtnClass}
                >
                    <Check className="w-5 h-5" />
                    {t.editor.applyCrop}
                </button>
            </div>
          );

      default:
        return (
          <div className={`h-full flex flex-col items-center justify-center opacity-50 ${textSecondary}`}>
            <p className="text-center font-bold tracking-widest uppercase text-xs">{t.editor.selectTool}</p>
          </div>
        );
    }
  };

  return (
    <div className={`w-96 p-8 flex flex-col shrink-0 h-full overflow-y-auto no-scrollbar transition-colors duration-500 z-40 ${containerClass}`}>
       {renderContent()}
    </div>
  );
};
