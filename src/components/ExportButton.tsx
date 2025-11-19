import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Table, Code } from 'lucide-react';
import { useExport } from '@/hooks/useExport';

interface ExportButtonProps {
  data: any[];
  filename: string;
  title: string;
  subtitle?: string;
  columns: { header: string; dataKey: string }[];
}

export const ExportButton = ({ data, filename, title, subtitle, columns }: ExportButtonProps) => {
  const { exportData } = useExport();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportData('pdf', { data, filename, title, subtitle, columns })}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportData('csv', { data, filename, title, subtitle, columns })}>
          <Table className="mr-2 h-4 w-4" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportData('json', { data, filename, title, subtitle, columns })}>
          <Code className="mr-2 h-4 w-4" />
          Exportar JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
