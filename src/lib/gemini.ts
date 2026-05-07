import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ExtractedData {
  documentType: string;
  confidence: number;
  entities: {
    vendorName?: string;
    date?: string;
    time?: string;
    totalAmount?: number;
    currency?: string;
    invoiceNumber?: string;
    taxAmount?: number;
    category?: string;
    description?: string;
  };
  summary: string;
}

export async function processDocument(base64Data: string, mimeType: string): Promise<ExtractedData> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `You are an expert Intelligent Document Processing (IDP) system specializing in financial documents and receipts.
  Analyze the provided document and extract the following information in JSON format:
  
  1. documentType: Classify (e.g., Receipt, Invoice).
  2. confidence: Score from 0 to 1.
  3. entities:
     - vendorName: Merchant name.
     - date: Transaction date (ISO format).
     - time: Transaction time (e.g., 14:30).
     - totalAmount: Final total as a number.
     - currency: Symbol/code (USD, etc).
     - category: One of [Grocery, Taxi, Restaurant, Utilities, Travel, Shopping, Other].
     - description: A short summary of the main items purchased (max 10 words).
     - taxAmount: Tax amount if listed.
  4. summary: One-sentence summary.
  
  Return ONLY valid JSON.`;

  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentType: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            entities: {
              type: Type.OBJECT,
              properties: {
                vendorName: { type: Type.STRING },
                date: { type: Type.STRING },
                time: { type: Type.STRING },
                totalAmount: { type: Type.NUMBER },
                currency: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                taxAmount: { type: Type.NUMBER }
              }
            },
            summary: { type: Type.STRING }
          },
          required: ["documentType", "confidence", "entities", "summary"]
        }
      }
    });

    const text = result.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as ExtractedData;
  } catch (error) {
    console.error("Gemini IDP Error:", error);
    throw error;
  }
}
