
import { GoogleGenAI, Type } from "@google/genai";
import { SmartSuggestion } from "../types";

export const analyzeTask = async (description: string, category: string): Promise<SmartSuggestion> => {
  try {
    // Create a new instance right before making an API call to ensure it uses the most up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User wants a ${category} service with the description: "${description}". 
      Help refine this description for a professional provider, estimate hours, and list tools needed.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedDescription: { type: Type.STRING },
            estimatedHours: { type: Type.NUMBER },
            suggestedTools: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["refinedDescription", "estimatedHours", "suggestedTools"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
      refinedDescription: json.refinedDescription || description,
      estimatedHours: json.estimatedHours || 1,
      suggestedTools: json.suggestedTools || []
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      refinedDescription: description,
      estimatedHours: 1,
      suggestedTools: []
    };
  }
};
