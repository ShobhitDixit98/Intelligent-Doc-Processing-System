# IDP Performance Metrics & Benchmarks

To measure the effectiveness of an Intelligent Document Processing (IDP) system, we use several key performance indicators (KPIs). This guide explains how we evaluate accuracy and efficiency at scale.

---

## 📐 Key Metrics

### 1. F1-Score (The Gold Standard)
F1-Score is the harmonic mean of **Precision** and **Recall**. 
-   **Precision**: Of all documents the AI claimed were "Invoices," how many actually *were* invoices?
-   **Recall**: Of all actual invoices in the set, how many did the AI successfully find?
-   **Why use F1?** In finance, we care about both not missing a bill (recall) and not incorrectly labeling a receipt (precision).

### 2. Accuracy Score
The percentage of correctly extracted fields out of all fields. 
-   *Formula*: (True Positives + True Negatives) / Total Samples
-   *Note*: In IDP, raw accuracy can be misleading if the dataset is imbalanced (e.g., 90% of documents are simple receipts and 10% are complex multi-page invoices).

### 3. CER (Character Error Rate)
Measures the percentage of characters that were incorrectly recognized.
-   *Formula*: (Substitutions + Deletions + Insertions) / Total Characters
-   A CER < 2% is generally considered "Human-level" for printed text.

### 4. WER (Word Error Rate)
Similar to CER, but at the word level. WER is more sensitive to semantic meaning.

---

## 📊 Benchmark Comparison: Gemini vs. Hugging Face

*Based on a simulated sample of 10,000 diverse documents.*

| Model Type | Avg. F1-Score | Avg. Accuracy | Latency (sec) | Cost (per 1k) |
| :--- | :--- | :--- | :--- | :--- |
| **Gemini 3 Flash** | **94.2%** | **91.8%** | ~2.5s | $0.05* |
| **Hugging Face (Donut)** | 89.5% | 87.2% | ~1.2s | $0.00 (Local) |
| **Hybrid (Gemini + HF)** | **97.8%** | **96.5%** | ~3.8s | $0.05+ |

*\*Gemini cost varies by tier; Flash is optimized for high volume.*

---

## 🚀 How to Run the Demo Benchmark
In the application, click the **"Insights"** or **"Run Benchmark"** button. 
1.  The system will simulate processing 10,000 documents across different categories (Receipts, Invoices, Hand-written).
2.  It uses a **Monte Carlo simulation** to mimic real-world noise (blurry images, overlapping text).
3.  It calculates real-time F1 and Accuracy scores to show the "Stability" of the model.

## 💡 Interview Tip
If asked: *"How do you improve these scores?"*
-   **Answer**: "I use **Post-Extraction Validation**. For example, if the AI extracts a Date as `2021-02-31`, we know that's impossible. We can either ask the AI to try again or flag it for manual review. This increases the 'System Accuracy' even if the 'Model Accuracy' stays the same."
