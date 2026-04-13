import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MapPin, Navigation, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TMSView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">TMS - Gestão de Transportes</h1>
          <p className="text-sm text-slate-600 mt-1">Otimização de rotas e monitoramento de frota em tempo real.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white border-slate-200">
            <Navigation className="w-4 h-4 mr-2" /> Otimizar Rotas
          </Button>
          <Button className="gradient-btn">
            <Truck className="w-4 h-4 mr-2" /> Novo Despacho
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" /> Mapa Interativo de Entregas
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Buscar endereço..." className="pl-9 h-8 text-xs bg-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 aspect-[16/9] relative bg-slate-100">
            {/* Simulated Google Maps */}
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              style={{ border: 0 }}
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d-46.6333!3d-23.5505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1spt-BR!2sbr!4v1620000000000!5m2!1spt-BR!2sbr"
              allowFullScreen
              loading="lazy"
            ></iframe>
            <div className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Status da Frota</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium">12 Veículos em Rota</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-xs font-medium">3 Aguardando Carga</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Próximas Entregas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {[
                  { id: "ENT-001", dest: "São Paulo, SP", status: "Em Rota", time: "14:30" },
                  { id: "ENT-002", dest: "Campinas, SP", status: "Pendente", time: "16:00" },
                  { id: "ENT-003", dest: "Santos, SP", status: "Atrasado", time: "15:15" },
                ].map((ent) => (
                  <div key={ent.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-blue-600">{ent.id}</span>
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0",
                        ent.status === "Em Rota" ? "bg-green-50 text-green-600 border-green-100" :
                        ent.status === "Atrasado" ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-600"
                      )}>
                        {ent.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{ent.dest}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Previsão: {ent.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
