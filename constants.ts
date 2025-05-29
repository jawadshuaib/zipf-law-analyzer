
export const TOP_N_WORDS_CHART = 20;
export const ACCEPTED_FILE_TYPES: { [key: string]: string[] } = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'], // Note: .doc parsing quality might be lower or not fully supported by mammoth.js
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'] // .xls might also work with XLSX.js
};
export const LOCAL_STORAGE_KEY = 'zipfAnalyzerCache';
