
import { ZipfPoint } from '../types';

export const exportChartAsImage = async (chartElement: HTMLElement | null, filename: string): Promise<void> => {
  if (!chartElement) {
    console.error("Chart element not found for export.");
    alert("Error: Chart element not found.");
    return;
  }
  if (!window.html2canvas) {
    console.error("html2canvas library not loaded.");
    alert("Error: html2canvas library not available. Cannot export chart.");
    return;
  }

  try {
    const canvas = await window.html2canvas(chartElement, { 
      logging: false, 
      useCORS: true,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc' // Match bg
    });
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting chart:", error);
    alert(`Error exporting chart: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const exportDataToCSV = (data: ZipfPoint[], filename: string): void => {
  if (data.length === 0) {
    alert("No data available to export.");
    return;
  }

  const header = "Rank,Word,ActualFrequency,LogRank,LogFrequency,IdealFrequency,FittedFrequency,PercentDivergenceFromIdeal\n";
  const rows = data.map(p => 
    [
      p.rank,
      `"${p.word.replace(/"/g, '""')}"`, // Escape double quotes in word
      p.actualFrequency,
      p.logRank.toFixed(4),
      p.logFrequency.toFixed(4),
      p.idealFrequency.toFixed(2),
      p.fittedFrequency.toFixed(2),
      p.percentDivergenceFromIdeal.toFixed(2)
    ].join(',')
  ).join('\n');

  const csvContent = header + rows;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_analysis.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportDataToXLSX = (data: ZipfPoint[], filename: string): void => {
  if (data.length === 0) {
    alert("No data available to export.");
    return;
  }
  if (!window.XLSX) {
    alert("XLSX library not available. Cannot export to Excel.");
    return;
  }

  const worksheetData = data.map(p => ({
    Rank: p.rank,
    Word: p.word,
    ActualFrequency: p.actualFrequency,
    LogRank: p.logRank,
    LogFrequency: p.logFrequency,
    IdealFrequency: p.idealFrequency,
    FittedFrequency: p.fittedFrequency,
    PercentDivergenceFromIdeal: p.percentDivergenceFromIdeal,
  }));

  const worksheet = window.XLSX.utils.json_to_sheet(worksheetData);
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, "Zipf Analysis");
  window.XLSX.writeFile(workbook, `${filename}_analysis.xlsx`);
};
