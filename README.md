# 🧾 Financial AI: Intelligent Document Processing (IDP)

**Transform your financial chaos into structured data.** 
This application leverages state-of-the-art Multimodal AI (Gemini) and specialized Vision models (Hugging Face) to automate the extraction of data from receipts, invoices, and bills.

---

## 🚀 Demo: How to use it

1.  **Add your documents**: 
    *   **Drag and Drop**: Drag receipt images (JPG, PNG) or PDFs onto the app.
    *   **Scan with Camera**: Click the **Camera icon** to take a live photo.
2.  **Start Processing**: Click **"Process All"**. The AI extracts vendor names, dates, amounts, taxes, and categories.
3.  **Review the Data**: View the extracted details in a clean, theme-aware data grid.
4.  **Save your Work**: Click **"Export CSV"** to download your data for Excel/Sheets.

---

## 📚 Technical Documentation

Move beyond the basics and understand the engine under the hood:
- **[Architecture Deep Dive](./ARCHITECTURE.md)**: Explore the data pipeline and system design.
- **[QA Guide](./INTERVIEW_PREP.md)**: Prepare for technical Q&A about OCR, LLMs, and IDP.
- **[Hugging Face Integration Guide](./HUGGINGFACE_GUIDE.md)**: Roadmap for increasing accuracy with specialized models.

---

## ✨ Strategic Highlights

*   **Hybrid AI Strategy**: Uses **Gemini 3 Flash** for speed and logical reasoning, with a roadmap for **Hugging Face (LayoutLM)** verification.
*   **Multimodal OCR**: No more "OCR-then-LLM" steps. The vision model reads the page directly, preserving spatial context.
*   **Privacy-First**: No backend storage. All processing happens in-memory and via secure inference endpoints.
*   **Zero-Maintenance Architecture**: 100% serverless client-side React app.

---

## 🛠️ Built With

- **AI**: Gemini API (`gemini-3-flash-preview`)
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion (`motion/react`)
- **Icons**: Lucide React

---

## 📲 Local Setup

1.  **Clone & Install**: `npm install`
2.  **Environment**: Add `GEMINI_API_KEY` to your secrets/env.
3.  **Run**: `npm run dev`

