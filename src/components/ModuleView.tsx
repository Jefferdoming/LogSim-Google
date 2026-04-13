import React, { useRef, useState } from "react";
import { Plus, Search, Filter, Download, MoreHorizontal, Edit, Trash2, Eye, Upload, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationModal } from "./ConfirmationModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ModuleViewProps {
  title: string;
  description: string;
  data: any[];
  columns: { key: string; label: string; render?: (val: any) => React.ReactNode; type?: string }[];
  onImport?: (data: any[]) => Promise<void>;
  isLoading?: boolean;
  onDelete?: (id: any) => void;
  onAdd?: (data: any) => Promise<void>;
}

export function ModuleView({ title, description, data, columns, onImport, isLoading, onDelete, onAdd }: ModuleViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const importedData = XLSX.utils.sheet_to_json(ws);
        
        if (onImport) {
          await onImport(importedData);
          toast.success(`${importedData.length} registros importados com sucesso!`);
        }
      } catch (error) {
        console.error("Erro ao importar Excel:", error);
        toast.error("Erro ao processar o arquivo Excel. Verifique o formato.");
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsBinaryString(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAdd) return;

    setIsSubmitting(true);
    try {
      await onAdd(newRecord);
      toast.success("Registro adicionado com sucesso!");
      setIsAddModalOpen(false);
      setNewRecord({});
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar registro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPDF = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("Não há dados para exportar.");
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text(`Relatório de ${title}`, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`LogSim Pro - Sistema de Simulação ERP`, 14, 35);

    // Table
    const tableHead = columns.map(col => col.label);
    const tableBody = filteredData.map(row => 
      columns.map(col => {
        const val = row[col.key];
        // Handle boolean or objects if necessary
        if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
        if (val === null || val === undefined) return '-';
        return String(val);
      })
    );

    doc.autoTable({
      startY: 45,
      head: [tableHead],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 }
    });

    doc.save(`relatorio_${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Relatório PDF gerado com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <Button 
            variant="outline" 
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={handleImportClick}
            disabled={isImporting}
          >
            {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />} 
            {isImporting ? "Importando..." : "Importar Excel"}
          </Button>
          <Button 
            variant="outline" 
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
          <Button className="gradient-btn" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Novo Registro
          </Button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={() => {}} // Not used as we have a form
        title={`Novo Registro - ${title}`}
        description="Preencha os campos abaixo para adicionar um novo registro."
        confirmText="Salvar"
      >
        <form id="add-record-form" onSubmit={handleAddSubmit} className="space-y-4 py-4">
          {columns.map((col) => (
            <div key={col.key} className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{col.label}</label>
              <Input
                value={newRecord[col.key] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewRecord(prev => ({ 
                    ...prev, 
                    [col.key]: col.type === 'number' ? Number(val) : val 
                  }));
                }}
                placeholder={`Informe ${col.label.toLowerCase()}`}
                type={col.type === 'number' ? 'number' : 'text'}
                required
                className="bg-slate-50 border-slate-200"
              />
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="gradient-btn" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Salvar Registro"}
            </Button>
          </div>
        </form>
      </ConfirmationModal>

      <Card className="bg-white border-slate-200 overflow-hidden shadow-sm">
        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Pesquisar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500/30 text-slate-900"
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0 bg-white border-slate-200 text-slate-600">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {isLoading ? "Carregando..." : `${filteredData.length} registros encontrados`}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-200 hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead key={col.key} className="text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-100">
                    {columns.map((col) => (
                      <TableCell key={col.key} className="py-4">
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-32 text-center text-slate-500">
                    Nenhum dado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredData.map((row, i) => (
                    <motion.tr
                      key={row.id || i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="border-slate-100 hover:bg-slate-50 transition-colors group"
                    >
                      {columns.map((col) => (
                        <TableCell key={col.key} className="text-sm text-slate-700 py-4">
                          {col.render ? col.render(row[col.key]) : row[col.key]}
                        </TableCell>
                      ))}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-slate-400 hover:text-slate-900")}>
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-slate-200">
                            <DropdownMenuItem className="gap-2 focus:bg-slate-50 text-slate-700">
                              <Eye className="w-4 h-4" /> Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 focus:bg-slate-50 text-slate-700">
                              <Edit className="w-4 h-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-red-600 focus:bg-red-50"
                              onClick={() => setDeleteId(row.id || i)}
                            >
                              <Trash2 className="w-4 h-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (onDelete) onDelete(deleteId);
          toast.success("Operação realizada com sucesso");
        }}
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
}
