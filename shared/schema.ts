import { pgTable, text, varchar, serial, integer, boolean, timestamp, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
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

// Friendships table for connecting users
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  friendId: integer("friend_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, accepted, blocked
  createdAt: timestamp("created_at").notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

export const insertFriendshipSchema = createInsertSchema(friendships).pick({
  userId: true,
  friendId: true,
  status: true,
});
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type Friendship = typeof friendships.$inferSelect;

// Groups table for study groups
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdBy: integer("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
  createdBy: true,
  isPublic: true,
});
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

// Group members table
export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default("member"), // admin, member
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  groupId: true,
  userId: true,
  role: true,
});
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;

// Shared Q&As table
export const sharedQuestions = pgTable("shared_questions", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  sharedBy: integer("shared_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  sharedWith: integer("shared_with").references(() => users.id, { onDelete: "cascade" }), // null if shared with group
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }), // null if shared with individual
  message: text("message"), // Optional message from the sharer
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSharedQuestionSchema = createInsertSchema(sharedQuestions).pick({
  questionId: true,
  sharedBy: true,
  sharedWith: true,
  groupId: true,
  message: true,
});
export type InsertSharedQuestion = z.infer<typeof insertSharedQuestionSchema>;
export type SharedQuestion = typeof sharedQuestions.$inferSelect;

// Group reports table for AI-generated summaries
export const groupReports = pgTable("group_reports", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }), // null if group report
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  reportType: varchar("report_type", { length: 50 }).notNull(), // group_summary, user_summary, learning_progress
  generatedBy: integer("generated_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGroupReportSchema = createInsertSchema(groupReports).pick({
  groupId: true,
  userId: true,
  title: true,
  content: true,
  reportType: true,
  generatedBy: true,
});
export type InsertGroupReport = z.infer<typeof insertGroupReportSchema>;
export type GroupReport = typeof groupReports.$inferSelect;
