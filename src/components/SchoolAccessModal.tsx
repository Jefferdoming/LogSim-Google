import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, School, Mail, Phone, User as UserIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function SchoolAccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [schoolName, setSchoolName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  
  const requestMutation = trpc.requestSchoolAccess.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestMutation.mutateAsync({
        schoolName,
        contactName,
        email,
        phone,
        message
      });
      toast.success("Solicitação enviada com sucesso! Entraremos em contato em breve.");
      onClose();
      // Reset
      setSchoolName("");
      setContactName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (error) {
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg"
          >
            <Card className="bg-white border-slate-200 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-orange-600" />
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <CardHeader className="pt-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <School className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Solicitar Acesso Escolar</CardTitle>
                <CardDescription className="text-slate-600">
                  Leve o LogSim Pro para sua instituição e transforme o aprendizado de logística.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">Nome da Instituição</Label>
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="schoolName"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Ex: ETEC de São Paulo"
                        className="pl-10 bg-slate-50 border-slate-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Nome do Contato</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="contactName"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Seu nome"
                          className="pl-10 bg-slate-50 border-slate-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(00) 00000-0000"
                          className="pl-10 bg-slate-50 border-slate-200"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail para Contato</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contato@escola.com.br"
                        className="pl-10 bg-slate-50 border-slate-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem (Opcional)</Label>
                    <Textarea 
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Conte-nos um pouco sobre sua necessidade..."
                      className="bg-slate-50 border-slate-200 min-h-[100px]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gradient-btn h-12 font-bold text-white shadow-lg shadow-blue-500/20"
                    disabled={requestMutation.isPending}
                  >
                    {requestMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : "Enviar Solicitação"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
