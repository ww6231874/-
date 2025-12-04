
import { GoogleGenAI, Type } from "@google/genai";
import { ImageStyle } from "../types";

// Helper to remove data URL prefix
const stripBase64Prefix = (base64: string) => {
  return base64.replace(/^data:image\/[a-z]+;base64,/, "");
};

const getMimeType = (base64: string) => {
  const match = base64.match(/^data:(image\/[a-z]+);base64,/);
  return match ? match[1] : "image/jpeg";
};

/**
 * Converts an image base64 string to a Gemini-compatible format (JPEG) if necessary.
 */
const ensureCompatibleImage = async (base64: string): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const currentMime = getMimeType(base64);
    if (currentMime === 'image/jpeg' || currentMime === 'image/png' || currentMime === 'image/webp') {
       resolve({
           data: stripBase64Prefix(base64),
           mimeType: currentMime
       });
       return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Canvas context failed"));
        return;
      }
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const newBase64 = canvas.toDataURL('image/jpeg', 0.9);
      resolve({
          data: stripBase64Prefix(newBase64),
          mimeType: 'image/jpeg'
      });
    };
    img.onerror = (e) => reject(new Error("Image conversion failed: " + e));
    img.src = base64;
  });
};

export const analyzeImage = async (base64Image: string): Promise<{ description: string; tags: string[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";
    const { data, mimeType } = await ensureCompatibleImage(base64Image);

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: data } },
          { text: "Analyze this image. Return a JSON object with a detailed 'description' (max 50 words) suitable for generating similar images, and a list of 5 relevant 'tags'." },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["description", "tags"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Analysis failed:", error);
    return { description: "Analysis failed", tags: [] };
  }
};

export const editImage = async (
  base64Image: string,
  instruction: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1",
  modelName: string = "gemini-2.5-flash-image"
): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const { data, mimeType } = await ensureCompatibleImage(base64Image);

    console.log(`Sending edit request. Model: ${modelName}. Aspect Ratio: ${aspectRatio}.`);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: data } },
          { text: instruction },
        ],
      },
      config: {
        imageConfig: { aspectRatio: aspectRatio }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    if (response.text) {
        console.warn("Model returned text instead of image:", response.text);
    }
    
    return null;
  } catch (error) {
    console.error("Edit failed:", error);
    throw error;
  }
};
