import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { processQuestion } from "./openai";
import { z } from "zod";
import { insertQuestionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve audio files from the public directory
  app.use('/audio', (req, res, next) => {
    // Validate that the requested file is an MP3
    if (!req.url.endsWith('.mp3')) {
      return res.status(404).send('Not found');
    }
    next();
  });
  app.use('/audio', (req, res) => {
    try {
      const options = {
        root: path.join(process.cwd(), 'public', 'audio'),
        headers: {
          'Content-Type': 'audio/mpeg',
        }
      };
      res.sendFile(req.path, options);
    } catch (error) {
      console.error('Error sending audio file:', error);
      res.status(500).send('Error serving audio file');
    }
  });

  // Validate the ask request body using zod
  const askRequestSchema = z.object({
    question: z.string().min(1, "Question is required"),
    contentFilter: z.enum(["strict", "moderate", "standard"]).default("strict"),
    generateImage: z.boolean().default(true),
    generateAudio: z.boolean().default(true)
  });

  // API endpoint to ask a question
  app.post("/api/ask", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = askRequestSchema.parse(req.body);
      const { question, contentFilter, generateImage, generateAudio } = validatedData;
      
      // Process the question through OpenAI
      const answer = await processQuestion(question, contentFilter, generateImage, generateAudio);
      
      // Store the question and answer in the database
      const timestamp = new Date().toISOString();
      
      const savedQuestion = await storage.createQuestion({
        question,
        answer: answer.text,
        imageUrl: answer.imageUrl,
        audioUrl: answer.audioUrl,
        createdAt: timestamp
      });
      
      // Return the response with suggested questions
      return res.json({
        text: answer.text,
        imageUrl: answer.imageUrl,
        audioUrl: answer.audioUrl,
        suggestedQuestions: answer.suggestedQuestions,
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
      const questions = await storage.getRecentQuestions(20);
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
