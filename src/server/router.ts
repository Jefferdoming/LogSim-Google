import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "../db";
import { products, users, missions, activities, allowedStudents, bom, suppliers, customers, wmsInventory, schoolAccessRequests, settings } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

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
      const existing = await db.query.allowedStudents.findFirst({
        where: eq(allowedStudents.email, input.email)
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Aluno já pré-cadastrado."
        });
      }

      const result = await db.insert(allowedStudents).values({
        email: input.email,
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
      const user = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
      return user || null;
    }),

  // Product procedures
  getProducts: publicProcedure.query(async () => {
    return await db.select().from(products);
  }),

  importProducts: publicProcedure
    .input(z.array(z.object({
      sku: z.string(),
      name: z.string(),
      category: z.string(),
      stock: z.number(),
      price: z.number(),
    })))
    .mutation(async ({ input }) => {
      for (const item of input) {
        await db.insert(products).values(item).onConflictDoUpdate({
          target: products.sku,
          set: item
        });
      }
      return { success: true };
    }),

  // BOM procedures
  getBOM: publicProcedure.query(async () => {
    return await db.select().from(bom);
  }),

  importBOM: publicProcedure
    .input(z.array(z.object({
      productSku: z.string(),
      componentSku: z.string(),
      quantity: z.number(),
      unit: z.string(),
    })))
    .mutation(async ({ input }) => {
      for (const item of input) {
        await db.insert(bom).values(item);
      }
      return { success: true };
    }),

  // Suppliers procedures
  getSuppliers: publicProcedure.query(async () => {
    return await db.select().from(suppliers);
  }),

  importSuppliers: publicProcedure
    .input(z.array(z.object({
      name: z.string(),
      cnpj: z.string(),
      category: z.string(),
      contact: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
    })))
    .mutation(async ({ input }) => {
      for (const item of input) {
        await db.insert(suppliers).values(item).onConflictDoUpdate({
          target: suppliers.cnpj,
          set: item
        });
      }
      return { success: true };
    }),

  // Customers procedures
  getCustomers: publicProcedure.query(async () => {
    return await db.select().from(customers);
  }),

  importCustomers: publicProcedure
    .input(z.array(z.object({
      name: z.string(),
      document: z.string(),
      type: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
    })))
    .mutation(async ({ input }) => {
      for (const item of input) {
        await db.insert(customers).values(item).onConflictDoUpdate({
          target: customers.document,
          set: item
        });
      }
      return { success: true };
    }),

  // WMS procedures
  getWMSInventory: publicProcedure.query(async () => {
    return await db.select().from(wmsInventory);
  }),

  importWMSInventory: publicProcedure
    .input(z.array(z.object({
      sku: z.string(),
      location: z.string(),
      quantity: z.number(),
    })))
    .mutation(async ({ input }) => {
      for (const item of input) {
        await db.insert(wmsInventory).values({
          ...item,
          lastUpdated: new Date().toISOString()
        });
      }
      return { success: true };
    }),

  createProduct: publicProcedure
    .input(z.object({
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

  createMission: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      reward: z.number(),
      difficulty: z.string(),
      userId: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const result = await db.insert(missions).values({
        ...input,
        progress: 0
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
  getActivities: publicProcedure.query(async () => {
    return await db.select().from(activities).limit(10);
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

      const userProducts = await db.select({ count: sql<number>`count(*)` }).from(products);
      const productCount = Number(userProducts[0].count);

      const userMissions = await db.select().from(missions).where(eq(missions.userId, input.userId));
      
      for (const mission of userMissions) {
        let newProgress = mission.progress;
        
        if (mission.title.toLowerCase().includes("produto") && productCount > 0) {
          newProgress = Math.min(100, (productCount / 5) * 100);
        }
        
        if (newProgress !== mission.progress) {
          await db.update(missions)
            .set({ progress: Math.floor(newProgress) })
            .where(eq(missions.id, mission.id));
            
          if (newProgress === 100 && mission.progress < 100) {
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
});

export type AppRouter = typeof appRouter;
