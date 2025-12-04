
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

interface ImageCanvasProps {
  imageUrl: string;
  isDrawingMode: boolean;
  brushSize: number;
  className?: string;
  scale: number; // Controlled by toolbar
  onScaleChange: (newScale: number) => void;
  isCropMode?: boolean;
}

export interface ImageCanvasRef {
  getCompositeImage: (maskColor: string) => Promise<string>;
  getOriginalImageWithSize: (width: number, height: number, color?: string) => Promise<string>;
  clearMask: () => void;
  naturalWidth: number;
  naturalHeight: number;
  getCropCoordinates: () => { x: number, y: number, width: number, height: number } | null;
  setCropRect: (rect: { x: number, y: number, width: number, height: number }) => void;
  undoDraw: () => void;
  redoDraw: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

type DragHandle = 'center' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e' | null;
type Point = { x: number, y: number };
type Stroke = { points: Point[], size: number };

export const ImageCanvas = forwardRef<ImageCanvasRef, ImageCanvasProps>(({ 
  imageUrl, 
  isDrawingMode, 
  brushSize,
  className,
  scale = 1,
  onScaleChange,
  isCropMode = false
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // Pan offset
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [renderDims, setRenderDims] = useState({ width: 0, height: 0 });
  const [imgScale, setImgScale] = useState(1); 
  const [isDrawing, setIsDrawing] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Drawing History
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const currentStrokeRef = useRef<Point[]>([]);

  // Crop State (Percentages 0-1)
  const [cropRect, setCropRect] = useState({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const [dragHandle, setDragHandle] = useState<DragHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startRect, setStartRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!imageUrl) return;
    setImgLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      setImgLoaded(true);
      // Reset zoom/pan on new image
      setOffset({ x: 0, y: 0 });
      onScaleChange(1); 
      calculateDimensions();
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => calculateDimensions());
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [imgLoaded]);

  useEffect(() => {
    calculateDimensions();
  }, [scale]); // Re-calc when zoom changes

  // Redraw canvas whenever strokes change or resize happens
  useEffect(() => {
      redrawCanvas();
  }, [strokes, historyStep, renderDims]); 

  const calculateDimensions = () => {
    if (!containerRef.current || !imageRef.current) return;
    const container = containerRef.current;
    const img = imageRef.current;
    if (container.clientWidth === 0 || container.clientHeight === 0) return;

    const containerAspect = container.clientWidth / container.clientHeight;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    let baseWidth, baseHeight;
    // Fit image logic (contain)
    if (containerAspect > imgAspect) {
      baseHeight = container.clientHeight * 0.9; // 90% fit
      baseWidth = baseHeight * imgAspect;
    } else {
      baseWidth = container.clientWidth * 0.9;
      baseHeight = baseWidth / imgAspect;
    }

    // Apply Zoom Scale
    const targetWidth = baseWidth * scale;
    const targetHeight = baseHeight * scale;

    setRenderDims({ width: targetWidth, height: targetHeight });
    setImgScale(img.naturalWidth / targetWidth); 

    if (canvasRef.current) {
        canvasRef.current.width = img.naturalWidth;
        canvasRef.current.height = img.naturalHeight;
        redrawCanvas();
    }
  };

  const redrawCanvas = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';

      strokes.slice(0, historyStep + 1).forEach(stroke => {
          if (stroke.points.length < 1) return;
          ctx.beginPath();
          ctx.lineWidth = stroke.size;
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
              ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
      });
  };

  // --- Zoom & Pan Logic ---
  const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey || !isDrawingMode) {
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          const newScale = Math.max(0.1, Math.min(5, scale + delta));
          onScaleChange(newScale);
      }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button === 1 || (!isDrawingMode && !isCropMode && e.button === 0)) { // Middle mouse or Left click when not editing
          e.preventDefault();
          setIsPanning(true);
          setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      } else if (isDrawingMode && e.button === 0) {
          startDrawing(e);
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (isPanning) {
          setOffset({
              x: e.clientX - panStart.x,
              y: e.clientY - panStart.y
          });
      } else if (isDrawing) {
          draw(e);
      }
  };

  const handleMouseUp = () => {
      setIsPanning(false);
      stopDrawing();
  };

  // --- Drawing Logic ---
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    return {
      x: (clientX - rect.left) * imgScale,
      y: (clientY - rect.top) * imgScale
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingMode || !canvasRef.current) return;
    setIsDrawing(true);
    if (historyStep < strokes.length - 1) {
        setStrokes(prev => prev.slice(0, historyStep + 1));
    }
    const { x, y } = getCoordinates(e);
    currentStrokeRef.current = [{ x, y }];
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize * imgScale;
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isDrawingMode || !canvasRef.current) return;
    const { x, y } = getCoordinates(e);
    currentStrokeRef.current.push({ x, y });
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) { ctx.lineTo(x, y); ctx.stroke(); }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    canvasRef.current?.getContext('2d')?.closePath();
    if (currentStrokeRef.current.length > 0) {
        const newStroke: Stroke = {
            points: [...currentStrokeRef.current],
            size: brushSize * imgScale
        };
        setStrokes(prev => [...prev, newStroke]);
        setHistoryStep(prev => prev + 1);
    }
    currentStrokeRef.current = [];
  };

  // --- Crop Logic ---
  const handleCropMouseDown = (e: React.MouseEvent, handle: DragHandle) => {
      e.stopPropagation();
      setDragHandle(handle);
      setDragStart({ x: e.clientX, y: e.clientY });
      setStartRect({ ...cropRect });
  };
  
  const handleCropMouseMove = (e: React.MouseEvent) => {
      if (!dragHandle || !renderDims.width) return;
      e.stopPropagation();
      e.preventDefault();
      
      const dx = (e.clientX - dragStart.x) / renderDims.width;
      const dy = (e.clientY - dragStart.y) / renderDims.height;
      
      let newX = startRect.x;
      let newY = startRect.y;
      let newW = startRect.width;
      let newH = startRect.height;

      // Basic resize logic (can expand freely now)
      if (dragHandle === 'center') {
          newX = startRect.x + dx;
          newY = startRect.y + dy;
      } else {
          if (dragHandle.includes('w')) {
              newX = startRect.x + dx;
              newW = startRect.width - dx;
          }
          if (dragHandle.includes('e')) {
              newW = startRect.width + dx;
          }
          if (dragHandle.includes('n')) {
              newY = startRect.y + dy;
              newH = startRect.height - dy;
          }
          if (dragHandle.includes('s')) {
              newH = startRect.height + dy;
          }
      }

      // Constrain to 0-1 for simplicity, or allow slight over-drag if implementing padding later
      newX = Math.max(0, Math.min(1 - newW, newX));
      newY = Math.max(0, Math.min(1 - newH, newY));
      newW = Math.max(0.05, Math.min(1 - newX, newW));
      newH = Math.max(0.05, Math.min(1 - newY, newH));

      setCropRect({ x: newX, y: newY, width: newW, height: newH });
  };

  const handleCropMouseUp = () => {
      setDragHandle(null);
  };

  useImperativeHandle(ref, () => ({
    getCompositeImage: async (maskColor: string) => {
      if (!imageRef.current || !canvasRef.current) return '';
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageRef.current.naturalWidth;
      tempCanvas.height = imageRef.current.naturalHeight;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return '';
      ctx.drawImage(imageRef.current, 0, 0);
      ctx.drawImage(canvasRef.current, 0, 0);
      return tempCanvas.toDataURL('image/png');
    },
    getOriginalImageWithSize: async (width: number, height: number, bgColor: string = '#000000') => {
        if (!imageRef.current) return '';
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext('2d');
        if(!ctx) return '';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        const dx = (width - imageRef.current.naturalWidth) / 2;
        const dy = (height - imageRef.current.naturalHeight) / 2;
        ctx.drawImage(imageRef.current, dx, dy);
        return tempCanvas.toDataURL('image/png');
    },
    clearMask: () => {
      setStrokes([]);
      setHistoryStep(-1);
    },
    undoDraw: () => setHistoryStep(prev => Math.max(-1, prev - 1)),
    redoDraw: () => setHistoryStep(prev => Math.min(strokes.length - 1, prev + 1)),
    canUndo: () => historyStep >= 0,
    canRedo: () => historyStep < strokes.length - 1,
    getCropCoordinates: () => cropRect,
    setCropRect: (rect) => setCropRect(rect),
    naturalWidth: imageRef.current?.naturalWidth || 0,
    naturalHeight: imageRef.current?.naturalHeight || 0
  }));

  const checkerboardStyle = {
    backgroundImage: `linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)`,
    backgroundSize: '20px 20px',
    backgroundColor: '#1a1a1a'
  };

  const renderHandle = (pos: DragHandle, cursor: string, style: React.CSSProperties) => (
      <div 
         className={`absolute w-3 h-3 bg-white border border-blue-600 rounded-full z-30 pointer-events-auto ${cursor}`}
         style={style}
         onMouseDown={(e) => handleCropMouseDown(e, pos)}
      />
  );

  return (
    <div 
        ref={containerRef} 
        className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${className}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
      <div 
        className="relative shadow-2xl transition-transform duration-75 ease-out origin-center"
        style={{ 
            width: renderDims.width, 
            height: renderDims.height,
            transform: `translate(${offset.x}px, ${offset.y}px)` 
        }}
      >
        <div className="absolute inset-0 w-full h-full" style={checkerboardStyle} />
        {imgLoaded && renderDims.width > 0 && (
            <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }} />
        )}
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full z-10 touch-none ${isDrawingMode ? 'cursor-crosshair' : 'pointer-events-none'}`}
        />

        {/* Crop Overlay */}
        {isCropMode && (
            <div 
                className="absolute inset-0 z-20 overflow-visible pointer-events-none"
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
            >
                <div className="absolute inset-0 bg-black/60 pointer-events-auto" />
                <div 
                    className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] cursor-move pointer-events-auto group"
                    style={{
                        left: `${cropRect.x * 100}%`,
                        top: `${cropRect.y * 100}%`,
                        width: `${cropRect.width * 100}%`,
                        height: `${cropRect.height * 100}%`
                    }}
                    onMouseDown={(e) => handleCropMouseDown(e, 'center')}
                >
                    {/* Resolution Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                        {Math.round(cropRect.width * (imageRef.current?.naturalWidth || 0))} x {Math.round(cropRect.height * (imageRef.current?.naturalHeight || 0))} px
                    </div>

                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-50">
                         <div className="border-r border-b border-white/30" />
                         <div className="border-r border-b border-white/30" />
                         <div className="border-b border-white/30" />
                         <div className="border-r border-b border-white/30" />
                         <div className="border-r border-b border-white/30" />
                         <div className="border-b border-white/30" />
                         <div className="border-r border-white/30" />
                         <div className="border-r border-white/30" />
                    </div>

                    {renderHandle('nw', 'cursor-nw-resize', { top: -6, left: -6 })}
                    {renderHandle('n', 'cursor-n-resize', { top: -6, left: '50%', marginLeft: -6 })}
                    {renderHandle('ne', 'cursor-ne-resize', { top: -6, right: -6 })}
                    {renderHandle('w', 'cursor-w-resize', { top: '50%', left: -6, marginTop: -6 })}
                    {renderHandle('e', 'cursor-e-resize', { top: '50%', right: -6, marginTop: -6 })}
                    {renderHandle('sw', 'cursor-sw-resize', { bottom: -6, left: -6 })}
                    {renderHandle('s', 'cursor-s-resize', { bottom: -6, left: '50%', marginLeft: -6 })}
                    {renderHandle('se', 'cursor-se-resize', { bottom: -6, right: -6 })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
});
