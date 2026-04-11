import React from "react";
import { trpc } from "@/lib/trpc";
import { 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Package,
  FileText,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";

export function MRPView() {
  const { data: mrpData, isLoading, refetch } = trpc.calculateMRP.useQuery();

  const handleExportPDF = () => {
    if (!mrpData || mrpData.length === 0) {
      toast.error("Não há dados para exportar.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Relatório MRP - Planejamento de Necessidades", 14, 22);
    
    const tableData = mrpData.map(item => [
      item.productName,
      item.componentName,
      item.sku,
      item.needed,
      item.available,
      item.deficit,
      item.status
    ]);

    doc.autoTable({
      startY: 30,
      head: [["Produto Final", "Componente", "SKU", "Necessário", "Disponível", "Déficit", "Status"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save("relatorio_mrp.pdf");
    toast.success("Relatório MRP exportado!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">MRP - Planejamento</h1>
          <p className="text-sm text-slate-600 mt-1">Cálculo automático de necessidades de materiais para produção.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={() => {
              refetch();
              toast.success("Cálculo MRP atualizado!");
            }}
          >
            <Calculator className="w-4 h-4 mr-2" /> Recalcular
          </Button>
          <Button 
            variant="outline" 
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Ordens Planejadas</p>
                <p className="text-2xl font-bold text-slate-900">{mrpData?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-50 text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Déficits Críticos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {mrpData?.filter(i => i.deficit > 0).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50 text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Itens Supridos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {mrpData?.filter(i => i.deficit === 0).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold">Explosão de Necessidades</CardTitle>
          <CardDescription>Detalhamento de componentes necessários por produto final.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-bold">Produto Final</TableHead>
                <TableHead className="text-slate-600 font-bold">Componente</TableHead>
                <TableHead className="text-slate-600 font-bold">Necessário</TableHead>
                <TableHead className="text-slate-600 font-bold">Disponível</TableHead>
                <TableHead className="text-slate-600 font-bold">Déficit</TableHead>
                <TableHead className="text-slate-600 font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton className="h-12 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : mrpData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    Nenhum dado de BOM encontrado para calcular o MRP.
                  </TableCell>
                </TableRow>
              ) : (
                mrpData?.map((item) => (
                  <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-900">{item.productName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-slate-900">{item.componentName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{item.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">{item.needed} un</TableCell>
                    <TableCell className="text-slate-700">{item.available} un</TableCell>
                    <TableCell className={item.deficit > 0 ? "text-red-600 font-bold" : "text-slate-700"}>
                      {item.deficit} un
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        item.status === "OK" 
                          ? "bg-green-50 text-green-700 border-green-100" 
                          : "bg-red-50 text-red-700 border-red-100"
                      }>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
