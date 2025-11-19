import { toast } from '@/hooks/use-toast';
import { generatePDF, downloadPDF } from '@/lib/pdf-generator';
import { exportToCSV, exportToJSON } from '@/lib/csv-exporter';

interface ExportOptions {
  data: any[];
  filename: string;
  title: string;
  subtitle?: string;
  columns: { header: string; dataKey: string }[];
}

export const useExport = () => {
  const exportData = (format: 'pdf' | 'csv' | 'json', options: ExportOptions) => {
    try {
      switch (format) {
        case 'pdf':
          const doc = generatePDF({
            title: options.title,
            subtitle: options.subtitle,
            data: options.data,
            columns: options.columns,
          });
          downloadPDF(doc, options.filename);
          break;
          
        case 'csv':
          exportToCSV(options.data, options.filename);
          break;
          
        case 'json':
          exportToJSON(options.data, options.filename);
          break;
      }
      
      toast({
        title: '✅ Exportação concluída',
        description: `Arquivo ${format.toUpperCase()} baixado com sucesso`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: '❌ Erro na exportação',
        description: 'Não foi possível exportar os dados',
        variant: 'destructive',
      });
    }
  };
  
  return { exportData };
};
