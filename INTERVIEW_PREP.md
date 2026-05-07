# Interview Preparation: Intelligent Document Processing (IDP)

This guide prepare you to explain the technical complexity and design decisions of this project during interviews.

---

## 🏗️ System Design Questions

### Q1: Why did you choose a Client-Side (SPA) architecture for an AI app?
**A:** "For this specific use case (finance), **Privacy** is the priority. By keeping the processing logic in the browser, sensitive receipts never touch an intermediary backend server. It also reduces costs and infrastructure complexity, allowing for a highly responsive 'Serverless' feel. I used Vite for performance and React 19 for modern state management."

### Q2: How would you scale this to handle 10,000 documents per minute?
**A:** "I would move the processing to an asynchronous **Cloud Pipeline**. I'd ingestion documents into an S3/GCS bucket, trigger a **Lambda/Cloud Function**, and use a message queue (SQS/PubSub) to manage the inference rate. I would also implement a caching layer for known vendors to avoid redundant AI calls."

### Q3: What happens if the Gemini API is down? (Fault Tolerance)
**A:** "I've structured the code to be **Model Agnostic**. In a production environment, I would implement a **Circuit Breaker** pattern. If Gemini fails, the system could automatically fallback to a Hugging Face model (like Donut) or a specialized OCR service like AWS Textract."

---

## 🤖 AI & Machine Learning Questions

### Q4: How do you handle OCR on low-quality or blurry images?
**A:** "Gemini 3 Flash is a **Multimodal** model, meaning it doesn't just do OCR; it understands the 'visual context'. However, for extremely poor quality, I would implement a **pre-processing pipeline** using Canvas to increase contrast and apply a sharpening filter before sending it to the model. In a hybrid setup, I'd use a specialized model like **TrOCR** from Hugging Face for the raw text extraction."

### Q5: How do you prevent "LLM Hallucinations" in financial totals?
**A:** "I use two strategies:
1.  **Strict Schema Enforcement**: I use JSON mode with a defined schema to force the model into a specific format.
2.  **Cross-Field Validation**: In the business logic, I verify that `Subtotal + Tax = Total`. If the numbers don't add up, I flag the document for 'Human-in-the-loop' review."

### Q6: Can you explain the 'LayoutLM' approach vs. the 'Generative' approach?
**A:** "LayoutLM (from Hugging Face) uses a **BERT-like** architecture that considers the 2D coordinates of text on a page. It's great for knowing 'where' things are. The Generative approach (Gemini) is an **Encoder-Decoder** that understands the 'intent' of the document. Generative models are generally better at handling unseen, weirdly formatted receipts without specific training."

---

## 💻 Technical Implementation Questions

### Q7: Why use Base64 encoding instead of sending a raw binary stream?
**A:** "The `@google/genai` SDK and the browser's `fetch` API handle Base64 strings natively for multimodal inputs. It's a robust way to package multiple types of data (text prompts + images) into a single request body."

### Q8: How did you implement Document Classification?
**A:** "Instead of building a separate classifier, I leveraged **System Instructions**. I told the model to first output a `documentType` field. The model looks at the visual patterns (e.g., thermal paper 'long' format vs A4 'invoice' format) to make a high-accuracy classification."

### Q9: How do you evaluate the performance of your IDP system?
**A:** "I built a dedicated **Benchmark Dashboard** that simulates large-scale audits (N=10,000). I track the **F1-Score** (to balance Precision and Recall) and **Accuracy**. I also visualize **Stability** over batches to ensure the model doesn't degrade with different document types. This data-driven approach allows us to objectively compare Gemini vs. Hugging Face performance."

---

## 📈 Potential Improvements for "Senior" Answers
- **RAG (Retrieval Augmented Generation)**: "I could implement RAG to help the AI remember historical vendor names or previously used tax codes."
- **Human-in-the-loop**: "I'd add a 'Confidence Score' UI. Any extraction below 80% confidence gets highlighted in red for the user to verify manually."
- **Edge Inference**: "Using Hugging Face's `Transformers.js`, we could run small OCR models locally in the browser to detect if a file is actually a receipt *before* spending API credits on the LLM."
