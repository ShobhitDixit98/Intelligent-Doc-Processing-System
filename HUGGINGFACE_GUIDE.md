# Increasing IDP Accuracy with Hugging Face

Gemini is excellent for high-level reasoning, but specialized **Hugging Face** models can significantly improve accuracy for complex document structures, handwriting, or low-quality scans.

## 1. Top Recommended Models for IDP

| Model Name | Task | Why use it? |
| :--- | :--- | :--- |
| **Donut** (`naver-clova-ix/donut-base-finetuned-receiptv1`) | OCR-free extraction | Reads images directly into JSON. Great for receipts. |
| **LayoutLMv3** (`microsoft/layoutlmv3-base`) | Document Layout | Understands context (e.g., "Total" is always near a large number). |
| **LiLT** (`nielsr/lilt-roberta-en-base`) | Language Layout | Extremely efficient for multilingual invoices. |
| **TrOCR** (`microsoft/trocr-base-printed`) | Specialized OCR | Superior for reading blurry or pixelated text compared to general vision models. |

---

## 2. Implementation: The Hybrid Pipeline

The most accurate way to build an IDP system today is a **Pipeline**:

1.  **Hugging Face (Layout Component)**: Identify where the boxes are and what the raw text is.
2.  **Gemini (Reasoner)**: Take that raw "alphabet soup" and turn it into clean financial data.

### Example Code (using HF Inference API)

You can add this to your `src/lib/` to supplement Gemini:

```typescript
const HF_TOKEN = "your_huggingface_token";

async function queryHuggingFace(blob: Blob) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/naver-clova-ix/donut-base-finetuned-receiptv1",
    {
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
      method: "POST",
      body: blob,
    }
  );
  const result = await response.json();
  return result;
}
```

---

## 3. Running Models in the Browser (zero-latency)

You can use the `@xenova/transformers` library (Transformers.js) to run these models directly in your Vite app without a backend.

**Benefits:**
- **Privacy**: Data never leaves the user's browser.
- **Cost**: $0 server cost as it uses the user's CPU/GPU.
- **Accuracy**: You can run a small model to "denoise" the image before sending it to Gemini.

### Recommended Tooling:
1.  **Tesseract.js**: For standard OCR.
2.  **Transformers.js**: For vision-to-text models like Donut.

## 4. Best Practices for High Accuracy
- **Image Pre-processing**: Use `canvas` to convert images to grayscale and increase contrast before sending to any AI.
- **Confidence Scoring**: Compare the results of Gemini and a Hugging Face model. If they disagree, flag the document for "Human Review."
- **Fine-tuning**: If you have 500+ samples of your specific company invoices, you can "fine-tune" a Hugging Face model to achieve near 100% accuracy for that specific layout.
