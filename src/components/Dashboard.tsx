import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  Trophy,
  Zap,
  Target,
  RefreshCw,
  Download,
  CloudLightning,
  ShieldAlert,
  Truck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const events = []; // Start with no events

const chartData = [
  { name: "Seg", desempenho: 0, eficiencia: 0 },
  { name: "Ter", desempenho: 0, eficiencia: 0 },
  { name: "Qua", desempenho: 0, eficiencia: 0 },
  { name: "Qui", desempenho: 0, eficiencia: 0 },
  { name: "Sex", desempenho: 0, eficiencia: 0 },
  { name: "Sáb", desempenho: 0, eficiencia: 0 },
  { name: "Dom", desempenho: 0, eficiencia: 0 },
];

const ranking = []; // Start with no ranking

import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard({ user }: { user: any }) {
  const [activeEvent, setActiveEvent] = useState<any>(null);
  
  const { data: productsData, isLoading: loadingProducts } = trpc.getProducts.useQuery();
  const { data: missionsData, isLoading: loadingMissions } = trpc.getMissions.useQuery();
  const { data: activitiesData, isLoading: loadingActivities } = trpc.getActivities.useQuery();
  const { data: settingsData } = trpc.getSettings.useQuery();
  const createActivity = trpc.createActivity.useMutation();

  if (loadingProducts || loadingMissions || loadingActivities) {
    return (
      <div className="space-y-8 pb-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[450px] rounded-xl" />
          <Skeleton className="h-[450px] rounded-xl" />
        </div>
      </div>
    );
  }

  const triggerEvent = () => {
    // In a real app, this would be triggered by the system or teacher
    toast.info("Simulação de eventos desativada para início limpo.");
  };

  const activeOrdersCount = productsData?.reduce((acc, p) => acc + (p.stock > 0 ? 1 : 0), 0) || 0;

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("Relatório de Desempenho Operacional", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Aluno: ${user?.name || "N/A"}`, 14, 35);
    doc.text(`Nível: ${user?.level || 1} | XP: ${user?.xp || 0}`, 14, 40);

    // Stats Section
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Resumo da Operação", 14, 55);
    
    const statsData = [
      ["Eficiência Global", "0.0%"],
      ["Produtos em Linha", String(productsData?.length || 0)],
      ["Nível de Serviço", "0.0%"],
      ["Alertas Críticos", activeEvent ? "1" : "0"]
    ];

    doc.autoTable({
      startY: 60,
      head: [["Indicador", "Valor"]],
      body: statsData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Missions Section
    if (missionsData && missionsData.length > 0) {
      doc.setFontSize(14);
      doc.text("Missões Ativas", 14, (doc as any).lastAutoTable.finalY + 15);
      
      const missionsTable = missionsData.map((m: any) => [
        m.title,
        m.difficulty,
        `${m.progress}%`,
        `+${m.reward} XP`
      ]);

      doc.autoTable({
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [["Missão", "Dificuldade", "Progresso", "Recompensa"]],
        body: missionsTable,
        theme: "striped",
        headStyles: { fillColor: [234, 88, 12] }
      });
    }

    doc.save(`relatorio_operacional_${user?.name?.toLowerCase().replace(/\s+/g, '_')}.pdf`);
    toast.success("Relatório operacional exportado com sucesso!");
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Operacional</h1>
          <p className="text-slate-600 mt-1">Bem-vindo ao centro de comando, {user?.name?.split(' ')[0] || "Usuário"}. Aqui está o resumo da sua operação.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={exportToPDF}
            variant="outline" 
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
          <Button 
            onClick={triggerEvent}
            variant="outline" 
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Simular Evento
          </Button>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">
            <Zap className="w-3 h-3 mr-1" /> Nível {user?.level || 1}
          </Badge>
        </div>
      </div>

      <AnimatePresence>
        {activeEvent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`p-4 rounded-xl border flex items-center gap-4 ${
              activeEvent.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" :
              activeEvent.type === "warning" ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
              "bg-green-500/10 border-green-500/20 text-green-400"
            }`}>
              <activeEvent.icon className="w-6 h-6 shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-sm uppercase tracking-wider">Evento Ativo: {activeEvent.title}</p>
                <p className="text-xs opacity-80">{activeEvent.desc}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveEvent(null)}
                className="hover:bg-white/5"
              >
                Dispensar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Eficiência Global", value: "0.0%", icon: TrendingUp, color: "text-blue-500", trend: "0%" },
          { title: "Produtos em Linha", value: productsData?.length || "0", icon: Package, color: "text-orange-500", trend: "0" },
          { title: "Nível de Serviço", value: "0.0%", icon: CheckCircle2, color: "text-green-500", trend: "0%" },
          { title: "Alertas Críticos", value: activeEvent ? "1" : "0", icon: AlertTriangle, color: "text-red-500", trend: "0" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-white border-slate-200 hover:border-blue-500/30 transition-all group shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-green-600 flex items-center">
                    {stat.trend} <ArrowUpRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Desempenho da Cadeia de Suprimentos
            </CardTitle>
            <CardDescription className="text-slate-500">Análise semanal de eficiência e volume de pedidos</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                  itemStyle={{ color: "#0f172a" }}
                />
                <Area type="monotone" dataKey="desempenho" stroke="#2563eb" fillOpacity={1} fill="url(#colorDes)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ranking */}
        {settingsData?.competitive_mode === "true" && (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900">
                <Trophy className="w-5 h-5 text-orange-600" />
                Ranking da Turma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ranking.map((user, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${user.current ? "bg-blue-50 border border-blue-100" : "hover:bg-slate-50"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? "bg-yellow-100 text-yellow-700" : 
                        i === 1 ? "bg-slate-100 text-slate-700" : 
                        i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-500"
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">Nível {user.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">{user.points.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900">
              <Clock className="w-5 h-5 text-slate-500" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activitiesData?.map((activity: any) => (
                <div key={activity.id} className="flex gap-4">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    activity.type === "success" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.2)]" :
                    activity.type === "warning" ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.2)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                  }`} />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                      <span className="text-[10px] text-slate-500">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{activity.description}</p>
                  </div>
                </div>
              ))}
              {(!activitiesData || activitiesData.length === 0) && (
                <p className="text-xs text-slate-500 text-center py-4">Nenhuma atividade recente.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Missions */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900">
              <Target className="w-5 h-5 text-red-600" />
              Missões Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missionsData?.map((mission: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-500/20 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{mission.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Dificuldade: {mission.difficulty}</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none text-[10px]">
                      +{mission.reward} XP
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>Progresso</span>
                      <span>{mission.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500" 
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!missionsData || missionsData.length === 0) && (
                <p className="text-xs text-slate-500 text-center py-4 col-span-2">Nenhuma missão ativa.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
