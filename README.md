# Financial AI: Intelligent Document Processing (IDP)

This app helps you organize your money by automatically reading your receipts and invoices. No more manual typing!

## 🚀 Demo: How to use it

1.  **Add your documents**: 
    *   **Drag and Drop**: Drag your receipt images (JPG, PNG) or PDFs directly onto the app.
    *   **Scan with Camera**: Click the **Camera icon** to take a live photo of a physical receipt.
2.  **Start Processing**: Click the **"Process All"** button. The AI will start reading each document.
3.  **Review the Data**: Once finished, you will see a list of extracted details like the store name, date, and total amount.
4.  **Save your Work**: Click **"Export CSV"** to download all the information into a spreadsheet file.

## ✨ Main Features

*   **Smart Reading**: Powered by Google's Gemini AI to understand exactly what's on your paper.
*   **Automatic Categorization**: It automatically knows if a receipt is for a Restaurant, Taxi, Grocery, or Shopping.
*   **Camera Integration**: Take photos of receipts while you are out and about.
*   **Dark Mode**: Easy on the eyes with a beautiful dark interface (or switch to light if you prefer!).
*   **Secure**: Your documents are processed and the data stays with you.

## 🛠️ Built With

*   **React**: For a smooth and fast user interface.
*   **Gemini AI**: The "brain" that reads the documents.
*   **Tailwind CSS**: For a clean and modern design.
*   **Lucide Icons**: For beautiful, easy-to-understand icons.

## 💻 Tech Setup (For Developers)

To run this project locally:

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Set up your keys**: Add your `GEMINI_API_KEY` to a `.env` file.
3.  **Start the app**:
    ```bash
    npm run dev
    ```
