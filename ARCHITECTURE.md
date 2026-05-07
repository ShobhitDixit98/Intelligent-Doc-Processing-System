# Application Architecture & Data Pipeline

This document describes the high-level architecture and the technical pipeline used in the **Intelligent Document Processing (IDP) System**.

## 🏗️ High-Level Architecture

The application follows a modern **Client-Side SPA (Single Page Application)** architecture with integrated AI services. It is designed to be lightweight, fast, and secure by processing all data directly between the browser and the AI model.

### 1. User Interface Layer (React + Tailwind)
- **Framework**: React 19 with Vite for fast local development and optimized production builds.
- **Styling**: Tailwind CSS for a responsive, theme-aware (Light/Dark mode) interface.
- **Animations**: `motion` (Framer Motion) handles smooth transitions and state changes in the document list.
- **Icons**: `lucide-react` provides consistent visual metaphors across the app.

### 2. Input Handling Layer
- **File Uploads**: `react-dropzone` manages bulk file selections and drag-and-drop interactions.
- **Mobile/Scanner**: Uses the browser's `navigator.mediaDevices` API to access the device camera for live document scanning.

### 3. AI Service Layer (Gemini API + Hugging Face Hybrid)
- **Primary Model**: `gemini-3-flash-preview` (optimized for speed and high-context visual understanding).
- **Secondary Verification (Conceptual HF Integration)**: For high-stakes financial data, the system can be extended with specialized Hugging Face models like **LayoutLMv3** or **Donut** to verify structured extractions or handle edge cases (e.g., extremely low-quality scans) where a general model might hallucinate.
- **Structured Output**: Uses Gemini's **Schema-based JSON generation** to ensure the AI returns data in a strictly typed format that the app can reliably display and export.

---

## 🔄 Data Pipeline (The "Life of a Receipt")

Below is the step-by-step pipeline for how a document is processed:

### Step 1: Ingestion
A user drops a PDF/Image or captures a photo via the camera. The file is stored in the React state as a `File` object.

### Step 2: Pre-processing & Normalization
- **Client-side Compression**: Reducing resolution (if needed) to stay within API rate limits while maintaining OCR clarity.
- **Base64 Encoding**: Since the Gemini API requires binary data in standard encoding, the app uses the `FileReader` API to convert the local file.

### Step 3: Prompt Engineering & System Instructions
The app sends a structured payload to Gemini:
1.  **System Persona**: Sets the context as a "Certified Financial Auditor".
2.  **Multimodal Context**: The raw image data is sent along with the request (avoiding separate OCR steps).
3.  **Few-Shot Prompting (Optional)**: Can be added to the prompt to show examples of complex tax calculations to increase accuracy.

### Step 4: Multi-Stage Extraction
Gemini processes the vision data and performs:
-   **Semantic Classification**: Identifying if the document is a Receipt, Invoice, or Bill.
-   **Positional OCR**: Mapping text to logical fields based on document layout.
-   **Entity Normalization**: Converting varied date formats (e.g., "May 5, 26" to "2026-05-05").

### Step 5: Validation & UI Reconciliation
The returned JSON is parsed and merged back into the React file list. The UI provides immediate feedback on completion.

### Step 6: Export & Persistence
The user triggers the `exportCSV` function, which cleans the data (escaping special characters) and generates a temporary download URL.

---

## 🧠 Advanced: Why this Architecture? (Interview Prep)

- **Latency Optimization**: By using `gemini-3-flash`, we achieve sub-3-second processing, essential for real-time mobile scanning.
- **Cost Efficiency**: Avoiding a heavy backend (no Python/Flask server) reduces "cold start" issues and infrastructure costs to zero.
- **Security by Design**: Financial documents never touch a third-party server besides the Inference API (Google/HF), significantly reducing the surface area for PII (Personally Identifiable Information) leaks.
- **Extensibility**: The pipeline is "Model Agnostic." We can swap Gemini for a Hugging Face model (like `Donut` via Inference API) by simply changing the `processDocument` helper logic.
