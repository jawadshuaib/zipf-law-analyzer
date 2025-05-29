
export interface WordFrequency {
  word: string;
  frequency: number;
}

export interface ZipfPoint {
  rank: number;
  word: string;
  actualFrequency: number;
  logRank: number;
  logFrequency: number;
  idealFrequency: number; // Calculated as C/rank (Expected Frequency), where C is often actualFrequency of rank 1 word
  fittedFrequency: number; // Calculated from regression: 10^(slope*logRank + intercept)
  percentDifferenceFromFitted: number; // ((actual - fitted) / actual) * 100
  percentDivergenceFromIdeal: number; // ((actual - ideal) / actual) * 100
}

export interface ZipfMetrics {
  slope: number;
  intercept: number;
  rSquared: number;
}

export interface FileInfo {
  name: string;
  type: string;
  size: number; // in bytes
  wordCount?: number; // Total words
  uniqueWordCount?: number; // Unique words
}

export interface AnalysisData {
  id: string; // Unique ID for caching, e.g., filename-size-lastModified
  fileInfo: FileInfo;
  rawData: WordFrequency[]; // Original word frequencies before filtering/sorting for Zipf
  zipfPoints: ZipfPoint[];
  zipfMetrics: ZipfMetrics;
  topWords: WordFrequency[]; // Top N words for bar chart
}

// For external libraries loaded via CDN
declare global {
  interface Window {
    mammoth: {
      extractRawText: ({ arrayBuffer }: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
      // Add other mammoth methods if needed
    };
    XLSX: any; // Type for SheetJS/xlsx library
    ReactIs: any; // Type for ReactIs (Recharts dependency)
    html2canvas: (element: HTMLElement, options?: Partial<any>) => Promise<HTMLCanvasElement>;
    renderMathInElement?: (element: HTMLElement, options?: any) => void; // For KaTeX
  }
}
