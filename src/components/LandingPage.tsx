import React, { useState } from "react";
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
  GraduationCap,
  Play,
  Loader2,
  Mail,
  School,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LandingPage({ onLoginClick }: { onLoginClick: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [leadForm, setLeadForm] = useState({ name: "", email: "", school: "", role: "Professor", message: "" });
  const submitLead = trpc.submitLead.useMutation({
    onSuccess: () => {
      toast.success("Solicitação enviada com sucesso! Entraremos em contato em breve.");
      setLeadForm({ name: "", email: "", school: "", role: "Professor", message: "" });
    },
    onError: (err) => toast.error(err.message)
  });

  const onboardingSlides = [
    { title: "Dashboard Inteligente", desc: "Visão 360º de toda a operação logística.", img: "https://picsum.photos/seed/dashboard/1200/800" },
    { title: "Gestão de Estoque", desc: "Controle preciso de entradas e saídas.", img: "https://picsum.photos/seed/inventory/1200/800" },
    { title: "Roteirização TMS", desc: "Mapas interativos para otimização de entregas.", img: "https://picsum.photos/seed/truck/1200/800" },
    { title: "Painel do Professor", desc: "Gestão completa de turmas e desempenho.", img: "https://picsum.photos/seed/teacher/1200/800" },
  ];

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLead.mutate(leadForm);
  };

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

      {/* Onboarding Video/Slideshow Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider">
                <Play className="w-3 h-3 fill-orange-600" /> Veja o LogSim Pro em Ação
              </div>
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Onboarding Interativo para Professores</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Descubra como o LogSim Pro transforma suas aulas teóricas em experiências práticas imersivas. 
                Nossa plataforma foi desenhada para facilitar o ensino de conceitos complexos de forma visual e interativa.
              </p>
              <div className="space-y-4">
                {onboardingSlides.map((slide, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4",
                      currentSlide === i 
                        ? "bg-blue-50 border-blue-200 shadow-sm" 
                        : "bg-white border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                      currentSlide === i ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {i + 1}
                    </div>
                    <div>
                      <p className={cn("font-bold", currentSlide === i ? "text-blue-900" : "text-slate-700")}>{slide.title}</p>
                      <p className="text-xs text-slate-500">{slide.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={onboardingSlides[currentSlide].img}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture Section */}
      <section id="demo" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden grid lg:grid-cols-2">
            <div className="p-12 lg:p-20 bg-slate-900 text-white space-y-8">
              <h2 className="text-4xl font-bold tracking-tight">Solicite uma Demonstração Personalizada</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Nossa equipe de especialistas está pronta para mostrar como o LogSim Pro pode ser implementado na sua instituição. 
                Preencha o formulário e agende uma conversa.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">Apresentação completa dos módulos</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">Plano de implementação pedagógica</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">Acesso temporário para testes</p>
                </div>
              </div>
            </div>
            <div className="p-12 lg:p-20">
              <form onSubmit={handleLeadSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      required
                      placeholder="Seu nome" 
                      className="pl-10 bg-slate-50 border-slate-200"
                      value={leadForm.name}
                      onChange={e => setLeadForm({...leadForm, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">E-mail Institucional</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        required
                        type="email"
                        placeholder="seu@email.com" 
                        className="pl-10 bg-slate-50 border-slate-200"
                        value={leadForm.email}
                        onChange={e => setLeadForm({...leadForm, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Instituição / Escola</label>
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        required
                        placeholder="Nome da escola" 
                        className="pl-10 bg-slate-50 border-slate-200"
                        value={leadForm.school}
                        onChange={e => setLeadForm({...leadForm, school: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Seu Cargo</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={leadForm.role}
                    onChange={e => setLeadForm({...leadForm, role: e.target.value})}
                  >
                    <option>Professor</option>
                    <option>Coordenador</option>
                    <option>Diretor</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Mensagem (Opcional)</label>
                  <textarea 
                    className="w-full min-h-[100px] p-3 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Como podemos ajudar?"
                    value={leadForm.message}
                    onChange={e => setLeadForm({...leadForm, message: e.target.value})}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full gradient-btn h-12 text-lg font-bold"
                  disabled={submitLead.isPending}
                >
                  {submitLead.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Solicitar Demonstração"}
                </Button>
              </form>
            </div>
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
