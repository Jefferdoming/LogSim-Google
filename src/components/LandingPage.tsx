import React from "react";
import { 
  Zap, 
  Shield, 
  BarChart3, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  LayoutDashboard,
  Package,
  Truck,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";

export function LandingPage({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="w-6 h-6 text-white fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">LogSim <span className="text-blue-600">Pro</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Recursos</a>
              <a href="#about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Sobre</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Planos</a>
              <Button onClick={onLoginClick} className="gradient-btn px-6 h-10 font-semibold">
                Entrar no Sistema
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3 h-3" /> Nova Versão 2.0 Disponível
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                Simule a Logística do <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">Mundo Real</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                O LogSim Pro é o simulador ERP mais avançado para educação técnica. 
                Gerencie cadeias de suprimentos complexas, tome decisões sob pressão e 
                domine as ferramentas que movem o mercado global.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={onLoginClick} className="gradient-btn h-14 px-8 text-lg font-bold shadow-xl shadow-blue-500/20 group">
                  Começar Simulação <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" className="h-14 px-8 text-lg font-bold border-slate-200 hover:bg-slate-50">
                  Ver Demonstração
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-orange-500/20 blur-3xl rounded-full" />
              <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/logistics/1200/800" 
                  alt="Dashboard Preview" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Eficiência Operacional</p>
                      <p className="text-[10px] text-slate-500">Aumento de 24% na última semana</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-600">98.5%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-blue-600 font-bold uppercase tracking-widest text-sm">Recursos Premium</h2>
            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">Tudo o que você precisa para dominar a logística</h3>
            <p className="text-slate-600">Uma plataforma completa que integra todos os elos da cadeia de suprimentos em um único lugar.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Gestão de WMS", desc: "Controle total de endereçamento, picking e inventário rotativo em tempo real.", icon: Package, color: "bg-blue-500" },
              { title: "Planejamento MRP", desc: "Cálculo automatizado de necessidades de materiais baseado em demanda real.", icon: BarChart3, color: "bg-orange-500" },
              { title: "TMS & Transportes", desc: "Otimização de rotas, gestão de frotas e controle rigoroso de custos de frete.", icon: Truck, color: "bg-green-500" },
              { title: "Comércio Exterior", desc: "Módulo SISCOMEX para simulação de processos de importação e exportação.", icon: Globe, color: "bg-purple-500" },
              { title: "Painel do Professor", desc: "Acompanhamento em tempo real do desempenho e progresso de cada aluno.", icon: GraduationCap, color: "bg-indigo-500" },
              { title: "Eventos Globais", desc: "Simulação de crises reais como greves, quebras de safra e picos de demanda.", icon: Zap, color: "bg-red-500" },
            ].map((feature, i) => (
              <Card key={i} className="bg-white border-slate-200 hover:border-blue-500/30 transition-all group">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight relative z-10">
              Pronto para elevar o nível do seu ensino?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto relative z-10">
              Utilize o LogSim Pro para formar os melhores profissionais de logística do país através de simulações imersivas.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Button onClick={onLoginClick} className="gradient-btn h-14 px-10 text-lg font-bold shadow-2xl shadow-blue-500/20">
                Acessar Sistema
              </Button>
              <Button variant="outline" className="h-14 px-10 text-lg font-bold border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all">
                Falar com Consultor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">LogSim Pro</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 LogSim Pro. Desenvolvido para a Rede Estadual de Ensino.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Shield className="w-5 h-5" /></a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Users className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
