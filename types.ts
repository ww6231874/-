
export enum AppMode {
  HOME = 'HOME',
  EDITOR = 'EDITOR',
  INSPIRATION = 'INSPIRATION',
}

export enum ImageStyle {
  CG = 'CG / 3D Render',
  REALISTIC = 'Realistic Photography',
  COMPOSITE = 'Digital Composite',
  AI = 'AI Art / Stylized',
}

export enum EditorTool {
  NONE = 'NONE',
  CROP = 'CROP',
  UPSCALE = 'UPSCALE',
  REMOVE_WATERMARK = 'REMOVE_WATERMARK',
  CUTOUT = 'CUTOUT',
  INPAINT = 'INPAINT',
  OUTPAINT = 'OUTPAINT',
  COLOR = 'COLOR'
}

export interface GeneratedImage {
  id: string;
  url: string;
  style: ImageStyle;
  description: string;
}

export interface ImageAnalysis {
  description: string;
  tags: string[];
  suggestedStyle: ImageStyle;
}

export interface OutpaintSettings {
  width: number;
  height: number;
  keepBackground: boolean;
}

export interface ImageMetadata {
  width: number;
  height: number;
  size: string; // e.g., "2.4 MB"
  format: string; // e.g., "PNG"
  palette: string[]; // Hex codes
}

export interface LUTPreset {
  id: string;
  name: string;
  filter: string; // CSS filter string
  thumbnailColor?: string;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  image: string; // base64
}

export interface LibraryImage {
  id: string;
  url: string;
  timestamp: number;
  metadata?: ImageMetadata;
}

export type Language = 'en' | 'zh';
export type AppTheme = 'dark' | 'light';