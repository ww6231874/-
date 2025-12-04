
import React from 'react';
import { LibraryImage, AppTheme } from '../types';
import { Trash2, Download, Image as ImageIcon, ArrowLeft } from 'lucide-react';

interface LibraryViewProps {
  library: LibraryImage[];
  onSelect: (img: LibraryImage) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  theme: AppTheme;
  t: any;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ library, onSelect, onDelete, onBack, theme, t }) => {
  const containerClass = theme === 'dark' ? 'bg-gray-950' : 'bg-transparent';
  const cardClass = theme === 'dark' 
    ? 'bg-gray-900 border-gray-800' 
    : 'bg-black/20 backdrop-blur-md border-white/10 hover:bg-black/30';

  return (
    <div className={`flex-1 p-8 overflow-y-auto h-full ${containerClass}`}>
       <div className="max-w-6xl mx-auto">
           <div className="flex items-center gap-4 mb-8">
               <button onClick={onBack} className={`p-2 rounded-lg hover:bg-white/10 transition-colors`}>
                   <ArrowLeft className="w-6 h-6" />
               </button>
               <h2 className="text-3xl font-bold text-white">{t.library.title}</h2>
               <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white/10 text-white/70'}`}>
                   {library.length} {t.library.items}
               </span>
           </div>

           {library.length === 0 ? (
               <div className={`flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl ${theme === 'dark' ? 'border-gray-800' : 'border-white/10'}`}>
                   <div className="p-4 rounded-full bg-white/5 mb-4">
                       <ImageIcon className="w-12 h-12 opacity-30" />
                   </div>
                   <h3 className="text-xl font-medium opacity-50">{t.library.empty}</h3>
                   <p className="text-sm opacity-30 mt-2">{t.library.emptyDesc}</p>
               </div>
           ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                   {library.map((item) => (
                       <div key={item.id} className={`group relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer hover:shadow-2xl ${cardClass}`}>
                           <img 
                               src={item.url} 
                               alt="Saved" 
                               className="w-full h-full object-cover"
                           />
                           
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                               <button 
                                   onClick={() => onSelect(item)}
                                   className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium text-sm hover:bg-blue-500 transform hover:scale-105 transition-all"
                               >
                                   {t.library.open}
                               </button>
                               <div className="flex gap-2">
                                   <a 
                                       href={item.url} 
                                       download={`visionary-lib-${item.timestamp}.png`}
                                       onClick={(e) => e.stopPropagation()}
                                       className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"
                                       title="Download"
                                   >
                                       <Download className="w-4 h-4" />
                                   </a>
                                   <button 
                                       onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                       className="p-2 bg-white/10 rounded-full hover:bg-red-500/80 text-white"
                                       title="Delete"
                                   >
                                       <Trash2 className="w-4 h-4" />
                                   </button>
                               </div>
                           </div>
                           
                           <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                               <p className="text-[10px] text-white/70 font-mono">
                                   {new Date(item.timestamp).toLocaleDateString()}
                               </p>
                           </div>
                       </div>
                   ))}
               </div>
           )}
       </div>
    </div>
  );
};
