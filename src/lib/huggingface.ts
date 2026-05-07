/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * HUGGING FACE HYBRID INTEGRATION
 * 
 * This module provides a secondary extraction path using specialized 
 * Small Language Models (SLMs) from Hugging Face. 
 * 
 * Recommended Models:
 * - Donut (naver-clova-ix/donut-base-finetuned-receiptv1)
 * - LayoutLMv3 (microsoft/layoutlmv3-base)
 */

interface HFExtractionResponse {
  answer?: string;
  score?: number;
  [key: string]: any;
}

/**
 * Calls the Hugging Face Inference API for Document Question Answering (DocVQA).
 * Note: Requires a HUGGING_FACE_TOKEN in your environment.
 */
export async function extractWithHuggingFace(
  base64Image: string, 
  prompt: string = "What is the total amount and store name?"
): Promise<HFExtractionResponse | null> {
  const token = (import.meta as any).env.VITE_HF_TOKEN;
  
  if (!token) {
    console.warn("Hugging Face Token missing. Skipping hybrid verification.");
    return null;
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/naver-clova-ix/donut-base-finetuned-receiptv1",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: {
            image: base64Image,
            question: prompt
          },
        }),
      }
    );

    if (!response.ok) throw new Error("HF API Error");
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Hugging Face extraction failed:", error);
    return null;
  }
}

/**
 * LOGIC FOR INTERVIEW:
 * Why use this instead of just Gemini?
 * 1. Verification: Cross-check Gemini's 'Total' with Donut's 'Total'. If they differ, flag for review.
 * 2. Specialized OCR: Donut is specifically trained on 1M+ receipts, often beating general models on thermal paper text.
 */
