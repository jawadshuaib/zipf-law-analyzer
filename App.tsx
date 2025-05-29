
import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisDisplay from './components/AnalysisDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ThemeToggle from './components/ThemeToggle';
import MathExplanation from './components/MathExplanation'; // Import the new component
import { WordFrequency, AnalysisData, FileInfo } from './types';
import { analyzeFrequencies } from './services/zipfService';
import { LOCAL_STORAGE_KEY } from './constants';

const App: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached data on mount
  useEffect(() => {
    try {
      const cachedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedDataString) {
        const cachedAnalysis: AnalysisData = JSON.parse(cachedDataString);
        // Basic validation of cached data structure
        if (cachedAnalysis && cachedAnalysis.id && cachedAnalysis.zipfPoints && cachedAnalysis.zipfMetrics) {
            setAnalysisData(cachedAnalysis);
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear invalid cache
        }
      }
    } catch (e) {
      console.error("Failed to load cached data:", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted cache
    }
  }, []);

  const handleAnalysisStart = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setAnalysisData(null); // Clear previous analysis
  }, []);

  const handleAnalysisComplete = useCallback((frequencies: WordFrequency[], fileInfo: FileInfo, fileId: string) => {
    try {
      const newAnalysisData = analyzeFrequencies(fileId, fileInfo, frequencies);
      if (newAnalysisData) {
        setAnalysisData(newAnalysisData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newAnalysisData));
        // Attempt to re-render math if KaTeX is available
        setTimeout(() => {
          if (window.renderMathInElement) {
            window.renderMathInElement(document.body, {
              delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true }
              ],
              throwOnError: false
            });
          }
        }, 100); // Delay to ensure DOM update
      } else {
        setError("Could not perform Zipf analysis. The data might be insufficient or invalid.");
      }
    } catch (err: any) {
        console.error("Error during Zipf analysis:", err);
        setError(err.message || "An error occurred during analysis.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleAnalysisError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
    setAnalysisData(null);
  }, []);

  const clearAnalysis = () => {
    setAnalysisData(null);
    setError(null);
    setIsLoading(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary-100 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 transition-colors duration-300">
      <header className="bg-white dark:bg-secondary-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            Zipf Law Analyzer
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {!analysisData && !isLoading && (
             <div className="max-w-2xl mx-auto bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-center text-primary-700 dark:text-primary-400">Upload a Document to Begin Analysis</h2>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-6 text-center">
                    Analyze word frequencies from your .docx or .xlsx files and see how they conform to Zipf's Law.
                    The application will generate a log-log plot, a bar chart of top words, and a detailed data table.
                </p>
                <FileUpload 
                    onAnalysisStart={handleAnalysisStart}
                    onAnalysisComplete={handleAnalysisComplete}
                    onAnalysisError={handleAnalysisError}
                />
            </div>
        )}

        {isLoading && <div className="flex justify-center items-center h-64"><LoadingSpinner message="Analyzing your file..." size={12}/></div>}
        
        {error && !isLoading && (
          <div className="max-w-xl mx-auto my-8 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md shadow">
            <h3 className="font-bold text-lg">Error</h3>
            <p>{error}</p>
            <button 
                onClick={clearAnalysis} 
                className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-colors"
            >
                Try Again
            </button>
          </div>
        )}

        {analysisData && !isLoading && !error && (
          <div>
            <div className="mb-6 text-center">
                <button 
                    onClick={clearAnalysis} 
                    className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md shadow-md transition-colors"
                >
                    Analyze Another File
                </button>
            </div>
            <AnalysisDisplay analysisData={analysisData} />
          </div>
        )}
        
        {/* Math Explanation Section - always visible or conditionally visible */}
         <MathExplanation />
      </main>

      <footer className="bg-white dark:bg-secondary-800 text-center py-4 border-t border-secondary-200 dark:border-secondary-700">
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          Zipf Law Analyzer &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default App;
