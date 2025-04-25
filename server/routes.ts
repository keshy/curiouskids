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
      
      // Get user ID if authenticated (use session or token)
      const userId = req.session?.userId || null;
      
      // Process the question through OpenAI
      const answer = await processQuestion(question, contentFilter, generateImage, generateAudio);
      
      // Store the question and answer in the database
      const savedQuestion = await storage.createQuestion({
        userId: userId,
        question,
        answer: answer.text,
        imageUrl: answer.imageUrl,
        audioUrl: answer.audioUrl,
      });
      
      // Check if user earned any badges from this question
      let earnedBadge = null;
      if (userId) {
        // Import badge controller
        const { checkAndAwardBadges } = require('./badge-controller');
        earnedBadge = await checkAndAwardBadges(userId, savedQuestion);
      }
      
      // Prepare response
      const response = {
        text: answer.text,
        imageUrl: answer.imageUrl,
        audioUrl: answer.audioUrl,
        suggestedQuestions: answer.suggestedQuestions,
      };
      
      // Add badge information if earned
      if (earnedBadge) {
        response.rewards = {
          badgeEarned: earnedBadge
        };
      }
      
      // Return the response
      return res.json(response);
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
  
  // Get user badges
  app.get("/api/badges", async (req, res) => {
    try {
      // Get user ID from session
      const userId = req.session?.userId || null;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Import badge controller
      const { getUserBadges } = require('./badges');
      const badges = await getUserBadges(userId);
      
      return res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      return res.status(500).json({ 
        message: "Failed to fetch badges" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
