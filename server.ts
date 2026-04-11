import express from "express";
import { createServer as createViteServer } from "vite";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./src/server/router";
import path from "path";
import cors from "cors";
import { db, sqlite } from "./src/db";
import { users, products, missions, activities, allowedStudents } from "./src/db/schema";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

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
        phone TEXT,
        address TEXT,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        xp INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1,
        avatar TEXT
      );
      CREATE TABLE IF NOT EXISTS allowed_students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        ra TEXT NOT NULL,
        added_by INTEGER REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        price REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Ativo'
      );
      CREATE TABLE IF NOT EXISTS bom (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_sku TEXT NOT NULL,
        component_sku TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cnpj TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        contact TEXT,
        phone TEXT,
        email TEXT
      );
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        document TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        email TEXT,
        phone TEXT
      );
      CREATE TABLE IF NOT EXISTS wms_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT NOT NULL,
        location TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        last_updated TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS missions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        reward INTEGER NOT NULL,
        difficulty TEXT NOT NULL,
        progress INTEGER NOT NULL DEFAULT 0,
        user_id INTEGER REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id)
      );
    `);
    console.log("Database tables initialized.");
  } catch (e) {
    console.error("DB Init Error:", e);
  }

  // tRPC middleware
  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: () => ({}),
    })
  );

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
