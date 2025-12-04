
import React, { useState } from 'react';
import { LUT_PRESETS } from '../services/imageUtils';
import { AppTheme } from '../types';
import { Sliders, Grid } from 'lucide-react';

interface ColorPanelProps {
  onApplyFilter: (filter: string, intensity: number) => void;
  isProcessing: boolean;
  theme: AppTheme;
  t: any;
}

export const ColorPanel: React.FC<ColorPanelProps> = ({ onApplyFilter, isProcessing, theme, t }) => {
  const [activeTab, setActiveTab] = useState<'adjust' | 'luts'>('adjust');
  const [lutIntensity, setLutIntensity] = useState(100);
  const [filters, setFilters] = useState({
      brightness: 100,
      contrast: 100,
      saturate: 100,
      hue: 0
  });

  const getFilterString = () => {
      return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) hue-rotate(${filters.hue}deg)`;
  };

  const handleApplyAdjustments = () => {
      onApplyFilter(getFilterString(), 100);
  };

  const isLight = theme === 'light';
  
  const textSecondary = isLight ? 'text-gray-500' : 'text-gray-400';
  const sliderClass = `w-full h-1.5 rounded-lg appearance-none cursor-pointer ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`;
  const tabClass = (active: boolean) => 
    `flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all 
    ${active 
        ? (isLight ? 'bg-black text-white shadow-md' : 'bg-white text-black shadow-md') 
        : (isLight ? 'text-gray-400 hover:bg-gray-100' : 'text-gray-500 hover:bg-white/10')}`;

  return (
    <div className="flex flex-col h-full">
       <div className={`flex gap-1 p-1 rounded-xl mb-6 ${isLight ? 'bg-gray-100' : 'bg-white/5 border border-white/10'}`}>
           <button 
             onClick={() => setActiveTab('adjust')}
             className={tabClass(activeTab === 'adjust')}
           >
              <Sliders className="w-3 h-3" /> {t.color.adjust}
           </button>
           <button 
             onClick={() => setActiveTab('luts')}
             className={tabClass(activeTab === 'luts')}
           >
              <Grid className="w-3 h-3" /> {t.color.luts}
           </button>
       </div>

       <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
           {activeTab === 'adjust' && (
               <div className="space-y-6">
                   {/* Sliders */}
                   {[
                     { label: t.color.brightness, key: 'brightness', min: 0, max: 200, unit: '%' },
                     { label: t.color.contrast, key: 'contrast', min: 0, max: 200, unit: '%' },
                     { label: t.color.saturation, key: 'saturate', min: 0, max: 200, unit: '%' },
                     { label: t.color.hue, key: 'hue', min: -180, max: 180, unit: '°' },
                   ].map((item) => (
                      <div key={item.key}>
                       <div className="flex justify-between mb-3">
                           <span className={`text-xs font-bold uppercase ${textSecondary}`}>{item.label}</span>
                           <span className={`text-xs font-mono ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                               {filters[item.key as keyof typeof filters]}{item.unit}
                           </span>
                       </div>
                       <input 
                         type="range" min={item.min} max={item.max}
                         value={filters[item.key as keyof typeof filters]} 
                         onChange={(e) => setFilters({...filters, [item.key]: Number(e.target.value)})}
                         className={sliderClass} 
                       />
                   </div>
                   ))}

                   <button
                        onClick={handleApplyAdjustments}
                        disabled={isProcessing}
                        className={`w-full py-4 mt-4 rounded-xl font-bold transition-all shadow-lg 
                            ${isLight ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}
                    >
                        {t.color.applyAdjustments}
                    </button>
               </div>
           )}

           {activeTab === 'luts' && (
               <div className="space-y-6">
                   <div className="px-1">
                       <div className="flex justify-between mb-3">
                           <span className={`text-xs font-bold uppercase ${textSecondary}`}>{t.color.intensity}</span>
                           <span className={`text-xs font-mono ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>{lutIntensity}%</span>
                       </div>
                       <input 
                         type="range" min="0" max="100" 
                         value={lutIntensity} 
                         onChange={(e) => setLutIntensity(Number(e.target.value))}
                         className={sliderClass} 
                       />
                   </div>

                   <div className="grid grid-cols-2 gap-3 pb-4">
                       {LUT_PRESETS.map(lut => (
                           <button
                              key={lut.id}
                              onClick={() => onApplyFilter(lut.filter, lutIntensity)}
                              disabled={isProcessing}
                              className={`group relative aspect-video rounded-lg overflow-hidden border transition-all hover:scale-105 text-left 
                                ${isLight ? 'border-gray-200 hover:border-black shadow-sm' : 'border-white/10 hover:border-white shadow-none'}`}
                           >
                               <div className="absolute inset-0" style={{ backgroundColor: lut.thumbnailColor, filter: lut.filter }}></div>
                               <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                   <span className="text-[10px] font-bold text-white uppercase tracking-wider">{lut.name}</span>
                               </div>
                           </button>
                       ))}
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};