import express from "express";
import { createServer as createViteServer } from "vite";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./src/server/router.ts";
import path from "path";
import cors from "cors";
import { db, sqlite } from "./src/db/index.ts";
import { users, products, missions, activities, allowedStudents } from "./src/db/schema.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // tRPC middleware
  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: () => ({}),
      onError: ({ path, error }) => {
        console.error(`tRPC Error on ${path}:`, error);
      },
    })
  );

  // Initialize DB tables
  try {
    console.log("Initializing database tables...");
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        ra TEXT,
        course TEXT,
        school TEXT,
        class TEXT,
        period TEXT,
        phone TEXT,
        address TEXT,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        xp INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1,
        avatar TEXT
      );
    `);

    // Migrations for existing tables
    try { sqlite.exec("ALTER TABLE users ADD COLUMN period TEXT;"); } catch (e) {}
    try { sqlite.exec("ALTER TABLE missions ADD COLUMN trail_id TEXT;"); } catch (e) {}
    try { sqlite.exec('ALTER TABLE missions ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;'); } catch (e) {}

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS allowed_students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        ra TEXT NOT NULL,
        added_by INTEGER REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        price REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Ativo',
        user_id INTEGER REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS bom (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_sku TEXT NOT NULL,
        component_sku TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cnpj TEXT NOT NULL,
        category TEXT NOT NULL,
        contact TEXT,
        phone TEXT,
        email TEXT,
        user_id INTEGER REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        document TEXT NOT NULL,
        type TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        user_id INTEGER REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS wms_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT NOT NULL,
        location TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        last_updated TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS missions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        reward INTEGER NOT NULL,
        difficulty TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'product_count',
        target_value INTEGER NOT NULL DEFAULT 1,
        trail_id TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        teacher_id INTEGER REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS student_missions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL REFERENCES users(id),
        mission_id INTEGER NOT NULL REFERENCES missions(id),
        progress INTEGER NOT NULL DEFAULT 0,
        completed INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS school_access_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT,
        timestamp TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        school TEXT NOT NULL,
        role TEXT NOT NULL,
        message TEXT,
        timestamp TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL
      );
    `);
    console.log("Database tables initialized.");
  } catch (e) {
    console.error("DB Init Error:", e);
  }

  // tRPC middleware
  // Moved up

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
