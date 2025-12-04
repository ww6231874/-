
import React, { useRef, useEffect, useState } from 'react';
import { AppTheme, LibraryImage } from '../types';
import { Trash2, Heart, History, BookOpen, X, Download } from 'lucide-react';

interface GalleryStripProps {
  history: string[];
  library: LibraryImage[];
  currentIndex: number;
  onSelectHistory: (index: number) => void;
  onSelectLibrary: (item: LibraryImage) => void;
  onDeleteHistory: (index: number) => void;
  onDeleteLibrary: (id: string) => void;
  onSave: (index: number) => void;
  theme: AppTheme;
  t: any;
}

export const GalleryStrip: React.FC<GalleryStripProps> = ({ 
  history, 
  library, 
  currentIndex, 
  onSelectHistory, 
  onSelectLibrary, 
  onDeleteHistory, 
  onDeleteLibrary, 
  onSave, 
  theme, 
  t 
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'library'>('history');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest on history update if active
  useEffect(() => {
    if (activeTab === 'history' && scrollRef.current) {
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
    }
  }, [history.length, activeTab]);

  const containerClass = theme === 'dark' 
    ? 'bg-gray-900 border-t border-gray-800' 
    : 'bg-black/30 backdrop-blur-md border-t border-white/10';

  const itemClass = (isActive: boolean) => `
    relative h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 shrink-0 group bg-gray-800
    ${isActive 
      ? 'border-blue-500 shadow-lg scale-105 z-10' 
      : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
    }
  `;

  return (
    <div className={`flex flex-col w-full h-40 ${containerClass}`}>
      {/* Tabs */}
      <div className="flex px-4 border-b border-white/5">
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase border-b-2 transition-colors ${activeTab === 'history' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          <History className="w-3 h-3" /> {t.common.history} ({history.length})
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase border-b-2 transition-colors ${activeTab === 'library' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          <BookOpen className="w-3 h-3" /> {t.tools.library} ({library.length})
        </button>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 flex items-center gap-3 overflow-x-auto p-4 no-scrollbar">
        
        {/* History Tab */}
        {activeTab === 'history' && history.map((img, idx) => (
          <div 
            key={idx}
            onClick={() => onSelectHistory(idx)}
            className={itemClass(idx === currentIndex)}
          >
            <img src={img} alt={`History ${idx}`} className="w-full h-full object-cover" />
            
            {/* Top Right Action Buttons - Only visible on hover */}
            <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button 
                    onClick={(e) => { e.stopPropagation(); onSave(idx); }}
                    className="p-1 rounded bg-black/60 hover:bg-pink-500 text-white transition-colors backdrop-blur-sm"
                    title={t.common.saveToLib}
                >
                    <Heart className="w-3 h-3" />
                </button>
                {idx > 0 && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteHistory(idx); }}
                        className="p-1 rounded bg-black/60 hover:bg-red-500 text-white transition-colors backdrop-blur-sm"
                        title={t.common.delete}
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-[8px] text-white px-1 py-0.5 text-center pointer-events-none backdrop-blur-sm">
              {idx === 0 ? t.common.original : `#${idx}`}
            </div>
          </div>
        ))}

        {/* Library Tab */}
        {activeTab === 'library' && (
          library.length === 0 ? (
            <div className="w-full text-center text-xs text-gray-500">{t.library.emptyDesc}</div>
          ) : (
            library.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelectLibrary(item)}
                className={itemClass(false)}
              >
                <img src={item.url} alt="Saved" className="w-full h-full object-cover" />
                
                 <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <a 
                         href={item.url} 
                         download={`lib-${item.timestamp}.png`}
                         onClick={(e) => e.stopPropagation()}
                         className="p-1 rounded bg-black/60 hover:bg-blue-500 text-white transition-colors backdrop-blur-sm"
                    >
                         <Download className="w-3 h-3" />
                    </a>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteLibrary(item.id); }}
                        className="p-1 rounded bg-black/60 hover:bg-red-500 text-white transition-colors backdrop-blur-sm"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-purple-900/50 text-[8px] text-white px-1 py-0.5 text-center pointer-events-none backdrop-blur-sm">
                   {new Date(item.timestamp).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};
