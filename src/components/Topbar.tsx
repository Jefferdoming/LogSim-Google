import { Bell, Search, User, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function Topbar({ user }: { user: any }) {
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || "U";
  const levelProgress = user?.xp ? (user.xp % 1000) / 10 : 0; // Dynamic progress based on XP
  const hasNotifications = false; // This could be dynamic

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-40">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar no ERP..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-slate-900"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Zap className="w-3 h-3 text-orange-500" />
            <span>Progresso do Nível {user?.level || 1}</span>
            <span className="text-blue-600">{levelProgress}%</span>
          </div>
          <Progress value={levelProgress} className="w-32 h-1.5 bg-slate-100" />
        </div>

        <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
          <Bell className="w-5 h-5" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name || "Usuário"}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {user?.role === 'teacher' ? 'Professor' : (user?.course || "Estudante")}
                </p>
              </div>
              <Avatar className="w-9 h-9 border border-blue-500/30">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200">
            <DropdownMenuLabel className="text-slate-900">Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="focus:bg-slate-50 text-slate-700">Perfil</DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-slate-50 text-slate-700">Configurações</DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-slate-50 text-slate-700">Suporte</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="text-red-600 focus:bg-red-50">Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
