/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./lib/trpc";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./components/Dashboard";
import { Login } from "./components/Login";
import { LandingPage } from "./components/LandingPage";
import { ModuleView } from "./components/ModuleView";
import { MRPView } from "./components/MRPView";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { Chatbot } from "./components/Chatbot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Download, Plus, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Mock data for modules (Now empty to start from scratch)
const productsData = [];

const productsColumns = [
  { key: "sku", label: "SKU" },
  { key: "name", label: "Produto" },
  { key: "category", label: "Categoria" },
  { key: "stock", label: "Estoque", type: "number", render: (val: number) => (
    <span className={val < 50 ? "text-orange-600 font-bold" : "text-slate-600"}>{val} un</span>
  )},
  { key: "price", label: "Preço", type: "number", render: (val: number) => `R$ ${val.toFixed(2)}` },
  { key: "status", label: "Status", render: (val: string) => (
    <Badge variant="outline" className={
      val === "Ativo" ? "bg-green-50 text-green-700 border-green-100" :
      val === "Estoque Baixo" ? "bg-orange-50 text-orange-700 border-orange-100" :
      "bg-red-50 text-red-700 border-red-100"
    }>
      {val}
    </Badge>
  )},
];

const bomColumns = [
  { key: "productSku", label: "SKU Produto" },
  { key: "componentSku", label: "SKU Componente" },
  { key: "quantity", label: "Quantidade", type: "number" },
  { key: "unit", label: "Unidade" },
];

const suppliersColumns = [
  { key: "name", label: "Razão Social" },
  { key: "cnpj", label: "CNPJ" },
  { key: "category", label: "Categoria" },
  { key: "contact", label: "Contato" },
  { key: "phone", label: "Telefone" },
];

const customersColumns = [
  { key: "name", label: "Nome" },
  { key: "document", label: "CPF/CNPJ" },
  { key: "type", label: "Tipo" },
  { key: "email", label: "E-mail" },
  { key: "phone", label: "Telefone" },
];

const wmsColumns = [
  { key: "sku", label: "SKU" },
  { key: "location", label: "Endereço" },
  { key: "quantity", label: "Quantidade", type: "number" },
  { key: "lastUpdated", label: "Última Atualização", render: (val: string) => val ? new Date(val).toLocaleString() : "-" },
];

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/trpc",
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function AppContent() {
  const [user, setUser] = useState<any>(() => {
    try {
      const savedUser = localStorage.getItem("logsim_user");
      if (savedUser && savedUser !== "undefined") {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error("Error parsing saved user:", e);
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLogin, setShowLogin] = useState(false);

  // Sync user data with server on mount if logged in
  const { data: latestUser, refetch: refetchUser } = trpc.getUser.useQuery(
    { email: user?.email || "" },
    { 
      enabled: !!user?.email,
    }
  );

  useEffect(() => {
    if (latestUser) {
      setUser(latestUser);
      localStorage.setItem("logsim_user", JSON.stringify(latestUser));
    } else if (latestUser === null && user?.email) {
      // User no longer exists in DB
      handleLogout();
    }
  }, [latestUser]);

  const ping = trpc.ping.useQuery();

  useEffect(() => {
    if (ping.data) {
      console.log("tRPC Connection: OK");
    }
    if (ping.error) {
      console.error("tRPC Connection Error:", ping.error);
    }
  }, [ping.data, ping.error]);

  const isLoggedIn = !!user && typeof user === 'object' && 'email' in user;

  // Redirect teacher to teacher dashboard on login
  useEffect(() => {
    if (user?.role === 'teacher') {
      setActiveTab('teacher');
    } else if (user?.role === 'student') {
      setActiveTab('dashboard');
    }
  }, [user]);

  const { data: productsData, isLoading: loadingProducts, refetch: refetchProducts } = trpc.getProducts.useQuery(undefined, {
    enabled: isLoggedIn,
  });
  const { data: bomData, isLoading: loadingBOM, refetch: refetchBOM } = trpc.getBOM.useQuery(undefined, {
    enabled: isLoggedIn,
  });
  const { data: suppliersData, isLoading: loadingSuppliers, refetch: refetchSuppliers } = trpc.getSuppliers.useQuery(undefined, {
    enabled: isLoggedIn,
  });
  const { data: customersData, isLoading: loadingCustomers, refetch: refetchCustomers } = trpc.getCustomers.useQuery(undefined, {
    enabled: isLoggedIn,
  });
  const { data: wmsData, isLoading: loadingWMS, refetch: refetchWMS } = trpc.getWMSInventory.useQuery(undefined, {
    enabled: isLoggedIn,
  });

  const importProducts = trpc.importProducts.useMutation();
  const importBOM = trpc.importBOM.useMutation();
  const importSuppliers = trpc.importSuppliers.useMutation();
  const importCustomers = trpc.importCustomers.useMutation();
  const importWMS = trpc.importWMSInventory.useMutation();

  const createProduct = trpc.createProduct.useMutation();
  const createSupplier = trpc.createSupplier.useMutation();
  const createCustomer = trpc.createCustomer.useMutation();
  const createBOM = trpc.createBOM.useMutation();
  const createWMS = trpc.createWMSInventory.useMutation();

  const checkMissions = trpc.checkMissions.useMutation();
  const preRegisterMutation = trpc.preRegisterStudent.useMutation();

  const handleAfterAction = async () => {
    if (user?.id) {
      await checkMissions.mutateAsync({ userId: user.id });
      refetchUser();
    }
  };

  const handleLogin = (u: any) => {
    if (!u) return;
    setUser(u);
    localStorage.setItem("logsim_user", JSON.stringify(u));
    toast.success(`Bem-vindo de volta, ${u.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("logsim_user");
    setActiveTab("dashboard");
    setShowLogin(false);
  };

  if (!isLoggedIn) {
    return (
      <>
        {showLogin ? (
          <Login onLogin={handleLogin} />
        ) : (
          <LandingPage onLoginClick={() => setShowLogin(true)} />
        )}
        <Toaster theme="light" position="top-right" />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard user={user} />;
      case "products":
        return (
          <ModuleView 
            title="Gestão de Produtos" 
            description="Gerencie o catálogo de itens, SKUs e categorias do sistema."
            data={productsData || []}
            columns={productsColumns}
            isLoading={loadingProducts}
            onImport={async (data) => {
              await importProducts.mutateAsync(data);
              await refetchProducts();
              await handleAfterAction();
            }}
            onAdd={async (data) => {
              await createProduct.mutateAsync(data);
              await refetchProducts();
              await handleAfterAction();
            }}
          />
        );
      case "bom":
        return (
          <ModuleView 
            title="Bill of Materials (BOM)" 
            description="Estrutura de produtos e lista de materiais para produção."
            data={bomData || []}
            columns={bomColumns}
            isLoading={loadingBOM}
            onImport={async (data) => {
              await importBOM.mutateAsync(data);
              await refetchBOM();
              await handleAfterAction();
            }}
            onAdd={async (data) => {
              await createBOM.mutateAsync(data);
              await refetchBOM();
              await handleAfterAction();
            }}
          />
        );
      case "suppliers":
        return (
          <ModuleView 
            title="Fornecedores" 
            description="Cadastro e homologação de parceiros de suprimentos."
            data={suppliersData || []}
            columns={suppliersColumns}
            isLoading={loadingSuppliers}
            onImport={async (data) => {
              await importSuppliers.mutateAsync(data);
              await refetchSuppliers();
              await handleAfterAction();
            }}
            onAdd={async (data) => {
              await createSupplier.mutateAsync(data);
              await refetchSuppliers();
              await handleAfterAction();
            }}
          />
        );
      case "customers":
        return (
          <ModuleView 
            title="Clientes" 
            description="Gestão da carteira de clientes e histórico de pedidos."
            data={customersData || []}
            columns={customersColumns}
            isLoading={loadingCustomers}
            onImport={async (data) => {
              await importCustomers.mutateAsync(data);
              await refetchCustomers();
              await handleAfterAction();
            }}
            onAdd={async (data) => {
              await createCustomer.mutateAsync(data);
              await refetchCustomers();
              await handleAfterAction();
            }}
          />
        );
      case "mrp":
        return <MRPView />;
      case "wms":
        return (
          <ModuleView 
            title="WMS - Armazenagem" 
            description="Gestão de endereçamento, picking e inventário rotativo."
            data={wmsData || []}
            columns={wmsColumns}
            isLoading={loadingWMS}
            onImport={async (data) => {
              await importWMS.mutateAsync(data);
              await refetchWMS();
              await handleAfterAction();
            }}
            onAdd={async (data) => {
              await createWMS.mutateAsync(data);
              await refetchWMS();
              await handleAfterAction();
            }}
          />
        );
      case "tms":
        return (
          <ModuleView 
            title="TMS - Transportes" 
            description="Gestão de frotas, rotas e custos de frete."
            data={[]}
            columns={[{ key: "route", label: "Rota" }, { key: "vehicle", label: "Veículo" }, { key: "cost", label: "Custo" }]}
          />
        );
      case "siscomex":
        return (
          <ModuleView 
            title="SISCOMEX" 
            description="Gestão de importação, exportação e regimes aduaneiros."
            data={[]}
            columns={[{ key: "di", label: "DI/RE" }, { key: "origin", label: "Origem" }, { key: "status", label: "Status" }]}
          />
        );
      case "fiscal":
        return (
          <ModuleView 
            title="Documentos Fiscais" 
            description="Emissão e gestão de NF-e, CT-e e obrigações fiscais."
            data={[]}
            columns={[{ key: "nfe", label: "NF-e" }, { key: "value", label: "Valor" }, { key: "date", label: "Emissão" }]}
          />
        );
      case "teacher":
        return <TeacherDashboard user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} user={user} />
      <Topbar user={user} />
      
      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-8 max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </main>

      <Chatbot />
      <Toaster theme="light" position="top-right" />
    </div>
  );
}
