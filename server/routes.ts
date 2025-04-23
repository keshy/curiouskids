import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processQuestion } from "./openai";
import { z } from "zod";
import { insertQuestionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Validate the ask request body using zod
  const askRequestSchema = z.object({
    question: z.string().min(1, "Question is required"),
    contentFilter: z.enum(["strict", "moderate", "standard"]).default("strict"),
    generateImage: z.boolean().default(true)
  });

  // API endpoint to ask a question
  app.post("/api/ask", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = askRequestSchema.parse(req.body);
      const { question, contentFilter, generateImage } = validatedData;
      
      // Process the question through OpenAI
      const answer = await processQuestion(question, contentFilter, generateImage);
      
      // Store the question and answer in the database
      const timestamp = new Date().toISOString();
      
      const savedQuestion = await storage.createQuestion({
        question,
        answer: answer.text,
        imageUrl: answer.imageUrl,
        createdAt: timestamp
      });
      
      // Return the response
      return res.json({
        text: answer.text,
        imageUrl: answer.imageUrl,
      });
    } catch (error) {
      console.error("Error processing ask request:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      
      return res.status(500).json({ 
        message: "Failed to process your question. Please try again." 
      });
    }
  });

  // Get recent questions
  app.get("/api/questions/recent", async (req, res) => {
    try {
      const questions = await storage.getRecentQuestions(10);
      return res.json(questions);
    } catch (error) {
      console.error("Error fetching recent questions:", error);
      return res.status(500).json({ 
        message: "Failed to fetch recent questions" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
