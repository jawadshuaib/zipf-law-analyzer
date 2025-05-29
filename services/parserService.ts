
import { WordFrequency, FileInfo } from '../types';

// Helper function to tokenize text, convert to lowercase, and count frequencies
const processTextToFrequencies = (text: string): WordFrequency[] => {
  const words = text
    .toLowerCase()
    // Regex to match words: sequences of alphabetic characters, optionally with internal hyphens or apostrophes
    // It will split by spaces, punctuation marks like commas, periods, exclamation marks, etc.
    .match(/\b[a-zÀ-ÖØ-öø-ÿ]+(?:['’-][a-zÀ-ÖØ-öø-ÿ]+)*\b/g) || [];

  const frequencyMap: Map<string, number> = new Map();
  words.forEach(word => {
    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
  });

  return Array.from(frequencyMap.entries()).map(([word, frequency]) => ({ word, frequency }));
};

export const parseDocx = async (file: File): Promise<{ frequencies: WordFrequency[], fileInfo: FileInfo }> => {
  if (!window.mammoth) {
    throw new Error("Mammoth.js library is not loaded.");
  }
  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  const text = result.value;
  const frequencies = processTextToFrequencies(text);
  
  const fileInfo: FileInfo = {
    name: file.name,
    type: file.type,
    size: file.size,
    wordCount: text.split(/\s+/).filter(Boolean).length, // Simple word count
    uniqueWordCount: frequencies.length,
  };

  return { frequencies, fileInfo };
};

export const parseXlsx = async (file: File): Promise<{ frequencies: WordFrequency[], fileInfo: FileInfo }> => {
  if (!window.XLSX) {
    throw new Error("XLSX (SheetJS) library is not loaded.");
  }
  const arrayBuffer = await file.arrayBuffer();
  const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData: any[] = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (jsonData.length < 2) { // Need at least a header and one row of data
    throw new Error("Spreadsheet has insufficient data (less than 2 rows).");
  }

  // Infer columns - simple approach:
  // Assume first column with mostly strings is words, first column with mostly numbers is frequencies
  let wordColIndex = -1;
  let freqColIndex = -1;

  const headerRow = jsonData[0] as any[];

  // Try to find from header first
  for (let i = 0; i < headerRow.length; i++) {
    const header = String(headerRow[i]).toLowerCase();
    if ((header.includes('word') || header.includes('term')) && wordColIndex === -1) {
      wordColIndex = i;
    }
    if ((header.includes('freq') || header.includes('count')) && freqColIndex === -1) {
      freqColIndex = i;
    }
  }
  
  // If not found in header, infer by data type from first few data rows
  if (wordColIndex === -1 || freqColIndex === -1) {
      const dataRowsToScan = jsonData.slice(1, Math.min(6, jsonData.length)); // Scan up to 5 data rows
      const colTypes: ('string' | 'number' | 'mixed' | 'empty')[][] = Array(headerRow.length).fill(null).map(() => []);

      for (const row of dataRowsToScan) {
          for (let i=0; i<headerRow.length; i++) {
              if (row[i] === null || typeof row[i] === 'undefined' || String(row[i]).trim() === '') {
                  colTypes[i].push('empty');
              } else if (typeof row[i] === 'string' && !/^\d+(\.\d+)?$/.test(row[i])) {
                  colTypes[i].push('string');
              } else if (typeof row[i] === 'number' || (typeof row[i] === 'string' && /^\d+(\.\d+)?$/.test(row[i]))) {
                  colTypes[i].push('number');
              } else {
                  colTypes[i].push('mixed');
              }
          }
      }
      
      for (let i=0; i<headerRow.length; i++) {
          const types = colTypes[i];
          if (types.every(t => t === 'string' || t === 'empty') && types.some(t => t === 'string') && wordColIndex === -1) {
              wordColIndex = i;
          }
          if (types.every(t => t === 'number' || t === 'empty') && types.some(t => t === 'number') && freqColIndex === -1) {
              freqColIndex = i;
          }
      }
  }


  if (wordColIndex === -1 || freqColIndex === -1 || wordColIndex === freqColIndex) {
    throw new Error("Could not reliably infer word and frequency columns. Please ensure the first sheet has clear 'word' (text) and 'frequency' (number) columns.");
  }

  const frequencies: WordFrequency[] = [];
  let totalWords = 0;
  for (let i = 1; i < jsonData.length; i++) { // Skip header row
    const row = jsonData[i] as any[];
    const word = row[wordColIndex] ? String(row[wordColIndex]).trim() : null;
    const frequencyStr = row[freqColIndex] ? String(row[freqColIndex]).trim() : null;
    const frequency = parseInt(frequencyStr || '', 10);

    if (word && !isNaN(frequency) && frequency > 0) {
      frequencies.push({ word, frequency });
      totalWords += frequency;
    }
  }

  if (frequencies.length === 0) {
    throw new Error("No valid word-frequency pairs found in the spreadsheet.");
  }
  
  const fileInfo: FileInfo = {
    name: file.name,
    type: file.type,
    size: file.size,
    wordCount: totalWords, 
    uniqueWordCount: frequencies.length,
  };
  
  return { frequencies, fileInfo };
};
