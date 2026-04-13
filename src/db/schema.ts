import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  ra: text("ra"), // Optional for teachers
  course: text("course"), // Optional for teachers
  school: text("school"),
  class: text("class"),
  period: text("period"), // morning, afternoon, night
  phone: text("phone"),
  address: text("address"),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // student, teacher
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  avatar: text("avatar"),
});

export const allowedStudents = sqliteTable("allowed_students", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  ra: text("ra").notNull(),
  addedBy: integer("added_by").references(() => users.id),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  stock: integer("stock").notNull().default(0),
  price: real("price").notNull(),
  status: text("status").notNull().default("Ativo"),
  userId: integer("user_id").references(() => users.id),
});

export const bom = sqliteTable("bom", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productSku: text("product_sku").notNull(),
  componentSku: text("component_sku").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const suppliers = sqliteTable("suppliers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  cnpj: text("cnpj").notNull(),
  category: text("category").notNull(),
  contact: text("contact"),
  phone: text("phone"),
  email: text("email"),
  userId: integer("user_id").references(() => users.id),
});

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  document: text("document").notNull(),
  type: text("type").notNull(), // PF, PJ
  email: text("email"),
  phone: text("phone"),
  userId: integer("user_id").references(() => users.id),
});

export const wmsInventory = sqliteTable("wms_inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sku: text("sku").notNull(),
  location: text("location").notNull(),
  quantity: integer("quantity").notNull(),
  lastUpdated: text("last_updated").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const missions = sqliteTable("missions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: integer("reward").notNull(),
  difficulty: text("difficulty").notNull(),
  type: text("type").notNull().default("product_count"), // product_count, supplier_count, etc.
  targetValue: integer("target_value").notNull().default(1),
  trailId: text("trail_id"), // Trail identifier
  order: integer("order").notNull().default(0), // Order within the trail
  teacherId: integer("teacher_id").references(() => users.id),
});

export const studentMissions = sqliteTable("student_missions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").references(() => users.id).notNull(),
  missionId: integer("mission_id").references(() => missions.id).notNull(),
  progress: integer("progress").notNull().default(0),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
});

export const schoolAccessRequests = sqliteTable("school_access_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  schoolName: text("school_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message"),
  timestamp: text("timestamp").notNull(),
});

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // success, warning, error
  title: text("title").notNull(),
  description: text("description").notNull(),
  timestamp: text("timestamp").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  school: text("school").notNull(),
  role: text("role").notNull(),
  message: text("message"),
  timestamp: text("timestamp").notNull(),
});
