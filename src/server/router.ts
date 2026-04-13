import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "../db/index.ts";
import { products, users, missions, activities, allowedStudents, bom, suppliers, customers, wmsInventory, schoolAccessRequests, settings, studentMissions, leads } from "../db/schema.ts";
import { eq, and, sql, desc } from "drizzle-orm";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  ping: publicProcedure.query(() => {
    console.log("Ping received");
    return "pong";
  }),

  // User procedures
  login: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      console.log("Login attempt for:", input.email);
      const emailLower = input.email.toLowerCase();
      try {
        const user = await db.query.users.findFirst({
          where: (users, { and, eq }) => and(
            eq(users.email, emailLower),
            eq(users.password, input.password)
          ),
        });
        console.log("User found:", !!user);
        return user || null;
      } catch (e) {
        console.error("Login Error:", e);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro interno no servidor." });
      }
    }),

  register: publicProcedure
    .input(z.object({ 
      email: z.string(), 
      name: z.string(),
      ra: z.string().optional(),
      course: z.string().optional(),
      school: z.string().optional(),
      class: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      password: z.string()
    }))
    .mutation(async ({ input }) => {
      console.log("Register attempt for:", input.email);
      const emailLower = input.email.toLowerCase();
      const isStudent = emailLower.includes("@al.educacao");
      const isTeacher = emailLower.includes("@prof.educacao");
      
      if (isStudent) {
        console.log("Checking if student is allowed...");
        if (!input.ra || !input.school || !input.class || !input.course) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Alunos devem fornecer RA, Escola, Turma e Curso."
          });
        }

        // Check if student is allowed
        const allowed = await db.query.allowedStudents.findFirst({
          where: and(
            eq(allowedStudents.email, emailLower),
            eq(allowedStudents.ra, input.ra)
          )
        });

        if (!allowed) {
          console.log("Student not allowed.");
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado. Alunos devem ser pré-cadastrados por um professor."
          });
        }
      }

      const role = isTeacher ? "teacher" : "student";
      console.log("Assigning role:", role);

      try {
        const newUser = await db.insert(users).values({
          email: emailLower,
          name: input.name,
          password: input.password,
          ra: input.ra,
          course: input.course,
          school: input.school,
          class: input.class,
          phone: input.phone,
          address: input.address,
          role,
          xp: 0,
          level: 1,
        }).returning();
        console.log("User registered successfully.");
        return newUser[0];
      } catch (e: any) {
        console.error("Register Error:", e);
        if (e.message?.includes("UNIQUE constraint failed")) {
          throw new TRPCError({ code: "CONFLICT", message: "Este e-mail já está cadastrado." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao salvar usuário." });
      }
    }),

  resetPassword: publicProcedure
    .input(z.object({ email: z.string(), newPassword: z.string() }))
    .mutation(async ({ input }) => {
      console.log("Reset password attempt for:", input.email);
      const emailLower = input.email.toLowerCase();
      
      const user = await db.query.users.findFirst({
        where: eq(users.email, emailLower)
      });

      if (!user) {
        console.log("User not found for reset.");
        return { success: false };
      }

      await db.update(users)
        .set({ password: input.newPassword })
        .where(eq(users.email, emailLower));
      
      console.log("Password updated successfully.");
      return { success: true };
    }),

  checkEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ input }) => {
      const emailLower = input.email.toLowerCase();
      const user = await db.query.users.findFirst({
        where: eq(users.email, emailLower)
      });
      return { exists: !!user };
    }),

  preRegisterStudent: publicProcedure
    .input(z.object({
      email: z.string(),
      ra: z.string(),
      teacherId: z.number()
    }))
    .mutation(async ({ input }) => {
      const emailLower = input.email.toLowerCase();
      const existing = await db.query.allowedStudents.findFirst({
        where: eq(allowedStudents.email, emailLower)
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Aluno já pré-cadastrado."
        });
      }

      const result = await db.insert(allowedStudents).values({
        email: emailLower,
        ra: input.ra,
        addedBy: input.teacherId
      }).returning();
      
      return result[0];
    }),

  getAllowedStudents: publicProcedure.query(async () => {
    return await db.select().from(allowedStudents);
  }),

  getUser: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ input }) => {
      const emailLower = input.email.toLowerCase();
      const user = await db.query.users.findFirst({
        where: eq(users.email, emailLower),
      });
      return user || null;
    }),

  // Product procedures
  getProducts: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return await db.select().from(products).where(eq(products.userId, input.userId));
    }),

  importProducts: publicProcedure
    .input(z.object({
      userId: z.number(),
      data: z.array(z.object({
        sku: z.string(),
        name: z.string(),
        category: z.string(),
        stock: z.number(),
        price: z.number(),
      }))
    }))
    .mutation(async ({ input }) => {
      for (const item of input.data) {
        await db.insert(products).values({ ...item, userId: input.userId }).onConflictDoUpdate({
          target: [products.sku, products.userId],
          set: item
        });
      }
      return { success: true };
    }),

  // BOM procedures
  getBOM: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return await db.select().from(bom).where(eq(bom.userId, input.userId));
    }),

  importBOM: publicProcedure
    .input(z.object({
      userId: z.number(),
      data: z.array(z.object({
        productSku: z.string(),
        componentSku: z.string(),
        quantity: z.number(),
        unit: z.string(),
      }))
    }))
    .mutation(async ({ input }) => {
      for (const item of input.data) {
        await db.insert(bom).values({ ...item, userId: input.userId });
      }
      return { success: true };
    }),

  // Suppliers procedures
  getSuppliers: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return await db.select().from(suppliers).where(eq(suppliers.userId, input.userId));
    }),

  importSuppliers: publicProcedure
    .input(z.object({
      userId: z.number(),
      data: z.array(z.object({
        name: z.string(),
        cnpj: z.string(),
        category: z.string(),
        contact: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
      }))
    }))
    .mutation(async ({ input }) => {
      for (const item of input.data) {
        await db.insert(suppliers).values({ ...item, userId: input.userId }).onConflictDoUpdate({
          target: [suppliers.cnpj, suppliers.userId],
          set: item
        });
      }
      return { success: true };
    }),

  // Customers procedures
  getCustomers: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return await db.select().from(customers).where(eq(customers.userId, input.userId));
    }),

  importCustomers: publicProcedure
    .input(z.object({
      userId: z.number(),
      data: z.array(z.object({
        name: z.string(),
        document: z.string(),
        type: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
      }))
    }))
    .mutation(async ({ input }) => {
      for (const item of input.data) {
        await db.insert(customers).values({ ...item, userId: input.userId }).onConflictDoUpdate({
          target: [customers.document, customers.userId],
          set: item
        });
      }
      return { success: true };
    }),

  // WMS procedures
  getWMSInventory: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return await db.select().from(wmsInventory).where(eq(wmsInventory.userId, input.userId));
    }),

  importWMSInventory: publicProcedure
    .input(z.object({
      userId: z.number(),
      data: z.array(z.object({
        sku: z.string(),
        location: z.string(),
        quantity: z.number(),
      }))
    }))
    .mutation(async ({ input }) => {
      for (const item of input.data) {
        await db.insert(wmsInventory).values({
          ...item,
          userId: input.userId,
          lastUpdated: new Date().toISOString()
        });
      }
      return { success: true };
    }),

  createProduct: publicProcedure
    .input(z.object({
      userId: z.number(),
      sku: z.string(),
      name: z.string(),
      category: z.string(),
      stock: z.number(),
      price: z.number(),
    }))
    .mutation(async ({ input }) => {
      const newProduct = await db.insert(products).values(input).returning();
      return newProduct[0];
    }),

  createSupplier: publicProcedure
    .input(z.object({
      userId: z.number(),
      name: z.string(),
      cnpj: z.string(),
      category: z.string(),
      contact: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.insert(suppliers).values(input).returning();
      return result[0];
    }),

  createCustomer: publicProcedure
    .input(z.object({
      userId: z.number(),
      name: z.string(),
      document: z.string(),
      type: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.insert(customers).values(input).returning();
      return result[0];
    }),

  createBOM: publicProcedure
    .input(z.object({
      userId: z.number(),
      productSku: z.string(),
      componentSku: z.string(),
      quantity: z.number(),
      unit: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.insert(bom).values(input).returning();
      return result[0];
    }),

  createWMSInventory: publicProcedure
    .input(z.object({
      userId: z.number(),
      sku: z.string(),
      location: z.string(),
      quantity: z.number(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.insert(wmsInventory).values({
        ...input,
        lastUpdated: new Date().toISOString()
      }).returning();
      return result[0];
    }),

  // Mission procedures
  getMissions: publicProcedure.query(async () => {
    return await db.select().from(missions);
  }),

  getStudentMissions: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const result = await db.select({
        id: missions.id,
        title: missions.title,
        description: missions.description,
        reward: missions.reward,
        difficulty: missions.difficulty,
        progress: studentMissions.progress,
        completed: studentMissions.completed,
      })
      .from(missions)
      .leftJoin(studentMissions, and(
        eq(studentMissions.missionId, missions.id),
        eq(studentMissions.studentId, input.studentId)
      ));
      
      return result;
    }),

  createMission: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      reward: z.number(),
      difficulty: z.string(),
      type: z.string().optional(),
      targetValue: z.number().optional(),
      teacherId: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const result = await db.insert(missions).values({
        ...input,
        type: input.type || "product_count",
        targetValue: input.targetValue || 1,
      }).returning();
      return result[0];
    }),

  deleteMission: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(missions).where(eq(missions.id, input.id));
      return { success: true };
    }),

  // MRP procedures
  calculateMRP: publicProcedure.query(async () => {
    const allProducts = await db.select().from(products);
    const allBOM = await db.select().from(bom);
    
    // Simple MRP logic: 
    // For each product with low stock (or just all for simulation), 
    // calculate needed components based on BOM.
    
    const results = [];
    for (const product of allProducts) {
      const productBOM = allBOM.filter(b => b.productSku === product.sku);
      
      for (const item of productBOM) {
        const component = allProducts.find(p => p.sku === item.componentSku);
        const neededQty = item.quantity * 10; // Assume we want to produce 10 units
        const currentStock = component?.stock || 0;
        const deficit = Math.max(0, neededQty - currentStock);
        
        results.push({
          id: results.length + 1,
          productName: product.name,
          componentName: component?.name || "Desconhecido",
          sku: item.componentSku,
          needed: neededQty,
          available: currentStock,
          deficit,
          status: deficit > 0 ? "Crítico" : "OK"
        });
      }
    }
    return results;
  }),

  // Activity procedures
  getActivities: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return await db.select().from(activities)
        .where(eq(activities.userId, input.userId))
        .orderBy(desc(activities.timestamp))
        .limit(10);
    }),

  getStudents: publicProcedure.query(async () => {
    return await db.select().from(users).where(eq(users.role, "student"));
  }),

  createActivity: publicProcedure
    .input(z.object({
      type: z.string(),
      title: z.string(),
      description: z.string(),
      userId: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const newActivity = await db.insert(activities).values({
        ...input,
        timestamp: new Date().toISOString(),
      }).returning();
      return newActivity[0];
    }),

  requestSchoolAccess: publicProcedure
    .input(z.object({
      schoolName: z.string(),
      contactName: z.string(),
      email: z.string(),
      phone: z.string(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.insert(schoolAccessRequests).values({
        ...input,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    }),

  checkMissions: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const autoCorrectSetting = await db.query.settings.findFirst({ where: eq(settings.key, "auto_correct_missions") });
      if (autoCorrectSetting?.value === "false") return { success: true };

      // Get user data for validation
      const [userProducts] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.userId, input.userId));
      const [userSuppliers] = await db.select({ count: sql<number>`count(*)` }).from(suppliers).where(eq(suppliers.userId, input.userId));
      const [userCustomers] = await db.select({ count: sql<number>`count(*)` }).from(customers).where(eq(customers.userId, input.userId));
      
      const counts = {
        product_count: Number(userProducts.count),
        supplier_count: Number(userSuppliers.count),
        customer_count: Number(userCustomers.count),
      };

      const allMissions = await db.select().from(missions);
      
      for (const mission of allMissions) {
        const targetValue = mission.targetValue || 1;
        const currentCount = counts[mission.type as keyof typeof counts] || 0;
        const newProgress = Math.min(100, Math.floor((currentCount / targetValue) * 100));
        
        const [existingProgress] = await db.select().from(studentMissions).where(and(
          eq(studentMissions.studentId, input.userId),
          eq(studentMissions.missionId, mission.id)
        ));

        if (!existingProgress) {
          await db.insert(studentMissions).values({
            studentId: input.userId,
            missionId: mission.id,
            progress: newProgress,
            completed: newProgress === 100
          });
        } else if (newProgress > existingProgress.progress) {
          await db.update(studentMissions)
            .set({ 
              progress: newProgress,
              completed: newProgress === 100
            })
            .where(eq(studentMissions.id, existingProgress.id));
            
          if (newProgress === 100 && !existingProgress.completed) {
            // Reward XP
            const user = await db.query.users.findFirst({ where: eq(users.id, input.userId) });
            if (user) {
              const newXp = user.xp + mission.reward;
              const newLevel = Math.floor(newXp / 1000) + 1;
              await db.update(users)
                .set({ xp: newXp, level: newLevel })
                .where(eq(users.id, input.userId));
            }
          }
        }
      }
      return { success: true };
    }),

  getSettings: publicProcedure
    .query(async () => {
      const allSettings = await db.select().from(settings);
      return allSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
    }),

  updateSetting: publicProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      await db.insert(settings).values(input).onConflictDoUpdate({
        target: settings.key,
        set: { value: input.value }
      });
      return { success: true };
    }),

  // New Procedures
  getDailyQuote: publicProcedure.query(() => {
    const quotes = [
      "Logística é o coração de qualquer negócio de sucesso.",
      "Eficiência na logística é o diferencial competitivo do século XXI.",
      "Onde há movimento, há logística. Onde há logística, há progresso.",
      "Logística: a arte de colocar o produto certo, no lugar certo, na hora certa.",
      "Grandes batalhas são vencidas pela logística antes mesmo do primeiro tiro.",
      "Inovação em logística não é apenas tecnologia, é inteligência em movimento.",
      "Sustentabilidade e logística caminham juntas para um futuro mais verde."
    ];
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return quotes[dayOfYear % quotes.length];
  }),

  getRanking: publicProcedure.query(async () => {
    return await db.query.users.findMany({
      where: eq(users.role, "student"),
      orderBy: [desc(users.xp)],
      limit: 10,
    });
  }),

  submitLead: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      school: z.string(),
      role: z.string(),
      message: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      await db.insert(leads).values({
        ...input,
        timestamp: new Date().toISOString()
      });
      return { success: true };
    }),

  updateStudentAllocation: publicProcedure
    .input(z.object({
      studentId: z.number(),
      school: z.string(),
      class: z.string(),
      period: z.string()
    }))
    .mutation(async ({ input }) => {
      await db.update(users)
        .set({
          school: input.school,
          class: input.class,
          period: input.period
        })
        .where(eq(users.id, input.studentId));
      return { success: true };
    }),

  getMissionTrails: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const allMissions = await db.query.missions.findMany({
        orderBy: [sql`${missions.trailId} ASC`, sql`${missions.order} ASC`]
      });

      const userProgress = await db.query.studentMissions.findMany({
        where: eq(studentMissions.studentId, input.userId)
      });

      // Group by trail
      const trails: Record<string, any[]> = {};
      allMissions.forEach(m => {
        const trailId = m.trailId || "Geral";
        if (!trails[trailId]) trails[trailId] = [];
        
        const progress = userProgress.find(p => p.missionId === m.id);
        trails[trailId].push({
          ...m,
          completed: progress?.completed || false,
          progress: progress?.progress || 0
        });
      });

      return trails;
    }),

  seedBasicTrails: publicProcedure.mutation(async () => {
    const basicMissions = [
      { trailId: "Iniciante", order: 1, title: "Primeiros Passos", description: "Cadastre seu primeiro produto no sistema.", reward: 200, difficulty: "Fácil", type: "product_count", targetValue: 1 },
      { trailId: "Iniciante", order: 2, title: "Expandindo o Mix", description: "Cadastre 5 produtos diferentes.", reward: 300, difficulty: "Fácil", type: "product_count", targetValue: 5 },
      { trailId: "Operacional", order: 1, title: "Rede de Contatos", description: "Cadastre seu primeiro fornecedor.", reward: 250, difficulty: "Médio", type: "supplier_count", targetValue: 1 },
      { trailId: "Operacional", order: 2, title: "Gestão de Estoque", description: "Realize 3 movimentações de estoque.", reward: 400, difficulty: "Médio", type: "inventory_move", targetValue: 3 },
    ];

    for (const m of basicMissions) {
      const existing = await db.query.missions.findFirst({
        where: and(eq(missions.title, m.title), eq(missions.trailId, m.trailId))
      });
      if (!existing) {
        await db.insert(missions).values(m);
      }
    }
    return { success: true };
  }),
});

export type AppRouter = typeof appRouter;
