import { Rocket } from "lucide-react";

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Rocket className="w-full h-full text-blue-500 animate-pulse" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full glow-orange" />
      </div>
      <span className="font-bold text-xl tracking-tighter bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
        LogSim Pro
      </span>
    </div>
  );
}
