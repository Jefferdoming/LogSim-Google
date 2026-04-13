import React from "react";
import { trpc } from "@/lib/trpc";
import { 
  Target, 
  CheckCircle2, 
  Lock, 
  Zap, 
  Trophy,
  ArrowRight,
  Loader2,
  Flag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function MissionsView({ user }: { user: any }) {
  const { data: trails, isLoading, refetch } = trpc.getMissionTrails.useQuery({ userId: user.id });
  const seedTrails = trpc.seedBasicTrails.useMutation({
    onSuccess: () => refetch()
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!trails || Object.keys(trails).length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <Flag className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Nenhuma trilha disponível</h2>
        <p className="text-slate-500">Clique abaixo para inicializar as trilhas básicas.</p>
        <Button onClick={() => seedTrails.mutate()} disabled={seedTrails.isPending}>
          {seedTrails.isPending ? "Inicializando..." : "Inicializar Trilhas Básicas"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Trilhas de Aprendizado</h1>
        <p className="text-slate-600 mt-2">Complete as missões em sequência para ganhar XP e subir no ranking.</p>
      </div>

      {Object.entries(trails).map(([trailId, missions]) => (
        <section key={trailId} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Trilha: {trailId}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {missions.map((mission, index) => {
              const isLocked = index > 0 && !missions[index - 1].completed;
              
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "h-full transition-all border-2",
                    mission.completed ? "border-green-500/30 bg-green-50/30" : 
                    isLocked ? "border-slate-100 bg-slate-50 opacity-75" : "border-blue-500/20 hover:border-blue-500/40"
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant={mission.completed ? "default" : "secondary"} className={cn(
                          mission.completed ? "bg-green-500" : "bg-slate-200 text-slate-600"
                        )}>
                          {mission.completed ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                          {mission.completed ? "Concluída" : isLocked ? "Bloqueada" : "Disponível"}
                        </Badge>
                        <span className="text-xs font-bold text-blue-600">+{mission.reward} XP</span>
                      </div>
                      <CardTitle className="text-lg font-bold mt-4 text-slate-900">{mission.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {mission.description}
                      </p>
                      
                      {isLocked ? (
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium py-2">
                          <Lock className="w-3 h-3" /> Conclua a missão anterior para desbloquear
                        </div>
                      ) : !mission.completed ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <span>Progresso</span>
                            <span>{mission.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 transition-all duration-500" 
                              style={{ width: `${mission.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 text-xs font-bold py-2">
                          <Trophy className="w-4 h-4" /> Recompensa resgatada!
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
