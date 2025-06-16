import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  currentWeek: integer("current_week").default(1),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  week: integer("week").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  audioUrl: text("audio_url").notNull(),
  duration: integer("duration").notNull(), // in minutes
  illustration: text("illustration").notNull(),
  isLocked: boolean("is_locked").default(true),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionId: integer("session_id").references(() => sessions.id).notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  audioProgress: integer("audio_progress").default(0), // seconds
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").defaultNow(),
  feeling: text("feeling"),
  gratitude: text("gratitude"),
  reflection: text("reflection"),
});

export const handyHacks = pgTable("handy_hacks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  illustration: text("illustration"),
});

export const userHackCompletions = pgTable("user_hack_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  hackId: integer("hack_id").references(() => handyHacks.id).notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'practice', 'hack', 'weekly'
  title: text("title").notNull(),
  message: text("message").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  sent: boolean("sent").default(false),
  read: boolean("read").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  feeling: true,
  gratitude: true,
  reflection: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  type: true,
  title: true,
  message: true,
  scheduledFor: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type HandyHack = typeof handyHacks.$inferSelect;
export type UserHackCompletion = typeof userHackCompletions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
