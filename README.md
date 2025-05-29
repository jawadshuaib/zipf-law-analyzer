# Zipf Law Analyzer

https://zipf-law-analyzer-411630486828.us-west1.run.app/

A web application that allows users to upload text documents (.docx) or word-frequency tables (.xlsx) to analyze and visualize word distributions according to Zipf's Law. The application provides interactive charts, detailed data tables, and export functionalities, all processed client-side with in-browser transpilation for JSX/TypeScript.

## Features

- **Drag-and-Drop File Upload:** Supports `.docx` (natural language text) and `.xlsx` (word-frequency tables).
- **Client-Side Parsing & In-Browser Transpilation:**
  - Uses **Babel Standalone** to transpile JSX and TypeScript (`.tsx` files) directly in the browser, enabling a build-less development experience.
  - **.docx/.doc:** Extracts text content using `mammoth.js`.
  - **.xlsx/.xls:** Parses word and frequency columns using `SheetJS/xlsx`.
- **Comprehensive Zipf Analysis:**
  - Sorts words by frequency (descending).
  - Calculates rank, log(rank), and log(frequency).
  - Performs linear regression on log-transformed data to find slope, intercept, and R² value.
- **Interactive Visualizations (Recharts):**
  - **Log-Log Plot:** Displays actual word frequencies, an ideal Zipf distribution (slope -1), and the fitted regression line.
  - **Bar Chart:** Shows the top N most frequent words.
- **Detailed Data Table:** Lists rank, word, actual frequency, expected frequency (ideal Zipf), and percentage divergence from the ideal.
- **Export Functionality:**
  - Export charts as PNG images.
  - Export analysis data as CSV or XLSX files.
- **User Experience:**
  - Responsive design for desktop and mobile.
  - Dark/Light mode toggle.
  - Loading indicators and error messages.
  - Client-side caching of the last analysis using Local Storage.
- **In-App Math Explanations:** Provides clear explanations of Zipf's Law, log-log transformation, linear regression, and other statistical concepts used, rendered beautifully with KaTeX.

## Tech Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS
- **In-Browser Transpilation:** Babel Standalone (`@babel/standalone`)
- **File Handling:**
  - `react-dropzone` for file uploads.
  - `mammoth.js` for .docx parsing.
  - `SheetJS/xlsx` for .xlsx/.xls parsing.
- **Charting:** `Recharts`
- **Image Export:** `html2canvas`
- **Math Rendering:** `KaTeX`
- **Module System:** ES Modules with Import Maps (runs directly in the browser).

## How It Works

1.  **File Upload:** The user uploads a `.docx` or `.xlsx` file.
2.  **In-Browser Transpilation:** When `index.html` is loaded, Babel Standalone transpiles the main `/index.tsx` script (and potentially subsequently imported local `.tsx` files, depending on the browser's module loading interaction with Babel) from JSX/TypeScript into plain JavaScript that the browser can execute.
3.  **Parsing:**
    - For `.docx` files, the text is extracted. Words are tokenized, converted to lowercase, and their frequencies are counted.
    - For `.xlsx` files, the application infers the word and frequency columns and builds a word-frequency list.
4.  **Zipf Analysis:** The word frequencies are sorted. Logarithms of rank and frequency are calculated. Linear regression is applied to the log-transformed data to determine the slope, intercept, and R² value.
5.  **Visualization:** The results are displayed using interactive charts and tables.
6.  **Mathematical Explanations:** A dedicated section explains the underlying mathematical principles.

## Running the Application Locally

This application runs **directly in a modern web browser** using ES Modules, CDNs, and in-browser transpilation via Babel Standalone. It **does not require a Node.js build process** (like `npm run build`) or local package installation (`npm install`) for its core functionality.

**Prerequisites:**

- A modern web browser that supports ES Modules (e.g., Chrome, Firefox, Edge, Safari).
- A simple local HTTP server. This is needed because web browsers restrict loading local files (`file://...`) as modules for security reasons (CORS policy).

**Steps to Run:**

1.  **Clone or Download:**
    - Clone this repository: `git clone <repository-url>`
    - Or download the ZIP and extract it.
2.  **Navigate to Project Directory:**
    - Open your terminal or command prompt and change to the project directory.
3.  **Start a Local HTTP Server:**
    - **Using `npx serve` (Node.js required for `npx`):**
      ```bash
      npx serve
      ```
    - **Using Python's built-in HTTP server (Python 3 required):**
      ```bash
      python -m http.server
      ```
    - Your server will typically run on `http://localhost:3000`, `http://localhost:5000`, or `http://localhost:8000`.
4.  **Open in Browser:**
    - Navigate to the local address provided by your server. You should see the Zipf Law Analyzer application.

**Important Considerations:**

- **In-Browser Transpilation:** Babel Standalone handles the JSX/TypeScript to JavaScript conversion on-the-fly in the browser. This is suitable for development and small projects but adds a performance overhead compared to a pre-built application.
- **No `npm install` or `npm start`:** Standard Node.js project commands are not applicable.
- **Modifications:** If you modify `.tsx` files, ensure your browser is not serving stale cached versions (use a hard refresh like Ctrl+Shift+R or Cmd+Shift+R).

## API Keys Not Required

- This application operates entirely client-side.
- No external API keys are needed.

## File Structure Overview

```
.
├── components/         # React components (.tsx)
├── hooks/              # Custom React hooks (.ts)
├── services/           # Business logic and utility functions (.ts)
├── App.tsx             # Main application component
├── constants.ts        # Application-wide constants
├── index.html          # Main HTML file (includes Babel, CDNs, import maps)
├── index.tsx           # React application entry point (transpiled by Babel)
├── metadata.json       # Application metadata
├── README.md           # This file
└── types.ts            # TypeScript type definitions
```

## Future Enhancements (Suggestions)

- Support for more file types.
- Advanced text processing options.
- If performance with Babel Standalone becomes an issue for larger codebases, introduce a lightweight build step (e.g., esbuild) for development and production.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

(Placeholder - Consider adding a license, e.g., MIT License)

```

```
