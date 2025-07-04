import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  currentWeek: integer("current_week").default(1),
  joinedAt: timestamp("joined_at").defaultNow(),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  reminderTime: text("reminder_time").default("09:00"), // HH:MM format
  reminderDays: jsonb("reminder_days").$type<number[]>().default([1, 2, 3, 4, 5]), // 0 = Sunday, 1 = Monday, etc.
  timezone: text("timezone").default("UTC"),
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
  totalListenTime: integer("total_listen_time").default(0), // total seconds listened
  streakDays: integer("streak_days").default(0), // consecutive days practiced
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'sessions', 'time', 'streak', 'weekly'
  target: integer("target").notNull(),
  badge: text("badge").notNull(), // emoji or icon identifier
  color: text("color").notNull(), // hex color for the milestone
});

export const userMilestones = pgTable("user_milestones", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  milestoneId: integer("milestone_id").references(() => milestones.id).notNull(),
  achievedAt: timestamp("achieved_at").defaultNow(),
  progress: integer("progress").default(0), // current progress toward milestone
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").defaultNow(),
  
  // Morning routine
  gratitude1: text("gratitude_1"),
  gratitude2: text("gratitude_2"),
  gratitude3: text("gratitude_3"),
  highValuePriority1: text("high_value_priority_1"),
  highValuePriority2: text("high_value_priority_2"),
  highValuePriority3: text("high_value_priority_3"),
  highFlowPriority1: text("high_flow_priority_1"),
  highFlowPriority2: text("high_flow_priority_2"),
  highFlowPriority3: text("high_flow_priority_3"),
  scriptingVoiceNote: text("scripting_voice_note"), // URL or path to voice recording
  scriptingText: text("scripting_text"), // Optional text version
  
  // Evening routine
  reflectionVoiceNote: text("reflection_voice_note"), // URL or path to voice recording
  reflectionText: text("reflection_text"), // Optional text version
  
  // Status tracking
  morningCompleted: boolean("morning_completed").default(false),
  eveningCompleted: boolean("evening_completed").default(false),
  completedAt: timestamp("completed_at"),
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
  type: text("type").notNull(), // 'practice', 'hack', 'weekly', 'reminder'
  title: text("title").notNull(),
  message: text("message").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  sent: boolean("sent").default(false),
  read: boolean("read").default(false),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: text("recurring_pattern"), // 'daily', 'weekly', 'custom'
  nextScheduled: timestamp("next_scheduled"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  gratitude1: true,
  gratitude2: true,
  gratitude3: true,
  highValuePriority1: true,
  highValuePriority2: true,
  highValuePriority3: true,
  highFlowPriority1: true,
  highFlowPriority2: true,
  highFlowPriority3: true,
  scriptingVoiceNote: true,
  scriptingText: true,
  reflectionVoiceNote: true,
  reflectionText: true,
  morningCompleted: true,
  eveningCompleted: true,
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
export type Milestone = typeof milestones.$inferSelect;
export type UserMilestone = typeof userMilestones.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
