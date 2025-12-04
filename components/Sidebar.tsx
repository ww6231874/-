
import React from 'react';
import { 
  Home, 
  Wand2, 
  Maximize2, 
  Eraser, 
  Expand, 
  Download,
  Moon,
  Sun,
  Palette,
  Crop,
  Scissors,
  Search
} from 'lucide-react';
import { AppMode, EditorTool, Language, AppTheme } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  currentTool: EditorTool;
  setTool: (tool: EditorTool) => void;
  hasImage: boolean;
  activeImage: string | null;
  onDownload: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  t: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  setMode,
  currentTool,
  setTool,
  hasImage,
  activeImage,
  onDownload,
  lang,
  setLang,
  theme,
  setTheme,
  t
}) => {
  
  const isLight = theme === 'light';

  // Base containers
  const containerClass = isLight
    ? 'bg-white border-r border-gray-100 shadow-sm'
    : 'bg-[#0f1115] border-r border-white/5';

  // Button Styles
  const buttonClass = (isActive: boolean, disabled: boolean = false) => {
    const base = "group relative flex flex-col items-center justify-center w-full py-4 transition-all duration-300";
    
    if (disabled) return `${base} opacity-30 cursor-not-allowed grayscale`;
    
    // Active Indicator
    const activeIndicator = isActive 
        ? isLight ? "border-r-4 border-black" : "border-r-4 border-white"
        : "border-r-4 border-transparent";

    const textClass = isActive
        ? isLight ? "text-black font-bold" : "text-white font-bold"
        : isLight ? "text-gray-400 hover:text-black" : "text-gray-500 hover:text-white";

    return `${base} ${activeIndicator} ${textClass}`;
  };

  return (
    <div className={`w-28 flex flex-col items-center h-full shrink-0 z-50 transition-colors duration-500 ${containerClass}`}>
      
      {/* Logo / Active Image Area */}
      <div className="py-8 w-full flex justify-center mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border-2 transition-all duration-500 ${isLight ? 'border-gray-100 bg-gray-50 shadow-sm' : 'border-white/10 bg-white/5'}`}>
          {activeImage ? (
             <img src={activeImage} alt="Active" className="w-full h-full object-cover" />
          ) : (
             <div className={`w-3 h-3 rounded-full ${isLight ? 'bg-black' : 'bg-white'}`}></div>
          )}
        </div>
      </div>

      <nav className="flex-1 w-full flex flex-col items-center overflow-y-auto no-scrollbar">
        {/* Home */}
        <button 
          onClick={() => setMode(AppMode.HOME)}
          className={buttonClass(currentMode === AppMode.HOME || currentMode === AppMode.INSPIRATION)}
          title={t.tools.home}
        >
          <Home className="w-6 h-6 mb-1.5" />
          <span className="text-[10px] tracking-widest uppercase">{t.tools.home}</span>
        </button>

        <div className={`w-12 h-px my-2 ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}></div>

        {/* Tools */}
        {[
          { id: EditorTool.CROP, icon: Crop, label: t.tools.crop },
          { id: EditorTool.UPSCALE, icon: Maximize2, label: t.tools.upscale },
          { id: EditorTool.REMOVE_WATERMARK, icon: Eraser, label: t.tools.clean },
          { id: EditorTool.CUTOUT, icon: Scissors, label: t.tools.cutout },
          { id: EditorTool.INPAINT, icon: Wand2, label: t.tools.modify },
          { id: EditorTool.OUTPAINT, icon: Expand, label: t.tools.expand },
          { id: EditorTool.COLOR, icon: Palette, label: t.tools.color },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setMode(AppMode.EDITOR);
              setTool(item.id);
            }}
            className={buttonClass(currentMode === AppMode.EDITOR && currentTool === item.id)}
          >
            <item.icon className="w-5 h-5 mb-1.5" />
            <span className="text-[9px] tracking-wide text-center uppercase">{item.label}</span>
          </button>
        ))}

      </nav>

      {/* Footer Controls */}
      <div className="py-6 w-full flex flex-col items-center gap-5">
        
        {/* Language */}
        <button 
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${isLight ? 'text-gray-400 hover:text-black' : 'text-gray-500 hover:text-white'}`}
        >
          {lang === 'en' ? 'EN' : 'CN'}
        </button>

        {/* Theme */}
        <button 
          onClick={() => setTheme(isLight ? 'dark' : 'light')}
          className={`p-2 rounded-full transition-all ${isLight ? 'text-gray-400 hover:text-black' : 'text-gray-500 hover:text-white'}`}
        >
           {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Export */}
        <button 
          onClick={onDownload}
          disabled={!hasImage}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl
            ${!hasImage ? 'opacity-30 cursor-not-allowed bg-gray-100 text-gray-400' : 
              isLight 
                ? 'bg-black text-white hover:scale-105' 
                : 'bg-white text-black hover:scale-105'
            }
          `}
          title={t.tools.export}
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
