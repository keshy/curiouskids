import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema remains unchanged
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define the questions table for tracking questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  createdAt: text("created_at").notNull(),
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  question: true,
  answer: true,
  imageUrl: true,
  audioUrl: true,
  createdAt: true,
});

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

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
};
