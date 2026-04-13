import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema.ts";

export const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });

// Initialize database with tables if they don't exist
// In a real app, we'd use migrations, but for this simulation, we'll just ensure tables exist.
// Drizzle kit can generate migrations, but we'll keep it simple here.
