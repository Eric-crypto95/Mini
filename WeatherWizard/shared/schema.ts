import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name"),
  favoriteLocation: text("favorite_location"),
  preferredLanguages: json("preferred_languages").$type<string[]>().default([]),
  miniCustomization: json("mini_customization").$type<{
    accessories: string[];
    expression: string;
    style: string;
  }>().default({ accessories: [], expression: "happy", style: "fluffy" }),
  themePreferences: json("theme_preferences").$type<{
    preferredTheme: string;
    seasonalThemes: boolean;
  }>().default({ preferredTheme: "auto", seasonalThemes: true }),
  conversationMemory: json("conversation_memory").$type<{
    topics: string[];
    preferences: Record<string, any>;
  }>().default({ topics: [], preferences: {} }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  messageType: text("message_type").notNull(), // 'weather', 'timer', 'translation', 'chat', etc.
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activeTimers = pgTable("active_timers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // 'pomodoro', 'focus', 'break', 'countdown'
  duration: integer("duration").notNull(), // in seconds
  remaining: integer("remaining").notNull(), // in seconds
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertActiveTimerSchema = createInsertSchema(activeTimers).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ActiveTimer = typeof activeTimers.$inferSelect;
export type InsertActiveTimer = z.infer<typeof insertActiveTimerSchema>;
