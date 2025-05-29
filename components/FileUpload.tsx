
import React, { useCallback, useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { WordFrequency, FileInfo } from '../types';
import { parseDocx, parseXlsx } from '../services/parserService';
import LoadingSpinner from './LoadingSpinner';
import { ACCEPTED_FILE_TYPES } from '../constants';

interface FileUploadProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (frequencies: WordFrequency[], fileInfo: FileInfo, fileId: string) => void;
  onAnalysisError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onAnalysisStart, onAnalysisComplete, onAnalysisError }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: FileWithPath[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    onAnalysisStart();
    setIsProcessing(true);
    onAnalysisError(''); // Clear previous errors

    try {
      let parsedData: { frequencies: WordFrequency[], fileInfo: FileInfo };
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        parsedData = await parseDocx(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parsedData = await parseXlsx(file);
      } else if (file.type === 'application/msword' && file.name.endsWith('.doc')) {
         // Try parsing .doc as if it's .docx, mammoth.js might handle some.
         // Or show specific message about .doc limitations.
         onAnalysisError("Parsing .doc files has limited support and may not work as expected. Please convert to .docx for best results.");
         parsedData = await parseDocx(file); // Attempt parsing
      }
      else {
        throw new Error(`Unsupported file type: ${file.type || 'unknown'}. Please upload a .docx or .xlsx file.`);
      }
      const fileId = `${file.name}-${file.size}-${file.lastModified}`;
      onAnalysisComplete(parsedData.frequencies, parsedData.fileInfo, fileId);
    } catch (err: any) {
      console.error("Parsing error:", err);
      onAnalysisError(err.message || "An unknown error occurred during file processing.");
    } finally {
      setIsProcessing(false);
    }
  }, [onAnalysisStart, onAnalysisComplete, onAnalysisError]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    multiple: false,
  });

  const acceptedFileItems = acceptedFiles.map(file => (
    <li key={(file as FileWithPath).path} className="text-sm text-secondary-700 dark:text-secondary-300">
      {(file as FileWithPath).path} - {(file.size / 1024).toFixed(2)} KB
    </li>
  ));

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-secondary-300 dark:border-secondary-600 hover:border-primary-400 dark:hover:border-primary-500'}
                    text-center`}
      >
        <input {...getInputProps()} />
        {isProcessing ? (
          <LoadingSpinner message="Processing file..." />
        ) : isDragActive ? (
          <p className="text-primary-600 dark:text-primary-400">Drop the file here ...</p>
        ) : (
          <div>
            <p className="text-secondary-700 dark:text-secondary-300">Drag 'n' drop a .docx or .xlsx file here, or click to select file.</p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Supported: .docx, .doc (limited), .xlsx, .xls</p>
          </div>
        )}
      </div>
      {acceptedFiles.length > 0 && !isProcessing && (
        <aside className="mt-4">
          <h4 className="font-semibold text-secondary-800 dark:text-secondary-200">Accepted file:</h4>
          <ul>{acceptedFileItems}</ul>
        </aside>
      )}
    </div>
  );
};

export default FileUpload;
