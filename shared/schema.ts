import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Updated user schema with Firebase auth support
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),  // Optional for Firebase users
  firebaseId: text("firebase_id").unique(),
  email: text("email"),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  isGuest: boolean("is_guest").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firebaseId: true,
  email: true,
  displayName: true,
  photoURL: true,
  isGuest: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define the questions table for tracking questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),  // For authenticated users
  guestId: text("guest_id"),  // For guest users
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  userId: true,
  guestId: true,
  question: true,
  answer: true,
  imageUrl: true,
  audioUrl: true,
});

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

// Badge/Sticker definition table
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(), // e.g., "science", "math", "reading"
  rarity: text("rarity").notNull().default("common"), // "common", "rare", "epic", "legendary"
  unlockCriteria: text("unlock_criteria").notNull(), // JSON string describing how to unlock
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBadgeSchema = createInsertSchema(badges).pick({
  name: true,
  description: true,
  imageUrl: true,
  category: true,
  rarity: true,
  unlockCriteria: true,
});

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

// User badges/rewards table (join table)
export const userBadges = pgTable("user_badges", {
  userId: integer("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  displayOrder: integer("display_order").default(0),
  favorite: boolean("favorite").default(false),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.badgeId] }),
    userBadgeIdx: uniqueIndex("user_badge_idx").on(table.userId, table.badgeId),
  };
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  badgeId: true,
  displayOrder: true,
  favorite: true,
});

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

// Achievement progress tracking
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // "question_count", "streak", "topic_mastery", etc.
  progress: integer("progress").default(0).notNull(),
  goal: integer("goal").notNull(),
  completed: boolean("completed").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  userId: true,
  name: true,
  type: true,
  progress: true,
  goal: true,
  completed: true,
});

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

// Audio files storage table for persistence
export const audioFiles = pgTable("audio_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull().unique(),
  content: text("content").notNull(), // Store as Base64 encoded text
  mimeType: text("mime_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAudioFileSchema = createInsertSchema(audioFiles, {
  content: z.string(),
  mimeType: z.string(),
  filename: z.string()
});

export type InsertAudioFile = z.infer<typeof insertAudioFileSchema>;
export type AudioFile = typeof audioFiles.$inferSelect;

// Define types for our API requests and responses
export type AskRequest = {
  question: string;
  contentFilter: "strict" | "moderate" | "standard";
  generateImage: boolean;
  generateAudio: boolean;
};

export type AskResponse = {
  text: string;
  imageUrl: string;
  audioUrl?: string;
  suggestedQuestions?: string[];
  rewards?: {
    badgeEarned?: Badge;
    achievementProgress?: Achievement;
  };
};

// Badge categories and rarities
export const BadgeCategories = {
  SCIENCE: "science",
  MATH: "math",
  READING: "reading",
  HISTORY: "history",
  GEOGRAPHY: "geography",
  ART: "art",
  MUSIC: "music",
  SPORTS: "sports",
  MILESTONE: "milestone",
  SPECIAL: "special",
} as const;

export const BadgeRarity = {
  COMMON: "common",
  UNCOMMON: "uncommon",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
} as const;
