import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Users, 
  ShoppingCart, 
  Factory, 
  Warehouse, 
  Globe, 
  FileText, 
  GraduationCap, 
  Settings,
  LogOut,
  Target
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";
import { SchoolAccessModal } from "./SchoolAccessModal";
import { OnboardingVideo } from "./OnboardingVideo";
import { Play } from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Package, label: "Produtos", id: "products" },
  { icon: Factory, label: "BOM", id: "bom" },
  { icon: Users, label: "Fornecedores", id: "suppliers" },
  { icon: ShoppingCart, label: "Clientes", id: "customers" },
  { icon: Settings, label: "MRP", id: "mrp" },
  { icon: Warehouse, label: "WMS", id: "wms" },
  { icon: Truck, label: "TMS", id: "tms" },
  { icon: Target, label: "Missões", id: "missions" },
  { icon: Globe, label: "SISCOMEX", id: "siscomex" },
  { icon: FileText, label: "Doc. Fiscais", id: "fiscal" },
  { icon: GraduationCap, label: "Painel Professor", id: "teacher", special: true },
];

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  onLogout,
  user 
}: { 
  activeTab: string, 
  onTabChange: (id: string) => void,
  onLogout: () => void,
  user: any
}) {
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 shadow-sm transition-all duration-300">
        <div className="p-6 border-b border-slate-50">
          <Logo />
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-4 custom-scrollbar">
          {menuItems.map((item) => {
            // Only show teacher panel if user is teacher
            if (item.id === 'teacher' && user?.role !== 'teacher') {
              return null;
            }
            
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-blue-50 text-blue-700 font-semibold" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  item.special && "mt-6 pt-6 border-t border-slate-100"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-md transition-colors",
                  isActive ? "bg-blue-100/50" : "bg-transparent group-hover:bg-slate-100"
                )}>
                  <item.icon className={cn(
                    "w-4 h-4 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-blue-600" : "text-slate-400"
                  )} />
                </div>
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" 
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100 space-y-4">
          <button 
            onClick={() => setIsOnboardingOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-sm group"
          >
            <div className="p-1.5 rounded-lg bg-white/20 group-hover:scale-110 transition-transform">
              <Play className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Ver em Ação</span>
          </button>

          <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-blue-50 to-orange-50 border border-blue-100/50 shadow-sm">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Versão Educacional</p>
            <p className="text-xs font-semibold text-slate-900 mt-1">Licença Ativa</p>
            <button 
              onClick={() => setIsAccessModalOpen(true)}
              className="text-[10px] text-orange-600 font-medium mt-2 hover:underline text-left"
            >
              Solicite acesso para sua escola →
            </button>
          </div>

          <div className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Idealização</p>
            <p className="text-xs text-slate-900 mt-1">Prof° Jefferson Costa</p>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      <SchoolAccessModal isOpen={isAccessModalOpen} onClose={() => setIsAccessModalOpen(false)} />
      <OnboardingVideo isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </>
  );
}
