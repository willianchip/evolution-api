import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFConfig {
  title: string;
  subtitle?: string;
  data: any[];
  columns: { header: string; dataKey: string }[];
}

export const generatePDF = (config: PDFConfig) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(config.title, 14, 22);
  
  if (config.subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(config.subtitle, 14, 32);
  }
  
  // Table
  autoTable(doc, {
    startY: config.subtitle ? 40 : 30,
    head: [config.columns.map(col => col.header)],
    body: config.data.map(row => 
      config.columns.map(col => row[col.dataKey] || '-')
    ),
    theme: 'striped',
    headStyles: { fillColor: [57, 255, 20] },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(10);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleString('pt-BR')}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }
  
  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(`${filename}-${Date.now()}.pdf`);
};
