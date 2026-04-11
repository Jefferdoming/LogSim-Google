import React, { useState } from "react";
import { Logo } from "./Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Lock, Mail, User, BookOpen, Hash, Phone, MapPin, School, Users as UsersIcon, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [view, setView] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [ra, setRa] = useState("");
  const [course, setCourse] = useState("");
  const [school, setSchool] = useState("");
  const [className, setClassName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [emailChecked, setEmailChecked] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const loginMutation = trpc.login.useMutation();
  const registerMutation = trpc.register.useMutation();
  const resetPasswordMutation = trpc.resetPassword.useMutation();
  const checkEmailMutation = trpc.checkEmail.useMutation();

  const validateEmail = (val: string) => {
    setEmail(val);
    const lowerVal = val.toLowerCase();
    if (lowerVal.includes("@prof.educacao") || lowerVal.includes("@al.educacao")) {
      setIsValid(true);
    } else if (val.length > 0) {
      setIsValid(false);
    } else {
      setIsValid(null);
    }
  };

  const isStudent = email.toLowerCase().includes("@al.educacao");
  const isTeacher = email.toLowerCase().includes("@prof.educacao");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailLower = email.toLowerCase();
    const isEmailValid = emailLower.includes("@prof.educacao") || emailLower.includes("@al.educacao");

    if (!isEmailValid) {
      toast.error("Por favor, utilize seu e-mail institucional (@al.educacao ou @prof.educacao).");
      return;
    }

    if (view === 'register') {
      if (!name.trim()) {
        toast.error("Por favor, preencha seu nome completo.");
        return;
      }
      if (isStudent && (!ra.trim() || !school.trim() || !className.trim() || !course.trim())) {
        toast.error("Alunos devem preencher todos os campos obrigatórios (RA, Escola, Turma e Curso).");
        return;
      }
    }

    if (!password) {
      toast.error("Por favor, informe sua senha.");
      return;
    }

    try {
      if (view === 'register') {
        const newUser = await registerMutation.mutateAsync({
          email: emailLower,
          password,
          name,
          ra: isStudent ? ra : undefined,
          course: isStudent ? course : undefined,
          school: isStudent ? school : undefined,
          class: isStudent ? className : undefined,
          phone,
          address
        });
        toast.success("Conta criada com sucesso!");
        onLogin(newUser);
      } else {
        const user = await loginMutation.mutateAsync({ email: emailLower, password });
        if (user) {
          toast.success(`Bem-vindo, ${user.name}!`);
          onLogin(user);
        } else {
          toast.error("Email ou senha incorretos. Verifique seus dados.");
        }
      }
    } catch (error: any) {
      console.error("Login/Register Error:", error);
      toast.error(error.message || "Erro ao processar solicitação. Tente novamente.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = email.toLowerCase();
    
    if (!emailChecked) {
      setCheckingEmail(true);
      try {
        const result = await checkEmailMutation.mutateAsync({ email: emailLower });
        if (result.exists) {
          setEmailChecked(true);
          toast.success("E-mail verificado! Agora informe sua nova senha.");
        } else {
          toast.error("E-mail não encontrado no sistema.");
        }
      } catch (error) {
        toast.error("Erro ao verificar e-mail.");
      } finally {
        setCheckingEmail(false);
      }
      return;
    }

    if (!password) {
      toast.error("Por favor, informe a nova senha.");
      return;
    }

    try {
      const result = await resetPasswordMutation.mutateAsync({ email: emailLower, newPassword: password });
      if (result.success) {
        toast.success("Senha atualizada com sucesso! Você já pode entrar.");
        setView('login');
        setPassword("");
        setEmailChecked(false);
      } else {
        toast.error("Erro ao resetar senha.");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar solicitação.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
      >
        {/* Onboarding / Info Section */}
        <div className="hidden lg:block space-y-8 pr-8">
          <div className="space-y-4">
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 px-3 py-1">
              LogSim Pro v2.0
            </Badge>
            <h1 className="text-5xl font-bold text-slate-900 leading-tight">
              Transformando o Ensino de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">Logística</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Uma plataforma gamificada completa para simulação de processos ERP, 
              cadeia de suprimentos e gestão operacional.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="p-3 rounded-xl bg-blue-500/10 h-fit">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Para o Estudante</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Aprenda na prática com missões reais, ganhe XP, suba de nível e 
                  domine as ferramentas de um ERP profissional.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="p-3 rounded-xl bg-orange-500/10 h-fit">
                <School className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Para o Professor</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Gerencie turmas, acompanhe o desempenho individual e extraia 
                  relatórios detalhados para análise pedagógica.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200">
            <p className="text-sm font-semibold text-slate-900">Idealizado por Prof° Jefferson Costa</p>
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone className="w-3 h-3 text-blue-600" />
                <span>55 11 932888396</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail className="w-3 h-3 text-orange-600" />
                <span>jeffersondomingos@prof.educacao.sp.gov.br</span>
              </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-white border-slate-200 shadow-2xl relative z-10">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="flex justify-center mb-2 lg:hidden">
              <Logo className="w-12 h-12" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
              {view === 'register' ? "Criar sua Conta" : view === 'forgot-password' ? "Recuperar Senha" : "Acesso ao Sistema"}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {view === 'register' 
                ? "Preencha os dados abaixo para se cadastrar" 
                : view === 'forgot-password'
                ? (emailChecked ? "Informe a NOVA senha desejada" : "Informe seu e-mail institucional para verificar sua conta")
                : "Acesse sua conta institucional para entrar no simulador"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={view === 'forgot-password' ? handleForgotPassword : handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {view === 'register' && (
                  <motion.div
                    key="register-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="name"
                          placeholder="Seu nome completo"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500/20 text-slate-900"
                          required={view === 'register'}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-700">Telefone (Opcional)</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="phone"
                            placeholder="(00) 00000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500/20 text-slate-900"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-slate-700">Endereço (Opcional)</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="address"
                            placeholder="Seu endereço"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500/20 text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {isStudent && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ra" className="text-slate-700">RA</Label>
                            <div className="relative">
                              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="ra"
                                placeholder="Seu RA"
                                value={ra}
                                onChange={(e) => setRa(e.target.value)}
                                className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500/20 text-slate-900"
                                required={isStudent}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="school" className="text-slate-700">Escola</Label>
                            <div className="relative">
                              <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="school"
                                placeholder="Nome da escola"
                                value={school}
                                onChange={(e) => setSchool(e.target.value)}
                                className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500/20 text-slate-900"
                                required={isStudent}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="className" className="text-slate-700">Turma</Label>
                            <div className="relative">
                              <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="className"
                                placeholder="Sua turma"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500/20 text-slate-900"
                                required={isStudent}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="course" className="text-slate-700">Curso</Label>
                            <div className="relative">
                              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="course"
                                placeholder="Seu curso"
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500/20 text-slate-900"
                                required={isStudent}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email Institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@al.educacao.sp.gov.br"
                    value={email}
                    onChange={(e) => validateEmail(e.target.value)}
                    className={`pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500/20 transition-all text-slate-900 ${
                      isValid === true ? "border-green-500/50" : isValid === false ? "border-red-500/50" : ""
                    }`}
                    required
                  />
                  {isValid === true && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                  )}
                  {isValid === false && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
                  )}
                </div>
                {isValid === false && (
                  <p className="text-[10px] text-red-600 font-medium">Utilize seu email @al.educacao ou @prof.educacao</p>
                )}
              </div>

              {view !== 'forgot-password' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700">Senha</Label>
                    <button 
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500/20 text-slate-900"
                      required
                    />
                  </div>
                </div>
              )}

              {view === 'forgot-password' && emailChecked && (
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-slate-700">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Digite sua nova senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500/20 text-slate-900"
                      required
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full gradient-btn h-11 font-semibold text-white shadow-lg shadow-blue-500/10 cursor-pointer relative z-20"
                loading={loginMutation.isPending || registerMutation.isPending || resetPasswordMutation.isPending || checkingEmail}
              >
                {view === 'register' ? "Criar Conta" : view === 'forgot-password' ? (emailChecked ? "Redefinir Senha" : "Verificar E-mail") : "Entrar no Sistema"}
              </Button>

              {view === 'forgot-password' && (
                <Button 
                  variant="ghost" 
                  className="w-full text-slate-600 hover:text-slate-900"
                  onClick={() => setView('login')}
                >
                  Voltar para o Login
                </Button>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2 pb-8 relative z-20">
            <Button 
              variant="link" 
              type="button"
              className="text-blue-600 hover:text-blue-700 text-xs cursor-pointer relative z-30"
              onClick={(e) => {
                e.preventDefault();
                setView(view === 'register' ? 'login' : 'register');
                setEmailChecked(false);
              }}
            >
              {view === 'register' ? "Já tem uma conta? Entre aqui" : "Não tem uma conta? Crie agora"}
            </Button>
            
            {/* Mobile Credits */}
            <div className="lg:hidden text-center space-y-2 pt-4 border-t border-slate-200 w-full">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Idealizado por Prof° Jefferson Costa</p>
              <p className="text-[10px] text-slate-500">jeffersondomingos@prof.educacao.sp.gov.br</p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
