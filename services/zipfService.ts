
import { WordFrequency, ZipfPoint, ZipfMetrics, AnalysisData, FileInfo } from '../types';
import { TOP_N_WORDS_CHART } from '../constants';

interface RegressionPoint {
  x: number; // logRank
  y: number; // logFrequency
}

const calculateLinearRegression = (points: RegressionPoint[]): ZipfMetrics | null => {
  const n = points.length;
  if (n < 2) return null; // Need at least 2 points for regression

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
    sumYY += p.y * p.y;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  let ssRes = 0;
  let ssTot = 0;
  const yMean = sumY / n;

  for (const p of points) {
    const yPred = slope * p.x + intercept;
    ssRes += (p.y - yPred) * (p.y - yPred);
    ssTot += (p.y - yMean) * (p.y - yMean);
  }

  const rSquared = ssTot === 0 ? 1 : 1 - (ssRes / ssTot); // Handle case where all y values are the same

  return { slope, intercept, rSquared };
};

export const analyzeFrequencies = (
  id: string,
  fileInfo: FileInfo,
  frequencies: WordFrequency[]
): AnalysisData | null => {
  if (frequencies.length === 0) return null;

  // Sort by frequency descending, then alphabetically for tie-breaking
  const sortedFrequencies = [...frequencies].sort((a, b) => {
    if (b.frequency === a.frequency) {
      return a.word.localeCompare(b.word);
    }
    return b.frequency - a.frequency;
  });

  const tempZipfPoints: Omit<ZipfPoint, 'idealFrequency' | 'fittedFrequency' | 'percentDifferenceFromFitted' | 'percentDivergenceFromIdeal'>[] = [];
  const regressionPoints: RegressionPoint[] = [];
  
  for (let i = 0; i < sortedFrequencies.length; i++) {
    const rank = i + 1;
    const { word, frequency: actualFrequency } = sortedFrequencies[i];

    if (actualFrequency <= 0 || rank <= 0) continue; // Skip non-positive frequencies/ranks for log

    const logRank = Math.log10(rank);
    const logFrequency = Math.log10(actualFrequency);

    regressionPoints.push({ x: logRank, y: logFrequency });
    
    tempZipfPoints.push({
      rank,
      word,
      actualFrequency,
      logRank,
      logFrequency,
    });
  }
  
  if (regressionPoints.length < 2) return null; // Not enough data for meaningful analysis

  const zipfMetrics = calculateLinearRegression(regressionPoints);
  if (!zipfMetrics) return null;

  const fMaxActual = sortedFrequencies[0]?.frequency || 1; // Frequency of the most common word, fallback to 1 to avoid div by zero if sortedFrequencies is empty (though guarded)

  const zipfPoints: ZipfPoint[] = tempZipfPoints.map(p => {
    const idealFrequency = fMaxActual / p.rank; // C = fMaxActual
    const fittedFrequency = Math.pow(10, zipfMetrics.slope * p.logRank + zipfMetrics.intercept);
    
    let percentDifferenceFromFitted = 0;
    if (p.actualFrequency > 0) {
         percentDifferenceFromFitted = ((p.actualFrequency - fittedFrequency) / p.actualFrequency) * 100;
    }

    let percentDivergenceFromIdeal = 0;
    if (p.actualFrequency > 0) {
        percentDivergenceFromIdeal = ((p.actualFrequency - idealFrequency) / p.actualFrequency) * 100;
    }
    
    return {
        ...p,
        idealFrequency,
        fittedFrequency,
        percentDifferenceFromFitted,
        percentDivergenceFromIdeal
    };
  });


  const topWords = sortedFrequencies.slice(0, TOP_N_WORDS_CHART);

  return {
    id,
    fileInfo,
    rawData: frequencies, // Original unsorted, unfiltered frequencies
    zipfPoints,
    zipfMetrics,
    topWords,
  };
};
