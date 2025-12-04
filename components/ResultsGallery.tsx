
import React from 'react';
import { GeneratedImage, ImageStyle, AppTheme } from '../types';
import { Download, Loader2, Plus, Sparkles } from 'lucide-react';

interface ResultsGalleryProps {
  results: GeneratedImage[];
  isGenerating: boolean;
  onSelect: (url: string) => void;
  categories: ImageStyle[];
  activeCategory: ImageStyle | 'ALL';
  setActiveCategory: (cat: ImageStyle | 'ALL') => void;
  analysisDescription: string;
  theme: AppTheme;
  t: any;
  onLoadMore: (category: ImageStyle) => void;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({
  results,
  isGenerating,
  onSelect,
  categories,
  activeCategory,
  setActiveCategory,
  analysisDescription,
  theme,
  t,
  onLoadMore
}) => {

  const filteredResults = activeCategory === 'ALL' 
    ? results 
    : results.filter(r => r.style === activeCategory);

  const isLight = theme === 'light';

  // Styles
  const cardClass = isLight 
    ? 'bg-white shadow-lg hover:shadow-2xl' 
    : 'bg-[#0f1115] border-white/5 shadow-black/40 hover:border-white/20';

  const pillClass = (isActive: boolean) => {
      if (isLight) {
          return isActive 
            ? 'bg-black text-white shadow-lg scale-105' 
            : 'bg-white text-gray-500 hover:text-black shadow-sm hover:shadow-md';
      } else {
          return isActive 
            ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
            : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10';
      }
  };

  return (
    <div className={`flex-1 p-8 overflow-y-auto h-full ${isLight ? 'bg-[#FAFAFA]' : 'bg-[#09090b]'}`}>
      <div className="max-w-7xl mx-auto pb-20">
        <div className="mb-12 text-center max-w-2xl mx-auto">
            <h2 className={`text-4xl font-black mb-4 tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>{t.visualDiscovery}</h2>
            <div className={`p-6 rounded-3xl ${isLight ? 'bg-white shadow-xl' : 'bg-white/5 border border-white/10'}`}>
                <div className="flex flex-col items-center gap-3">
                    <Sparkles className={`w-6 h-6 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                    <p className={`text-sm font-medium leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                        {analysisDescription || t.analyzing}
                    </p>
                </div>
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
                onClick={() => setActiveCategory('ALL')}
                className={`px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${pillClass(activeCategory === 'ALL')}`}
            >
                {t.allStyles}
            </button>
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${pillClass(activeCategory === cat)}`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {filteredResults.map((result) => (
                <div key={result.id} className={`group relative aspect-square rounded-[2rem] overflow-hidden transition-all duration-300 ${cardClass}`}>
                    <img 
                        src={result.url} 
                        alt={result.style} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-4">{result.style}</span>
                        <div className="flex gap-3">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(result.url);
                                }}
                                className="flex-1 bg-white text-black text-xs py-3 rounded-xl font-bold shadow-lg hover:bg-gray-100 transition-colors uppercase tracking-wide"
                            >
                                {t.editThis}
                            </button>
                            <a 
                                href={result.url} 
                                download={`similar-${result.style}.png`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-3 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-xl transition-colors"
                            >
                                <Download className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Loaders */}
            {isGenerating && (
                Array.from({length: 4}).map((_, i) => (
                    <div key={`load-${i}`} className={`aspect-square rounded-[2rem] animate-pulse flex items-center justify-center ${isLight ? 'bg-gray-100' : 'bg-white/5 border border-white/10'}`}>
                        <Loader2 className={`w-8 h-8 animate-spin ${isLight ? 'text-gray-300' : 'text-gray-700'}`} />
                    </div>
                ))
            )}
        </div>

        {/* Load More Button */}
        {!isGenerating && filteredResults.length > 0 && activeCategory !== 'ALL' && (
            <div className="flex justify-center">
                <button 
                    onClick={() => onLoadMore(activeCategory as ImageStyle)}
                    className={`flex items-center gap-2 px-10 py-4 rounded-full transition-all text-xs font-bold uppercase tracking-widest shadow-xl hover:scale-105 ${isLight ? 'bg-black text-white hover:bg-gray-800' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    <Plus className="w-4 h-4" />
                    {t.common.loadMore} {activeCategory}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
