
import { LUTPreset } from '../types';

/**
 * Formats bytes into human readable string
 */
export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Estimates file size from Base64 string
 */
export const getBase64Size = (base64String: string) => {
  let padding = 0;
  if (base64String.endsWith('==')) padding = 2;
  else if (base64String.endsWith('=')) padding = 1;
  return (base64String.length * (3 / 4)) - padding;
};

/**
 * RGB to Hex helper
 */
const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Extracts a dominant color palette using quantization
 */
export const extractPalette = (img: HTMLImageElement, colorCount: number = 5): string[] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  // Downsample strictly for speed but keep enough info
  const size = 100;
  canvas.width = size;
  canvas.height = size * (img.height / img.width);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const colorMap: Record<string, number> = {};

  // Quantize colors (round to nearest 32 to group similar shades)
  const quantization = 32;
  
  for (let i = 0; i < imageData.length; i += 4) {
    const r = Math.floor(imageData[i] / quantization) * quantization;
    const g = Math.floor(imageData[i + 1] / quantization) * quantization;
    const b = Math.floor(imageData[i + 2] / quantization) * quantization;
    const a = imageData[i + 3];

    if (a < 128) continue; // Skip transparent pixels

    const key = `${r},${g},${b}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
  }

  // Sort by frequency
  return Object.entries(colorMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, colorCount)
    .map(([color]) => {
      const [r, g, b] = color.split(',').map(Number);
      return rgbToHex(r, g, b);
    });
};

export const getImageMetadata = async (src: string): Promise<{ width: number, height: number, size: string, format: string, palette: string[] }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
      const sizeBytes = getBase64Size(src);
      const palette = extractPalette(img);
      
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: formatBytes(sizeBytes),
        format: src.substring(src.indexOf('/') + 1, src.indexOf(';')).toUpperCase(),
        palette
      });
    };
  });
};

/**
 * Applies CSS filters to an image and returns base64.
 * Supports intensity (opacity) blending (0-100).
 */
export const applyImageFilter = async (src: string, filterString: string, intensity: number = 100): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
          reject("No context");
          return;
      }
      
      // Draw original base layer
      ctx.drawImage(img, 0, 0);

      // If intensity > 0, draw the filtered version on top
      if (intensity > 0) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext('2d');
          if (!tempCtx) {
              reject("No temp context");
              return;
          }

          tempCtx.filter = filterString;
          tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

          // Blend with globalAlpha
          ctx.globalAlpha = intensity / 100;
          ctx.drawImage(tempCanvas, 0, 0);
          ctx.globalAlpha = 1.0; // Reset
      }
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
  });
};

/**
 * Crops an image based on percentage coordinates (0-1)
 */
export const cropImage = async (src: string, crop: { x: number, y: number, width: number, height: number }): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const pixelX = Math.floor(crop.x * img.naturalWidth);
      const pixelY = Math.floor(crop.y * img.naturalHeight);
      const pixelW = Math.floor(crop.width * img.naturalWidth);
      const pixelH = Math.floor(crop.height * img.naturalHeight);

      // Ensure valid dimensions
      if (pixelW <= 0 || pixelH <= 0) {
          resolve(src);
          return;
      }

      canvas.width = pixelW;
      canvas.height = pixelH;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject("No context"); return; }

      ctx.drawImage(img, pixelX, pixelY, pixelW, pixelH, 0, 0, pixelW, pixelH);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
  });
};

/**
 * Pads an image to match a specific aspect ratio to avoid AI distortion.
 */
export const padImageToAspectRatio = async (
  src: string, 
  ratio: number // width / height
): Promise<{ image: string, cropRect: { x: number, y: number, width: number, height: number } }> => {
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = src;
      img.onload = () => {
          const currentRatio = img.naturalWidth / img.naturalHeight;
          let targetW = img.naturalWidth;
          let targetH = img.naturalHeight;

          // If current is wider than target ratio, we need to increase height (pad top/bottom)
          if (currentRatio > ratio) {
              targetH = targetW / ratio;
          } else {
              // Current is taller than target, increase width (pad left/right)
              targetW = targetH * ratio;
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(targetW);
          canvas.height = Math.ceil(targetH);
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject("No context"); return; }

          // Fill with black (easy for mask separation if needed, though we use binary mask prompt)
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Center image
          const dx = (targetW - img.naturalWidth) / 2;
          const dy = (targetH - img.naturalHeight) / 2;
          ctx.drawImage(img, dx, dy);

          // Calculate where the original image is relative to the new padded canvas (percentages)
          const cropRect = {
              x: dx / targetW,
              y: dy / targetH,
              width: img.naturalWidth / targetW,
              height: img.naturalHeight / targetH
          };

          resolve({ image: canvas.toDataURL('image/png'), cropRect });
      };
      img.onerror = reject;
  });
};

/**
 * Applies a Luminance Mask (generated by AI) to the original image.
 * 1. Un-pads the mask using cropRect.
 * 2. Resizes mask to strictly match original image dimensions.
 * 3. Uses mask brightness to set Alpha of original image.
 */
export const applyLuminanceMask = async (
  originalSrc: string,
  maskSrc: string,
  cropRect: { x: number, y: number, width: number, height: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
      // Load both images
      const originalImg = new Image();
      const maskImg = new Image();
      originalImg.crossOrigin = "Anonymous";
      maskImg.crossOrigin = "Anonymous";

      let loadedCount = 0;
      const onLoad = () => {
          loadedCount++;
          if (loadedCount === 2) process();
      };

      originalImg.onload = onLoad;
      maskImg.onload = onLoad;
      originalImg.src = originalSrc;
      maskImg.src = maskSrc;

      const process = () => {
          // 1. Recover the relevant part of the mask (Un-pad)
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = originalImg.naturalWidth;
          maskCanvas.height = originalImg.naturalHeight;
          const maskCtx = maskCanvas.getContext('2d');
          if (!maskCtx) return;

          // Draw the part of the mask defined by cropRect into the full size of the original image
          // source x,y,w,h -> dest x,y,w,h
          const sx = cropRect.x * maskImg.naturalWidth;
          const sy = cropRect.y * maskImg.naturalHeight;
          const sw = cropRect.width * maskImg.naturalWidth;
          const sh = cropRect.height * maskImg.naturalHeight;
          
          maskCtx.drawImage(maskImg, sx, sy, sw, sh, 0, 0, maskCanvas.width, maskCanvas.height);
          
          // Get mask data (grayscale)
          const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

          // 2. Prepare Final Output
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = originalImg.naturalWidth;
          finalCanvas.height = originalImg.naturalHeight;
          const finalCtx = finalCanvas.getContext('2d');
          if (!finalCtx) return;

          // Draw original image
          finalCtx.drawImage(originalImg, 0, 0);
          const originalData = finalCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);

          // 3. Apply Alpha based on Luminance
          for (let i = 0; i < originalData.data.length; i += 4) {
              // Luminance: 0.299*R + 0.587*G + 0.114*B
              const r = maskData.data[i];
              const g = maskData.data[i+1];
              const b = maskData.data[i+2];
              const luminance = (0.299*r + 0.587*g + 0.114*b);
              
              // Threshold/Softness can be adjusted. Assuming White (255) is keep, Black (0) is remove.
              // We can just use luminance as alpha directly for smooth edges.
              originalData.data[i+3] = luminance; 
          }

          finalCtx.putImageData(originalData, 0, 0);
          resolve(finalCanvas.toDataURL('image/png'));
      };
  });
};

// --- LUT PRESETS ---
export const LUT_PRESETS: LUTPreset[] = [
  { id: 'none', name: 'Original', filter: 'none', thumbnailColor: '#888' },
  // 1-10: Cinematic & Film
  { id: 'cinema1', name: 'Cinema Cool', filter: 'contrast(1.1) brightness(0.9) saturate(1.2) hue-rotate(-10deg)', thumbnailColor: '#6b8cce' },
  { id: 'cinema2', name: 'Teal & Orange', filter: 'contrast(1.2) saturate(1.4) hue-rotate(-15deg) sepia(0.2)', thumbnailColor: '#d68a59' },
  { id: 'film1', name: 'Vintage Film', filter: 'sepia(0.4) contrast(1.2) brightness(0.9) saturate(0.8)', thumbnailColor: '#cda882' },
  { id: 'film2', name: 'Kodak', filter: 'contrast(1.3) saturate(1.5) brightness(1.1)', thumbnailColor: '#e6c657' },
  { id: 'drama', name: 'Dramatic', filter: 'contrast(1.5) saturate(0.8) brightness(0.8)', thumbnailColor: '#4a4a4a' },
  { id: 'noir', name: 'Noir', filter: 'grayscale(1) contrast(1.5) brightness(0.9)', thumbnailColor: '#222' },
  { id: 'fade', name: 'Faded', filter: 'contrast(0.9) brightness(1.2) sepia(0.2) saturate(0.8)', thumbnailColor: '#d1c7bd' },
  { id: 'warm', name: 'Warmth', filter: 'sepia(0.3) saturate(1.3) brightness(1.05)', thumbnailColor: '#e09f58' },
  { id: 'cool', name: 'Cold', filter: 'hue-rotate(180deg) sepia(0.1) brightness(1.1) opacity(0.9)', thumbnailColor: '#7895cb' },
  { id: 'matte', name: 'Matte Black', filter: 'grayscale(1) brightness(1.3) contrast(0.8)', thumbnailColor: '#666' },

  // 11-20: Instagram Styles
  { id: 'clarendon', name: 'Clarendon', filter: 'contrast(1.2) saturate(1.35) brightness(1.1)', thumbnailColor: '#8fb1cc' },
  { id: 'gingham', name: 'Gingham', filter: 'brightness(1.05) hue-rotate(-10deg) sepia(0.1)', thumbnailColor: '#ddd' },
  { id: 'moon', name: 'Moon', filter: 'grayscale(1) contrast(1.1) brightness(1.1)', thumbnailColor: '#ccc' },
  { id: 'lark', name: 'Lark', filter: 'contrast(0.9) brightness(1.1) saturate(1.1)', thumbnailColor: '#b8c9d9' },
  { id: 'reyes', name: 'Reyes', filter: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)', thumbnailColor: '#e3d2c1' },
  { id: 'juno', name: 'Juno', filter: 'contrast(1.15) brightness(1.15) saturate(1.4) sepia(0.35) hue-rotate(-10deg)', thumbnailColor: '#d99cba' },
  { id: 'slumber', name: 'Slumber', filter: 'brightness(1.05) saturate(0.66) sepia(0.35)', thumbnailColor: '#857662' },
  { id: 'crema', name: 'Crema', filter: 'contrast(0.9) brightness(1.15) saturate(0.9) sepia(0.15)', thumbnailColor: '#e6dec8' },
  { id: 'ludwig', name: 'Ludwig', filter: 'brightness(1.05) contrast(0.9) saturate(1.3) sepia(0.15)', thumbnailColor: '#d69e85' },
  { id: 'aden', name: 'Aden', filter: 'hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)', thumbnailColor: '#c9a4ae' },

  // 21-30: Artistic
  { id: 'pop', name: 'Pop Art', filter: 'saturate(2.5) contrast(1.2) brightness(1.1)', thumbnailColor: '#ff4081' },
  { id: 'cyber', name: 'Cyberpunk', filter: 'hue-rotate(45deg) contrast(1.3) saturate(2)', thumbnailColor: '#a12aff' },
  { id: 'dream', name: 'Dreamy', filter: 'blur(1px) brightness(1.2) saturate(1.2) contrast(0.9)', thumbnailColor: '#f7d6e0' },
  { id: 'matrix', name: 'Matrix', filter: 'hue-rotate(90deg) contrast(1.5) saturate(1.5) brightness(0.8)', thumbnailColor: '#0f0' },
  { id: 'invert', name: 'X-Ray', filter: 'invert(1)', thumbnailColor: '#fff' },
  { id: 'sketch', name: 'Pencil', filter: 'grayscale(1) contrast(5) brightness(1.5)', thumbnailColor: '#eee' },
  { id: 'sepia', name: 'Old Photo', filter: 'sepia(1) contrast(1.2)', thumbnailColor: '#704214' },
  { id: 'bleach', name: 'Bleach Bypass', filter: 'contrast(1.5) saturate(0.2)', thumbnailColor: '#777' },
  { id: 'hdr', name: 'HDR', filter: 'contrast(1.5) saturate(1.5) brightness(0.9) drop-shadow(0 0 1px #000)', thumbnailColor: '#888' },
  { id: 'sharp', name: 'Sharpen', filter: 'contrast(1.3) brightness(1.1)', thumbnailColor: '#aaa' },

  // 31-40: Colors
  { id: 'red', name: 'Rose', filter: 'sepia(0.5) hue-rotate(320deg) saturate(1.5)', thumbnailColor: '#f00' },
  { id: 'green', name: 'Mint', filter: 'sepia(0.5) hue-rotate(100deg) saturate(1.2)', thumbnailColor: '#0f0' },
  { id: 'blue', name: 'Ice', filter: 'sepia(0.5) hue-rotate(180deg) saturate(1.5)', thumbnailColor: '#00f' },
  { id: 'purple', name: 'Violet', filter: 'sepia(0.5) hue-rotate(240deg) saturate(1.5)', thumbnailColor: '#f0f' },
  { id: 'golden', name: 'Golden Hour', filter: 'sepia(0.4) saturate(2) contrast(1.1)', thumbnailColor: '#ffd700' },
  { id: 'dark', name: 'Darken', filter: 'brightness(0.7)', thumbnailColor: '#333' },
  { id: 'light', name: 'Lighten', filter: 'brightness(1.3)', thumbnailColor: '#ddd' },
  { id: 'flat', name: 'Flat', filter: 'contrast(0.7) brightness(1.1)', thumbnailColor: '#999' },
  { id: 'deep', name: 'Deep Blue', filter: 'brightness(0.8) hue-rotate(200deg) contrast(1.2)', thumbnailColor: '#003366' },
  { id: 'sunset', name: 'Sunset', filter: 'brightness(0.9) sepia(0.5) hue-rotate(-30deg) saturate(2)', thumbnailColor: '#ff6600' }
];
