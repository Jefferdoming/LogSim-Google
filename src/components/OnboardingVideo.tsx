import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  SkipForward, 
  X, 
  LayoutDashboard, 
  Users, 
  Target, 
  Zap,
  GraduationCap,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { Button } from "./ui/button";

const slides = [
  {
    title: "Bem-vindo ao LogSim Pro",
    description: "A plataforma definitiva para transformar suas aulas de logística em uma experiência prática e gamificada.",
    icon: RocketIcon,
    image: "https://picsum.photos/seed/logsim1/1200/800",
    benefit: "Engajamento total dos alunos desde o primeiro minuto."
  },
  {
    title: "Dashboard em Tempo Real",
    description: "Acompanhe o desempenho da sua turma, níveis de XP e progresso individual instantaneamente.",
    icon: LayoutDashboard,
    image: "https://picsum.photos/seed/logsim2/1200/800",
    benefit: "Visão 360º da evolução pedagógica da sala."
  },
  {
    title: "Simulação ERP Completa",
    description: "Os alunos gerenciam produtos, BOM, fornecedores e WMS como se estivessem em uma empresa real.",
    icon: Zap,
    image: "https://picsum.photos/seed/logsim3/1200/800",
    benefit: "Prática profissional sem riscos, direto no navegador."
  },
  {
    title: "Missões e Gamificação",
    description: "Crie desafios personalizados. O sistema corrige automaticamente e premia os alunos com XP.",
    icon: Target,
    image: "https://picsum.photos/seed/logsim4/1200/800",
    benefit: "Motivação através de conquistas e ranking competitivo."
  },
  {
    title: "Relatórios e Gestão",
    description: "Gere PDFs de desempenho e controle o acesso da sua escola com facilidade.",
    icon: Users,
    image: "https://picsum.photos/seed/logsim5/1200/800",
    benefit: "Redução da carga administrativa do professor."
  }
];

function RocketIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.5-1 1.3-2.1c1.1-1.7 2-4 2-4" />
      <path d="M15 15v5s-1-.5-2.1-1.3c-1.7-1.1-4-2-4-2" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

export function OnboardingVideo({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    let timer: any;
    if (isPlaying && isOpen) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isOpen]);

  if (!isOpen) return null;

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 md:p-8">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Visual Side */}
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800 group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img 
                src={slide.image} 
                alt={slide.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
            <motion.div 
              key={currentSlide + (isPlaying ? 'playing' : 'paused')}
              initial={{ width: "0%" }}
              animate={{ width: isPlaying ? "100%" : "0%" }}
              transition={{ duration: isPlaying ? 5 : 0, ease: "linear" }}
              className="h-full bg-blue-500"
            />
          </div>

          {/* Controls Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/20">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-all"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-6 bg-blue-600 hover:bg-blue-500 rounded-full shadow-xl text-white transition-all transform hover:scale-110"
              >
                {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
              </button>
              <button 
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-all"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Side */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <slide.icon className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-widest">Módulo {currentSlide + 1}</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {slide.title}
              </h2>

              <p className="text-xl text-slate-400 leading-relaxed">
                {slide.description}
              </p>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/20 to-orange-600/20 border border-white/5">
                <p className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-2">Como isso ajuda suas aulas:</p>
                <p className="text-lg text-white font-medium italic">"{slide.benefit}"</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex items-center gap-3 pt-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  currentSlide === i ? "w-12 bg-blue-500" : "w-2 bg-white/20 hover:bg-white/40"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 pt-8">
            <Button 
              onClick={onClose}
              className="bg-white text-slate-900 hover:bg-slate-100 px-8 h-12 rounded-full font-bold text-lg"
            >
              Começar a Usar Agora
            </Button>
            <Button 
              variant="outline"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="border-white/20 text-white hover:bg-white/10 px-6 h-12 rounded-full font-bold"
            >
              Próximo <SkipForward className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
