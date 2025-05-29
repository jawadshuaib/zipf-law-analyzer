
import React, { useRef } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { AnalysisData, ZipfPoint } from '../types';
import { exportChartAsImage, exportDataToCSV, exportDataToXLSX } from '../services/exportService';

interface AnalysisDisplayProps {
  analysisData: AnalysisData;
}

const CustomTooltipContent = (props: any) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const seriesName = payload[0].name;
    return (
      <div className="bg-white dark:bg-secondary-800 p-3 shadow-lg rounded-md border border-secondary-200 dark:border-secondary-700">
        {data.word && <p className="font-semibold text-sm text-secondary-800 dark:text-secondary-200">{`Word: ${data.word}`}</p>}
        <p className="text-xs text-secondary-600 dark:text-secondary-400">{`Rank: ${data.rank}`}</p>
        <p className="text-xs text-secondary-600 dark:text-secondary-400">{`Actual Frequency: ${data.actualFrequency}`}</p>
        
        {seriesName === "Actual Data" && (
          <>
            <p className="text-xs text-secondary-600 dark:text-secondary-400">{`Log(Rank): ${data.logRank.toFixed(3)}`}</p>
            <p className="text-xs text-secondary-600 dark:text-secondary-400">{`Log(Frequency): ${data.logFrequency.toFixed(3)}`}</p>
          </>
        )}
        {seriesName === "Ideal Zipf (slope -1)" && (
          <>
            <p className="text-xs text-secondary-600 dark:text-secondary-400">{`Log(Rank): ${data.logRank.toFixed(3)}`}</p>
            <p className="text-xs text-secondary-600 dark:text-secondary-400">{`Log(Ideal Frequency): ${data.logIdealFrequency.toFixed(3)}`}</p>
          </>
        )}
        {seriesName === "Fitted Regression" && (
           <>
            <p className="text-xs text-secondary-600 dark:text-secondary-400">{`Log(Rank): ${data.logRank.toFixed(3)}`}</p>
            <p className="text-xs text-secondary-600 dark:text-secondary-400">{`Log(Fitted Frequency): ${data.logFittedFrequency.toFixed(3)}`}</p>
          </>
        )}
      </div>
    );
  }
  return null;
};


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysisData }) => {
  const { fileInfo, zipfPoints, zipfMetrics, topWords } = analysisData;

  const logLogChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  
  const logLogPlotData = zipfPoints.map(p => ({
    ...p,
    // Ensure log calculations handle potentially zero or negative frequencies if data is unusual
    logIdealFrequency: p.idealFrequency > 0 ? Math.log10(p.idealFrequency) : Math.log10(0.001),
    logFittedFrequency: p.fittedFrequency > 0 ? Math.log10(p.fittedFrequency) : Math.log10(0.001),
  })).sort((a,b) => a.logRank - b.logRank); // Pre-sort for line charts

  const axisLabelColor = document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569';
  const axisStrokeColor = document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b';


  return (
    <div className="p-4 space-y-8">
      <div className="bg-white dark:bg-secondary-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-primary-700 dark:text-primary-400">Analysis Summary: {fileInfo.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p><strong>File Size:</strong> {(fileInfo.size / 1024).toFixed(2)} KB</p>
          <p><strong>Total Words (approx):</strong> {fileInfo.wordCount?.toLocaleString() || 'N/A'}</p>
          <p><strong>Unique Words:</strong> {fileInfo.uniqueWordCount?.toLocaleString() || 'N/A'}</p>
          <p><strong>Zipf Slope (m):</strong> {zipfMetrics.slope.toFixed(4)}</p>
          <p><strong>Zipf Intercept (c):</strong> {zipfMetrics.intercept.toFixed(4)}</p>
          <p><strong>R² (Goodness of Fit):</strong> {zipfMetrics.rSquared.toFixed(4)}</p>
        </div>
      </div>

      {/* Log-Log Plot of Rank vs Frequency */}
      <div className="bg-white dark:bg-secondary-800 shadow-lg rounded-lg p-6" ref={logLogChartRef}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-primary-700 dark:text-primary-400">Log(Rank) vs. Log(Frequency)</h3>
            <button
            onClick={() => exportChartAsImage(logLogChartRef.current, `${fileInfo.name}_log_log_plot`)}
            className="px-3 py-1.5 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
            aria-label="Export Log-Log Plot as Image"
            >
            Export Plot
            </button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis 
                type="number" 
                dataKey="logRank" 
                name="Log(Rank)" 
                label={{ value: 'Log(Rank)', position: 'insideBottom', offset: -15, fill: axisLabelColor }} 
                stroke={axisStrokeColor}
                domain={['dataMin', 'dataMax']}
            />
            <YAxis 
                type="number" 
                name="Log(Frequency)" 
                label={{ value: 'Log(Frequency)', angle: -90, position: 'insideLeft', offset: -5, fill: axisLabelColor }} 
                stroke={axisStrokeColor}
                domain={['auto', 'auto']} // Allow auto domain for Y to fit all lines
                allowDataOverflow={true}
            />
            <Tooltip content={<CustomTooltipContent />} cursor={{ strokeDasharray: '3 3' }}/>
            <Legend wrapperStyle={{paddingTop: '20px'}}/>
            <Scatter name="Actual Data" data={logLogPlotData} dataKey="logFrequency" fill="#3b82f6" shape="circle" />
             <Line 
                name="Ideal Zipf (slope -1)" 
                type="monotone" 
                dataKey="logIdealFrequency" 
                stroke="#10b981"  // Green
                dot={false} 
                strokeWidth={2} 
                data={logLogPlotData} // Data is already sorted
                isAnimationActive={false}
            />
            <Line 
                name="Fitted Regression" 
                type="monotone" 
                dataKey="logFittedFrequency" 
                stroke="#ef4444" // Red
                dot={false} 
                strokeWidth={2} 
                data={logLogPlotData} // Data is already sorted
                isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart of Top N Words */}
      <div className="bg-white dark:bg-secondary-800 shadow-lg rounded-lg p-6" ref={barChartRef}>
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-primary-700 dark:text-primary-400">Top {topWords.length} Most Frequent Words</h3>
            <button
            onClick={() => exportChartAsImage(barChartRef.current, `${fileInfo.name}_top_words_plot`)}
            className="px-3 py-1.5 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
            aria-label="Export Top Words Plot as Image"
            >
            Export Plot
            </button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topWords} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3}/>
            <XAxis type="number" stroke={axisStrokeColor} />
            <YAxis type="category" dataKey="word" width={100} interval={0} stroke={axisStrokeColor} tick={{fontSize: 10}}/>
            <Tooltip cursor={{fill: 'rgba(128,128,128,0.1)'}}/>
            <Legend />
            <Bar dataKey="frequency" name="Frequency" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table of Word Frequencies */}
      <div className="bg-white dark:bg-secondary-800 shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-primary-700 dark:text-primary-400">Detailed Word Analysis</h3>
            <div>
                <button
                    onClick={() => exportDataToCSV(zipfPoints, fileInfo.name)}
                    className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors mr-2"
                    aria-label="Export Data to CSV"
                >
                    Export CSV
                </button>
                 <button
                    onClick={() => exportDataToXLSX(zipfPoints, fileInfo.name)}
                    className="px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                    aria-label="Export Data to XLSX"
                >
                    Export XLSX
                </button>
            </div>
        </div>
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-sm text-left text-secondary-700 dark:text-secondary-300">
            <thead className="text-xs text-secondary-700 uppercase bg-secondary-50 dark:bg-secondary-700 dark:text-secondary-400 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-3">Rank</th>
                <th scope="col" className="px-4 py-3">Word</th>
                <th scope="col" className="px-4 py-3">Actual Freq.</th>
                <th scope="col" className="px-4 py-3">Expected Freq. (Ideal)</th>
                <th scope="col" className="px-4 py-3">Percentage Divergence from Expectation</th>
              </tr>
            </thead>
            <tbody>
              {zipfPoints.map((point: ZipfPoint) => (
                <tr key={point.rank} className="bg-white dark:bg-secondary-800 border-b dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-600/50">
                  <td className="px-4 py-2">{point.rank}</td>
                  <td className="px-4 py-2 font-medium text-secondary-900 dark:text-white whitespace-nowrap">{point.word}</td>
                  <td className="px-4 py-2">{point.actualFrequency.toLocaleString()}</td>
                  <td className="px-4 py-2">{point.idealFrequency.toFixed(2)}</td>
                  <td className={`px-4 py-2 ${point.percentDivergenceFromIdeal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {point.percentDivergenceFromIdeal.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
