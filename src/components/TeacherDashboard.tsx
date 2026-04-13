import React, { useState, ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { 
  Users, 
  Trophy, 
  TrendingUp, 
  Download, 
  User, 
  GraduationCap,
  BarChart3,
  Search,
  FileText,
  Mail,
  Phone,
  MapPin,
  Target,
  Plus,
  Trash2,
  Zap,
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard,
  Play,
  Settings as SettingsIcon,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from "recharts";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { OnboardingVideo } from "./OnboardingVideo";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function TeacherDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "missions" | "settings">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [allocationForm, setAllocationForm] = useState({ school: "", class: "", period: "Manhã" });

  const { data: students, refetch: refetchStudents, isLoading: loadingStudents } = trpc.getStudents.useQuery();
  const { data: missions, refetch: refetchMissions, isLoading: loadingMissions } = trpc.getMissions.useQuery();
  const { data: settingsData, refetch: refetchSettings } = trpc.getSettings.useQuery();
  
  const preRegisterMutation = trpc.preRegisterStudent.useMutation({
    onSuccess: () => {
      toast.success("Aluno pré-cadastrado com sucesso!");
      refetchStudents();
    }
  });

  const updateAllocation = trpc.updateStudentAllocation.useMutation({
    onSuccess: () => {
      toast.success("Alocação atualizada com sucesso!");
      setEditingStudent(null);
      refetchStudents();
    },
    onError: (err) => toast.error(err.message)
  });
  const createMissionMutation = trpc.createMission.useMutation();
  const deleteMissionMutation = trpc.deleteMission.useMutation();
  const updateSettingMutation = trpc.updateSetting.useMutation();

  const toggleSetting = async (key: string, currentValue: string) => {
    const newValue = currentValue === "true" ? "false" : "true";
    try {
      await updateSettingMutation.mutateAsync({ key, value: newValue });
      toast.success("Configuração atualizada!");
      refetchSettings();
    } catch (err) {
      toast.error("Erro ao atualizar configuração.");
    }
  };

  if (loadingStudents || loadingMissions) {
    return (
      <div className="space-y-8 pb-8 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[500px]" />
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    );
  }

  const filteredStudents = students?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ra?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalXP = students?.reduce((acc, s) => acc + (s.xp || 0), 0) || 0;
  const avgXP = students?.length ? Math.round(totalXP / students.length) : 0;
  const avgLevel = students?.length ? (students.reduce((acc, s) => acc + (s.level || 1), 0) / students.length).toFixed(1) : "1.0";

  const levelDistribution = [
    { name: "Nível 1-5", value: students?.filter(s => (s.level || 1) <= 5).length || 0 },
    { name: "Nível 6-10", value: students?.filter(s => (s.level || 1) > 5 && (s.level || 1) <= 10).length || 0 },
    { name: "Nível 11-15", value: students?.filter(s => (s.level || 1) > 10 && (s.level || 1) <= 15).length || 0 },
    { name: "Nível 16+", value: students?.filter(s => (s.level || 1) > 15).length || 0 },
  ];

  const exportToPDF = () => {
    if (!students || students.length === 0) {
      toast.error("Não há dados de alunos para exportar.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text("Relatório de Desempenho - LogSim Pro", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Professor: ${user.name}`, 14, 35);
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Resumo da Turma:", 14, 45);
    doc.setFontSize(10);
    doc.text(`Total de Alunos: ${students.length}`, 14, 52);
    doc.text(`Média de XP: ${avgXP}`, 14, 57);
    doc.text(`Média de Nível: ${avgLevel}`, 14, 62);

    const tableData = students.map(s => [
      s.name,
      s.ra || "N/A",
      s.email,
      s.level || 1,
      s.xp || 0,
      s.class || "N/A"
    ]);

    doc.autoTable({
      startY: 70,
      head: [["Nome", "RA", "Email", "Nível", "XP", "Turma"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 }
    });

    doc.save(`relatorio_turma_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Relatório PDF gerado com sucesso!");
  };

  const handleCreateMission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createMissionMutation.mutateAsync({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        reward: parseInt(formData.get("reward") as string),
        difficulty: formData.get("difficulty") as string,
        type: formData.get("type") as string,
        targetValue: parseInt(formData.get("targetValue") as string),
        teacherId: user.id,
      });
      toast.success("Missão criada com sucesso!");
      setShowMissionForm(false);
      refetchMissions();
    } catch (err) {
      toast.error("Erro ao criar missão.");
    }
  };

  const handleDeleteMission = async (id: number) => {
    try {
      await deleteMissionMutation.mutateAsync({ id });
      toast.success("Missão removida.");
      refetchMissions();
    } catch (err) {
      toast.error("Erro ao remover missão.");
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Painel do Professor</h1>
          <p className="text-slate-600 mt-1">Gerencie sua turma e acompanhe o desempenho dos alunos em tempo real.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowOnboarding(true)}
            variant="outline" 
            className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 shadow-md"
          >
            <Play className="w-4 h-4 mr-2 fill-current" /> Veja o LogSim Pro em Ação
          </Button>
          <Button 
            onClick={exportToPDF}
            variant="outline" 
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>

      <OnboardingVideo isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      {/* Custom Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
          { id: "students", label: "Alunos", icon: Users },
          { id: "missions", label: "Missões", icon: Target },
          { id: "settings", label: "Configurações", icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total de Alunos</p>
                  <p className="text-2xl font-bold text-slate-900">{students?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Média de XP</p>
                  <p className="text-2xl font-bold text-slate-900">{avgXP}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-50 text-green-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Média de Nível</p>
                  <p className="text-2xl font-bold text-slate-900">{avgLevel}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Distribuição de Nível
                </CardTitle>
                <CardDescription className="text-slate-500">Progresso geral da turma por faixa de nível</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] pt-4 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={levelDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                      itemStyle={{ color: "#0f172a" }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {levelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#2563eb" : "#ea580c"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 to-orange-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Idealização do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shrink-0">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">Prof° Jefferson Costa</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Este aplicativo foi idealizado para transformar o ensino de logística em uma experiência 
                      gamificada e imersiva.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">55 11 932888396</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium break-all">jeffersondomingos@prof.educacao.sp.gov.br</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <Card className="bg-white border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Gestão de Alunos
              </CardTitle>
              <CardDescription className="text-slate-500">Acompanhe e autorize o acesso dos estudantes</CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Buscar aluno..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200 focus:ring-blue-500/30 text-slate-900"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="text-slate-600">Aluno</TableHead>
                      <TableHead className="text-slate-600">Nível</TableHead>
                      <TableHead className="text-slate-600">XP Total</TableHead>
                      <TableHead className="text-slate-600">Turma</TableHead>
                      <TableHead className="text-slate-600">Período</TableHead>
                      <TableHead className="text-slate-600 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border border-slate-200">
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback>{student.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{student.name}</p>
                              <p className="text-[10px] text-slate-500">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">
                            Lvl {student.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700 font-mono">
                          {student.xp.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {student.class || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {student.period || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => {
                              setEditingStudent(student);
                              setAllocationForm({
                                school: student.school || "",
                                class: student.class || "",
                                period: student.period || "Manhã"
                              });
                            }}
                          >
                            <SettingsIcon className="w-4 h-4 mr-1" /> Alocar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-6">
                <Card className="bg-slate-50 border-slate-200 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-slate-900">Pré-cadastrar Aluno</CardTitle>
                    <CardDescription className="text-xs">Autorize novos alunos no sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form 
                      className="space-y-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const email = (formData.get("email") as string).toLowerCase();
                        const ra = formData.get("ra") as string;
                        
                        if (!email.includes("@al.educacao.")) {
                          toast.error("Email deve ser @al.educacao.sp.gov.br");
                          return;
                        }

                        try {
                          await preRegisterMutation.mutateAsync({
                            email,
                            ra,
                            teacherId: user.id
                          });
                          toast.success("Aluno pré-cadastrado com sucesso!");
                          e.currentTarget.reset();
                        } catch (err: any) {
                          toast.error(err.message || "Erro ao pré-cadastrar.");
                        }
                      }}
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="student-email" className="text-xs text-slate-700">Email do Aluno</Label>
                        <Input 
                          id="student-email" 
                          name="email"
                          placeholder="aluno@al.educacao.sp.gov.br" 
                          className="h-9 bg-white border-slate-200 text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="student-ra" className="text-xs text-slate-700">RA do Aluno</Label>
                        <Input 
                          id="student-ra" 
                          name="ra"
                          placeholder="RA123456" 
                          className="h-9 bg-white border-slate-200 text-sm"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full gradient-btn h-9 text-sm font-semibold" loading={preRegisterMutation.isPending}>
                        Autorizar Acesso
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "missions" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Gerenciamento de Missões</h2>
              <p className="text-sm text-slate-500">Crie e gerencie desafios para seus alunos.</p>
            </div>
            <Button onClick={() => setShowMissionForm(!showMissionForm)} className="gradient-btn">
              <Plus className="w-4 h-4 mr-2" /> Nova Missão
            </Button>
          </div>

          {showMissionForm && (
            <Card className="bg-white border-slate-200 shadow-md border-l-4 border-l-blue-600">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Criar Nova Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateMission} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Título da Missão</Label>
                      <Input name="title" placeholder="Ex: Inventário Rotativo Semanal" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Descrição Detalhada</Label>
                      <textarea 
                        name="description" 
                        className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        placeholder="Descreva os objetivos da missão..."
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Tipo de Validação</Label>
                      <select 
                        name="type" 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                      >
                        <option value="product_count">Cadastro de Produtos</option>
                        <option value="supplier_count">Cadastro de Fornecedores</option>
                        <option value="customer_count">Cadastro de Clientes</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Meta (Quantidade)</Label>
                      <Input name="targetValue" type="number" placeholder="Ex: 5" defaultValue="5" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Recompensa (XP)</Label>
                      <Input name="reward" type="number" placeholder="Ex: 500" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Dificuldade</Label>
                      <select 
                        name="difficulty" 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                      >
                        <option value="Fácil">Fácil</option>
                        <option value="Médio">Médio</option>
                        <option value="Difícil">Difícil</option>
                        <option value="Lendário">Lendário</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1 gradient-btn" loading={createMissionMutation.isPending}>
                        Salvar Missão
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowMissionForm(false)} className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions?.map((mission) => (
              <Card key={mission.id} className="bg-white border-slate-200 hover:border-blue-500/30 transition-all group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge className={cn(
                      "text-[10px] uppercase tracking-widest",
                      mission.difficulty === "Fácil" ? "bg-green-100 text-green-700" :
                      mission.difficulty === "Médio" ? "bg-blue-100 text-blue-700" :
                      mission.difficulty === "Difícil" ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {mission.difficulty}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteMission(mission.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-base font-bold mt-2">{mission.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4">{mission.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-bold text-slate-900">+{mission.reward} XP</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Global
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!missions || missions.length === 0) && (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Nenhuma missão cadastrada ainda.</p>
                <Button variant="link" onClick={() => setShowMissionForm(true)} className="text-blue-600">
                  Criar a primeira missão
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Simulador de Eventos Globais
                </CardTitle>
                <CardDescription>Trigge eventos que afetam todos os alunos simultaneamente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Greve de Caminhoneiros", desc: "Reduz a velocidade de entrega e aumenta custos de frete.", type: "error", icon: AlertTriangle },
                  { title: "Black Friday Antecipada", desc: "Aumento súbito de 300% na demanda de pedidos.", type: "warning", icon: Zap },
                  { title: "Novo Porto Inaugurado", desc: "Redução de 20% no tempo de importação de insumos.", type: "success", icon: CheckCircle2 },
                ].map((event, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between group hover:border-blue-500/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-lg",
                        event.type === "error" ? "bg-red-100 text-red-600" :
                        event.type === "warning" ? "bg-orange-100 text-orange-600" :
                        "bg-green-100 text-green-600"
                      )}>
                        <event.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{event.title}</p>
                        <p className="text-xs text-slate-500">{event.desc}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => toast.info(`Evento "${event.title}" disparado para a turma!`)}
                    >
                      Disparar
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Configurações da Turma</CardTitle>
                <CardDescription>Ajuste parâmetros globais da simulação.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Modo Competitivo</p>
                      <p className="text-xs text-slate-500">Habilita o ranking visível entre alunos.</p>
                    </div>
                    <div 
                      onClick={() => toggleSetting("competitive_mode", settingsData?.competitive_mode || "false")}
                      className={cn(
                        "w-12 h-6 rounded-full relative cursor-pointer transition-colors",
                        settingsData?.competitive_mode === "true" ? "bg-blue-600" : "bg-slate-200"
                      )}
                    >
                      <motion.div 
                        animate={{ x: settingsData?.competitive_mode === "true" ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Auto-Correção de Missões</p>
                      <p className="text-xs text-slate-500">O sistema valida automaticamente o progresso.</p>
                    </div>
                    <div 
                      onClick={() => toggleSetting("auto_correct_missions", settingsData?.auto_correct_missions || "false")}
                      className={cn(
                        "w-12 h-6 rounded-full relative cursor-pointer transition-colors",
                        settingsData?.auto_correct_missions === "true" ? "bg-blue-600" : "bg-slate-200"
                      )}
                    >
                      <motion.div 
                        animate={{ x: settingsData?.auto_correct_missions === "true" ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {/* Allocation Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Alocar Estudante</CardTitle>
              <CardDescription>Defina a escola, turma e período para {editingStudent.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Escola / Unidade</Label>
                <Input 
                  value={allocationForm.school}
                  onChange={e => setAllocationForm({...allocationForm, school: e.target.value})}
                  placeholder="Ex: ETEC de São Paulo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Turma</Label>
                  <Input 
                    value={allocationForm.class}
                    onChange={e => setAllocationForm({...allocationForm, class: e.target.value})}
                    placeholder="Ex: 3º Log A"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Período</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm"
                    value={allocationForm.period}
                    onChange={e => setAllocationForm({...allocationForm, period: e.target.value})}
                  >
                    <option>Manhã</option>
                    <option>Tarde</option>
                    <option>Noite</option>
                    <option>Integral</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingStudent(null)}>Cancelar</Button>
                <Button 
                  className="gradient-btn"
                  onClick={() => updateAllocation.mutate({
                    studentId: editingStudent.id,
                    ...allocationForm
                  })}
                  disabled={updateAllocation.isPending}
                >
                  {updateAllocation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alocação"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

