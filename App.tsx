
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { EditorPanel } from './components/EditorPanel';
import { ImageCanvas, ImageCanvasRef } from './components/ImageCanvas';
import { ComparisonView } from './components/ComparisonView';
import { ImageInfoPanel } from './components/ImageInfoPanel';
import { Toolbar } from './components/Toolbar';
import { GalleryStrip } from './components/GalleryStrip';
import { AppMode, EditorTool, ImageStyle, GeneratedImage, Language, AppTheme, ImageMetadata, LibraryImage } from './types';
import { editImage } from './services/geminiService';
import { getImageMetadata, applyImageFilter, cropImage, padImageToAspectRatio, applyLuminanceMask } from './services/imageUtils';
import { Upload, Loader2, Maximize2, Eraser, Wand2, Expand, Crop, Scissors, Palette, ScanFace, Image as ImageIcon, Sparkles, UserSquare2 } from 'lucide-react';

// --- Translation Dictionary ---
export const APP_TRANSLATIONS = {
  en: {
    title: "VISIONARY",
    subtitle: "AI CREATIVE STUDIO",
    uploadTitle: "Start Creating",
    uploadDesc: "Drag & drop to edit",
    uploadSub: "Supports High-Res JPG, PNG",
    visualDiscovery: "Visual Discovery",
    analyzing: "Analyzing visual content...",
    allStyles: "All Styles",
    noResults: "No results found. Try uploading a new image.",
    editThis: "Edit This",
    processing: "PROCESSING",
    reset: "Reset",
    uploadForTool: "Upload image to start",
    pinterest: {
        placeholder: "Find inspiration (e.g. futuristic fashion, neon city)...",
        button: "Search Ideas",
        title: "Inspiration Gallery"
    },
    common: {
        loadMore: "Load More",
        width: "Width",
        height: "Height",
        brushSize: "Brush Size",
        clearSelection: "Clear",
        original: "ORIGINAL",
        result: "RESULT",
        compare: "Compare",
        history: "History",
        saveToLib: "Save",
        delete: "Delete"
    },
    infoPanel: {
        title: "Properties",
        resolution: "Res",
        size: "Size",
        format: "Ext",
        palette: "Colors"
    },
    tools: {
      home: "Home",
      new: "New",
      library: "Library",
      upscale: "Upscale",
      clean: "Clean",
      modify: "Modify",
      expand: "Expand",
      export: "Export",
      color: "Color",
      crop: "Crop",
      cutout: "Cutout"
    },
    cutout: {
      title: "Smart Cutout",
      desc: "Precision background removal.",
      autoRemove: "Auto",
      autoRemoveDesc: "AI Subject Detection",
      manualSelect: "Manual",
      manualSelectDesc: "Paint to Extract",
      targetDesc: "Subject Description",
      targetPlaceholder: "e.g., The red car",
      startRemove: "Execute Cutout",
      layers: "Layer Export",
      layersDesc: "Save transparency.",
      exportPng: "Download PNG",
      paintMode: "Cutout Painted Area"
    },
    editor: {
      selectTool: "Select a tool",
      upscaleTitle: "Super Resolution",
      upscaleDesc: "Enhance details and resolution.",
      cleanTitle: "Magic Eraser",
      cleanDesc: "Paint over unwanted objects.",
      modifyTitle: "Generative Fill",
      modifyDesc: "Paint area to regenerate content.",
      expandTitle: "Infinite Canvas",
      expandDesc: "Extend image boundaries with AI.",
      cropTitle: "Crop",
      cropDesc: "Adjust composition.",
      instruction: "Prompt",
      contextPrompt: "Context (Optional)",
      changeBg: "Replace Background",
      changeBgDesc: "Original background will be removed.",
      promptPlaceholder: "Describe the scene...",
      modifyPlaceholder: "Describe the change...",
      applyUpscale: "Enhance",
      applyClean: "Erase",
      applyModify: "Generate",
      applyExpand: "Expand",
      applyCrop: "Crop",
      warningExpand: "Resize canvas?",
      preservationMode: "Mode",
      strictDesc: "Strict",
      creativeDesc: "Creative"
    },
    color: {
        luts: "Filters",
        adjust: "Tune",
        brightness: "Brightness",
        contrast: "Contrast",
        saturation: "Saturation",
        hue: "Hue",
        applyAdjustments: "Apply",
        intensity: "Intensity"
    },
    library: {
        title: "Library",
        items: "Assets",
        empty: "Empty Library",
        emptyDesc: "No saved assets.",
        open: "Open"
    },
    presets: {
        restore: "Restore Old Photo",
        restoreDesc: "Fix scratches & colorize",
        idphoto: "ID Photo Maker",
        idphotoDesc: "Smart crop & background",
        product: "Product Shot",
        productDesc: "Studio background",
        anime: "Anime Style",
        animeDesc: "2D Conversion"
    }
  },
  zh: {
    title: "VISIONARY",
    subtitle: "AI 创意工坊",
    uploadTitle: "开始创作",
    uploadDesc: "拖拽图片进行编辑",
    uploadSub: "支持高清 JPG, PNG",
    visualDiscovery: "视觉探索",
    analyzing: "正在分析画面...",
    allStyles: "全部风格",
    noResults: "无结果",
    editThis: "编辑",
    processing: "处理中",
    reset: "重置",
    uploadForTool: "上传图片",
    pinterest: {
        placeholder: "寻找灵感 (例如: 未来时尚, 赛博城市)...",
        button: "搜索创意",
        title: "灵感图库"
    },
    common: {
        loadMore: "加载更多",
        width: "宽度",
        height: "高度",
        brushSize: "画笔",
        clearSelection: "清除",
        original: "原图",
        result: "结果",
        compare: "对比",
        history: "历史",
        saveToLib: "保存",
        delete: "删除"
    },
    infoPanel: {
        title: "属性",
        resolution: "分辨率",
        size: "大小",
        format: "格式",
        palette: "配色"
    },
    tools: {
      home: "首页",
      new: "新建",
      library: "图库",
      upscale: "放大",
      clean: "消除",
      modify: "重绘",
      expand: "扩图",
      export: "导出",
      color: "调色",
      crop: "裁切",
      cutout: "抠图"
    },
    cutout: {
      title: "智能抠图",
      desc: "高精度主体分离",
      autoRemove: "自动",
      autoRemoveDesc: "AI 自动识别",
      manualSelect: "手动",
      manualSelectDesc: "涂抹选择",
      targetDesc: "主体描述",
      targetPlaceholder: "例如：红色汽车",
      startRemove: "执行抠图",
      layers: "图层导出",
      layersDesc: "保存透明PNG",
      exportPng: "导出图层",
      paintMode: "抠出涂抹区"
    },
    editor: {
      selectTool: "选择工具",
      upscaleTitle: "超分放大",
      upscaleDesc: "利用生成式填充增强细节并提升分辨率。",
      cleanTitle: "魔法消除",
      cleanDesc: "涂抹想要消除的区域，AI 将自动补全背景。",
      modifyTitle: "生成式重绘",
      modifyDesc: "涂抹区域并描述，AI 将为您生成新内容。",
      expandTitle: "无限画板",
      expandDesc: "延展图片边界，AI 自动构想画面延伸。",
      cropTitle: "裁切",
      cropDesc: "调整构图比例。",
      instruction: "提示词",
      contextPrompt: "环境提示 (可选)",
      changeBg: "更换背景",
      changeBgDesc: "替换背景",
      promptPlaceholder: "描述画面...",
      modifyPlaceholder: "描述修改...",
      applyUpscale: "增强",
      applyClean: "消除",
      applyModify: "生成",
      applyExpand: "扩充",
      applyCrop: "确认",
      warningExpand: "确认调整?",
      preservationMode: "模式",
      strictDesc: "严格",
      creativeDesc: "创意"
    },
    color: {
        luts: "滤镜",
        adjust: "调节",
        brightness: "亮度",
        contrast: "对比度",
        saturation: "饱和度",
        hue: "色相",
        applyAdjustments: "应用",
        intensity: "强度"
    },
    library: {
        title: "素材库",
        items: "个项目",
        empty: "暂无内容",
        emptyDesc: "空空如也",
        open: "打开"
    },
    presets: {
        restore: "老照片修复",
        restoreDesc: "去划痕 & 上色",
        idphoto: "证件照制作",
        idphotoDesc: "智能裁切 & 换底",
        product: "电商产品图",
        productDesc: "摄影棚背景生成",
        anime: "动漫化",
        animeDesc: "2D 二次元转换"
    }
  }
};

const getClosestAspectRatio = (width: number, height: number): "1:1" | "3:4" | "4:3" | "9:16" | "16:9" => {
    const ratio = width / height;
    const supportedRatios = [
        { key: "1:1", val: 1.0 },
        { key: "3:4", val: 3/4 },
        { key: "4:3", val: 4/3 },
        { key: "9:16", val: 9/16 },
        { key: "16:9", val: 16/9 }
    ] as const;

    return supportedRatios.reduce((prev, curr) => {
        return (Math.abs(curr.val - ratio) < Math.abs(prev.val - ratio) ? curr : prev);
    }).key;
};

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [tool, setTool] = useState<EditorTool>(EditorTool.NONE);
  const [pendingTool, setPendingTool] = useState<EditorTool | null>(null);
  const [pendingPreset, setPendingPreset] = useState<string | null>(null);
  
  const [currentMetadata, setCurrentMetadata] = useState<ImageMetadata | null>(null);

  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [library, setLibrary] = useState<LibraryImage[]>([]);

  const [lang, setLang] = useState<Language>('zh');
  // Default to Dark Mode
  const [theme, setTheme] = useState<AppTheme>('dark'); 
  const [brushSize, setBrushSize] = useState(30);
  const [editorScale, setEditorScale] = useState(1);
  const [isComparing, setIsComparing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<ImageCanvasRef>(null);
  const t = APP_TRANSLATIONS[lang];

  const displayedImage = historyIndex >= 0 ? history[historyIndex] : null;
  const originalImage = history.length > 0 ? history[0] : null;
  const previousImage = historyIndex > 0 ? history[historyIndex - 1] : displayedImage;

  useEffect(() => {
    if (displayedImage) {
      getImageMetadata(displayedImage).then(setCurrentMetadata);
    } else {
      setCurrentMetadata(null);
    }
  }, [displayedImage]);

  // Handle auto-application of presets when entering editor
  useEffect(() => {
      if (mode === AppMode.EDITOR && displayedImage && pendingPreset) {
          if (pendingPreset === 'RESTORE') {
              // Auto trigger upscale/restore
              handleEditorApply({ type: 'upscale' });
          }
          setPendingPreset(null);
      }
  }, [mode, displayedImage, pendingPreset]);

  const addToHistory = (newImage: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newImage);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      canvasRef.current?.clearMask();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      canvasRef.current?.clearMask();
    }
  };

  const handleSaveToLibrary = (url: string) => {
      const newItem: LibraryImage = {
          id: crypto.randomUUID(),
          url: url,
          timestamp: Date.now(),
          metadata: undefined
      };
      setLibrary(prev => [newItem, ...prev]);
  };

  const handleSaveCurrentToLibrary = (index: number) => {
      if (!history[index]) return;
      handleSaveToLibrary(history[index]);
  };

  const handleDeleteHistory = (index: number) => {
      if (index === 0) return;
      const newHistory = history.filter((_, i) => i !== index);
      setHistory(newHistory);
      if (historyIndex >= index) {
          setHistoryIndex(Math.max(0, historyIndex - 1));
      }
  };
  
  const handleDeleteLibraryItem = (id: string) => {
      setLibrary(prev => prev.filter(item => item.id !== id));
  };

  const handleOpenFromLibrary = (item: LibraryImage) => {
      setHistory([item.url]);
      setHistoryIndex(0);
      setMode(AppMode.EDITOR);
      setTool(EditorTool.UPSCALE);
  };

  const handleToolClick = (selectedTool: EditorTool, presetId?: string) => {
      setPendingTool(selectedTool);
      if (presetId) setPendingPreset(presetId);
      fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        
        setHistory([result]);
        setHistoryIndex(0);
        
        // Direct to editor
        setMode(AppMode.EDITOR);
        // Use the tool selected on home screen, or default to NONE
        setTool(pendingTool || EditorTool.NONE);
        // Reset pending tool but keep preset for effect
        setPendingTool(null); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetCropRatio = (ratio: number | null) => {
      if (!canvasRef.current) return;
      if (ratio === null) {
          canvasRef.current.setCropRect({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
      } else {
          const nw = canvasRef.current.naturalWidth;
          const nh = canvasRef.current.naturalHeight;
          const imgRatio = nw / nh;
          let w, h;
          if (imgRatio > ratio) {
              h = 0.8; w = (h * ratio) / imgRatio;
          } else {
              w = 0.8; h = (w * imgRatio) / ratio;
          }
          canvasRef.current.setCropRect({ x: (1 - w) / 2, y: (1 - h) / 2, width: w, height: h });
      }
  };

  const handleEditorApply = async (params: any) => {
    if (!displayedImage || !canvasRef.current) return;
    setIsProcessing(true);

    try {
        let newImage: string | null = null;
        let prompt = "";
        let inputImage = displayedImage;
        const currentAR = getClosestAspectRatio(canvasRef.current.naturalWidth, canvasRef.current.naturalHeight);

        if (params.type === 'crop') {
             const cropCoords = canvasRef.current.getCropCoordinates();
             if (cropCoords) newImage = await cropImage(displayedImage, cropCoords);
        }
        else if (params.type === 'upscale') {
            prompt = "Generate an image. Produce a high-fidelity 4K upscaled version of this image. STRICTLY preserve the content, composition, and details. Fix scratches, enhance sharpness and reduce noise without altering the subject.";
            newImage = await editImage(displayedImage, prompt, currentAR);
        } 
        else if (params.type === 'cleanup') {
            inputImage = await canvasRef.current.getCompositeImage('rgba(255, 0, 0, 0.6)'); 
            prompt = "Generate an image. Remove the area highlighted in semi-transparent red. This is an inpainting task. STRICTLY preserve the rest of the image exactly as it is. Reconstruct the background behind the red area naturally.";
            newImage = await editImage(inputImage, prompt, currentAR);
        } 
        else if (params.type === 'inpaint') {
             inputImage = await canvasRef.current.getCompositeImage('rgba(255, 0, 0, 0.6)');
             if (params.strictMode) {
                 prompt = `Generate an image. The area highlighted in red is a mask. Replace ONLY the content inside this mask with: '${params.prompt}'. CRITICAL: Do NOT change anything outside the red mask. The unmasked area must be pixel-perfect identical to the original.`;
             } else {
                 prompt = `Generate an image. The area highlighted in red is a mask. Replace the content inside this mask with: '${params.prompt}'. Blend it seamlessly with the rest of the image.`;
             }
             newImage = await editImage(inputImage, prompt, currentAR);
        } 
        else if (params.type === 'outpaint') {
             const ar = getClosestAspectRatio(params.width, params.height);
             inputImage = await canvasRef.current.getOriginalImageWithSize(params.width, params.height, '#000000');
             prompt = params.keepBackground 
                ? `Generate an image. The center is the original image. The black outer areas are empty canvas. Fill the black areas seamlessly to extend the scene. ${params.prompt}.`
                : `Generate an image. Use the central image as a reference character/object. Replace the entire background and fill the black areas with: ${params.prompt}.`;
             newImage = await editImage(inputImage, prompt, ar);
        }
        else if (params.type === 'cutout') {
             const isManualMask = params.useMask;
             const closestAR = getClosestAspectRatio(canvasRef.current.naturalWidth, canvasRef.current.naturalHeight);
             const ratioVal = closestAR.split(':').map(Number);
             const targetRatio = ratioVal[0] / ratioVal[1];
             
             let sourceImage = displayedImage;
             if (isManualMask) sourceImage = await canvasRef.current.getCompositeImage('rgba(255, 0, 0, 0.8)');

             const { image: paddedImage, cropRect } = await padImageToAspectRatio(sourceImage, targetRatio);

             if (isManualMask) {
                 prompt = `Generate an image. STRICT manual cutout. Input has RED overlay marking subject. Task: Create high-contrast BLACK AND WHITE silhouette mask. White=Subject, Black=Background. Ignore everything unpainted.`;
             } else {
                 prompt = `Generate an image. Create a high-contrast BLACK AND WHITE silhouette mask for the subject: ${params.description || 'the main object'}. Subject=White, Background=Black. Binary mask only.`;
             }
             
             const maskImage = await editImage(paddedImage, prompt, closestAR, 'gemini-3-pro-image-preview');
             if (maskImage) newImage = await applyLuminanceMask(displayedImage, maskImage, cropRect);
        }

        if (newImage) {
            addToHistory(newImage);
            canvasRef.current.clearMask();
            setIsComparing(false);
        } else if (params.type !== 'crop') {
            alert("The AI could not generate an image. Please try again.");
        }
    } catch (error) {
        console.error(error);
        alert("Operation failed. Please check your connection.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleApplyFilter = async (filterString: string, intensity: number) => {
      if (!displayedImage) return;
      setIsProcessing(true);
      try {
          const newImage = await applyImageFilter(displayedImage, filterString, intensity);
          addToHistory(newImage);
      } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const downloadCurrent = () => {
    if (displayedImage) {
        const link = document.createElement('a');
        link.href = displayedImage;
        link.download = `visionary_export_${Date.now()}.png`;
        link.click();
    }
  };

  const isLight = theme === 'light';
  const bgClass = isLight ? "bg-[#FAFAFA]" : "bg-[#09090b]";
  const textPrimary = isLight ? 'text-gray-900' : 'text-white';
  const textSecondary = isLight ? 'text-gray-500' : 'text-gray-400';

  const HOME_TOOLS = [
      { id: EditorTool.CROP, icon: Crop, title: t.editor.cropTitle, desc: t.editor.cropDesc },
      { id: EditorTool.UPSCALE, icon: Maximize2, title: t.editor.upscaleTitle, desc: t.editor.upscaleDesc },
      { id: EditorTool.REMOVE_WATERMARK, icon: Eraser, title: t.editor.cleanTitle, desc: t.editor.cleanDesc },
      { id: EditorTool.CUTOUT, icon: Scissors, title: t.cutout.title, desc: t.cutout.desc },
      { id: EditorTool.INPAINT, icon: Wand2, title: t.editor.modifyTitle, desc: t.editor.modifyDesc },
      { id: EditorTool.OUTPAINT, icon: Expand, title: t.editor.expandTitle, desc: t.editor.expandDesc },
      { id: EditorTool.COLOR, icon: Palette, title: t.tools.color, desc: "Professional Filters & LUTs" },
  ];
  
  const PRESETS = [
      { id: 'RESTORE', tool: EditorTool.UPSCALE, icon: ScanFace, title: t.presets.restore, desc: t.presets.restoreDesc },
      { id: 'ID_PHOTO', tool: EditorTool.CROP, icon: UserSquare2, title: t.presets.idphoto, desc: t.presets.idphotoDesc },
      { id: 'PRODUCT', tool: EditorTool.OUTPAINT, icon: Sparkles, title: t.presets.product, desc: t.presets.productDesc },
      { id: 'ANIME', tool: EditorTool.INPAINT, icon: ImageIcon, title: t.presets.anime, desc: t.presets.animeDesc },
  ];

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-500 ${bgClass}`}>
      <Sidebar 
        currentMode={mode} 
        setMode={(m) => {
            setMode(m);
        }}
        currentTool={tool}
        setTool={(t) => {
            setTool(t);
            setIsComparing(false);
            canvasRef.current?.clearMask();
        }}
        hasImage={!!displayedImage}
        activeImage={displayedImage}
        onDownload={downloadCurrent}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        t={t}
      />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
        />

        {/* HOME MODE */}
        {mode === AppMode.HOME && (
            <div className={`flex-1 overflow-y-auto h-full flex flex-col ${isLight ? 'bg-white' : 'bg-[#0f1115]'}`}>
                
                {/* Branding */}
                <div className="pt-12 pb-8 px-8 text-center max-w-4xl mx-auto w-full z-10">
                    <h1 className={`text-6xl md:text-8xl font-black tracking-tighter mb-4 transition-colors ${textPrimary}`}>
                        {t.title}
                    </h1>
                    <p className={`text-sm md:text-base font-medium tracking-widest uppercase mb-10 ${textSecondary}`}>
                        {t.subtitle}
                    </p>
                </div>

                <div className="max-w-7xl mx-auto w-full px-6 pb-20">
                    
                    {/* Practical Presets Row */}
                    <h3 className={`text-xl font-bold mb-6 ml-2 ${textPrimary}`}>Practical Presets</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {PRESETS.map((item) => (
                             <div 
                                key={item.id}
                                onClick={() => handleToolClick(item.tool, item.id)}
                                className={`group p-6 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col items-center text-center
                                    ${isLight 
                                        ? 'bg-blue-50 hover:bg-blue-600 hover:text-white' 
                                        : 'bg-blue-900/10 border border-blue-500/20 hover:bg-blue-600 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-8 h-8 mb-4 ${isLight ? 'text-blue-600 group-hover:text-white' : 'text-blue-400 group-hover:text-white'}`} />
                                <h4 className="font-bold mb-1 text-sm">{item.title}</h4>
                                <p className="text-[10px] opacity-70">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Standard Tools Grid */}
                    <h3 className={`text-xl font-bold mb-6 ml-2 ${textPrimary}`}>All Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {HOME_TOOLS.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => handleToolClick(item.id)}
                                className={`group relative p-8 rounded-[2.5rem] cursor-pointer transition-all duration-300 hover:scale-[1.02]
                                    ${isLight 
                                        ? 'bg-gray-50 hover:bg-black hover:text-white hover:shadow-2xl' 
                                        : 'bg-white/5 border border-white/10 hover:bg-white hover:text-black'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors shadow-lg
                                    ${isLight 
                                        ? 'bg-white text-black group-hover:bg-white/20 group-hover:text-white' 
                                        : 'bg-white/10 text-white group-hover:bg-black group-hover:text-white'
                                    }`}
                                >
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className={`text-2xl font-bold mb-2 ${isLight ? 'text-gray-900 group-hover:text-white' : 'text-white group-hover:text-black'}`}>
                                    {item.title}
                                </h3>
                                <p className={`text-sm font-medium leading-relaxed ${isLight ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    {item.desc}
                                </p>
                                
                                <div className={`absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0`}>
                                    <Upload className="w-6 h-6" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {mode === AppMode.EDITOR && (
            <div className="flex-1 flex h-full min-h-0 animate-in slide-in-from-right duration-500">
                <div className="flex-1 flex flex-col relative bg-noise">
                    <div className="flex-1 relative flex items-center justify-center p-0 md:p-0 overflow-hidden">
                        <Toolbar 
                            onUndo={handleUndo}
                            onRedo={handleRedo}
                            canUndo={historyIndex > 0}
                            canRedo={historyIndex < history.length - 1}
                            scale={editorScale}
                            setScale={setEditorScale}
                            isComparing={isComparing}
                            toggleCompare={() => setIsComparing(!isComparing)}
                            onReset={() => {
                                if(originalImage) {
                                    setHistory([originalImage]);
                                    setHistoryIndex(0);
                                }
                            }}
                            theme={theme}
                            t={t}
                        />

                        <ImageInfoPanel metadata={currentMetadata} theme={theme} t={t} />

                        <div className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-300 ${isLight ? 'bg-gray-100' : 'bg-[#050505]'}`}>
                            {isComparing && previousImage ? (
                                <ComparisonView 
                                    beforeImage={previousImage} 
                                    afterImage={displayedImage!} 
                                    className="w-full h-full"
                                    t={t}
                                />
                            ) : (
                                <ImageCanvas 
                                    ref={canvasRef}
                                    imageUrl={displayedImage!}
                                    isDrawingMode={tool === EditorTool.REMOVE_WATERMARK || tool === EditorTool.INPAINT || tool === EditorTool.CUTOUT}
                                    isCropMode={tool === EditorTool.CROP}
                                    brushSize={brushSize}
                                    className="w-full h-full"
                                    scale={editorScale}
                                    onScaleChange={setEditorScale}
                                />
                            )}

                            {isProcessing && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center flex-col gap-6 z-50">
                                    <div className="relative">
                                        <div className={`w-20 h-20 border-4 rounded-full animate-spin border-t-transparent ${isLight ? 'border-black' : 'border-white'}`}></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className={`w-8 h-8 animate-pulse ${isLight ? 'text-black' : 'text-white'}`} />
                                        </div>
                                    </div>
                                    <span className={`font-bold tracking-widest text-sm animate-pulse uppercase ${isLight ? 'text-black' : 'text-white'}`}>
                                        {t.processing}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <GalleryStrip 
                        history={history}
                        library={library}
                        currentIndex={historyIndex}
                        onSelectHistory={(idx) => {
                            setHistoryIndex(idx);
                            setIsComparing(false);
                        }}
                        onSelectLibrary={handleOpenFromLibrary}
                        onDeleteHistory={handleDeleteHistory}
                        onDeleteLibrary={handleDeleteLibraryItem}
                        onSave={handleSaveCurrentToLibrary}
                        theme={theme}
                        t={t}
                    />
                </div>

                <EditorPanel 
                    tool={tool} 
                    onApply={handleEditorApply}
                    isProcessing={isProcessing}
                    theme={theme}
                    t={t}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    clearMask={() => canvasRef.current?.clearMask()}
                    onUndoBrush={() => canvasRef.current?.undoDraw()}
                    onRedoBrush={() => canvasRef.current?.redoDraw()}
                    originalDimensions={{
                        width: canvasRef.current?.naturalWidth || 0,
                        height: canvasRef.current?.naturalHeight || 0
                    }}
                    onApplyFilter={handleApplyFilter}
                    downloadLayer={downloadCurrent}
                    onSetCropRatio={handleSetCropRatio}
                />
            </div>
        )}
      </main>
    </div>
  );
}
