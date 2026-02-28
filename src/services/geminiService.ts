import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getCropAdvice(query: string, context?: any) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `As an expert agricultural consultant, answer this farmer's question: ${query}. 
    Context about their farm: ${JSON.stringify(context || {})}.
    Provide practical, sustainable, and actionable advice.`,
    config: {
      systemInstruction: "You are AgriSmart AI, a helpful and knowledgeable agricultural expert. You help farmers with crop selection, pest control, soil health, and market trends. Use a friendly and encouraging tone.",
    }
  });
  return response.text;
}

export async function diagnosePlant(base64Image: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: "Analyze this plant image. Identify the plant, detect any diseases or pests, and provide a treatment plan. Format the output as JSON." },
        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plantName: { type: Type.STRING },
          healthStatus: { type: Type.STRING, description: "Healthy, Diseased, or Pest Infestation" },
          diagnosis: { type: Type.STRING },
          treatment: { type: Type.ARRAY, items: { type: Type.STRING } },
          urgency: { type: Type.STRING, description: "Low, Medium, High" }
        },
        required: ["plantName", "healthStatus", "diagnosis", "treatment", "urgency"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
}

export async function getMarketTrends() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Provide current global market trends for major crops like Wheat, Rice, Corn, and Soybeans. Include a brief outlook for the next month. Format as JSON.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            crop: { type: Type.STRING },
            priceTrend: { type: Type.STRING, description: "Rising, Falling, or Stable" },
            currentPrice: { type: Type.STRING },
            outlook: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
}
