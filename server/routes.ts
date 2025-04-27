import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { processQuestion } from "./openai";
import { z } from "zod";
import { insertQuestionSchema, AskResponse } from "@shared/schema";

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
    generateAudio: z.boolean().default(true),
    guestId: z.string().optional() // Optional guest user ID
  });

  // API endpoint to ask a question
  app.post("/api/ask", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = askRequestSchema.parse(req.body);
      const { question, contentFilter, generateImage, generateAudio, guestId } = validatedData;
      
      // Get user ID - prioritize authenticated user ID, fall back to guest ID
      let userId = (req as any).session?.userId || null;
      
      // If we have a guestId from the request and no authenticated userId, use the guestId as userId
      if (!userId && guestId) {
        userId = guestId;
      }
      
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
      
      // Prepare response with optional rewards field
      const response: AskResponse = {
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

  // Get recent questions - this is now just for system-wide questions with no user
  app.get("/api/questions/recent", async (req, res) => {
    try {
      // Get recent questions, but filter to only show public questions (userId = null)
      const allQuestions = await storage.getRecentQuestions(50); // Fetch more than needed to allow for filtering
      const publicQuestions = allQuestions.filter(q => q.userId === null);
      return res.json(publicQuestions.slice(0, 20)); // Return at most 20
    } catch (error) {
      console.error("Error fetching recent questions:", error);
      return res.status(500).json({ 
        message: "Failed to fetch recent questions" 
      });
    }
  });
  
  // Get questions for guest users by their guest ID (stored in the guestId parameter)
  app.get("/api/questions/guest", async (req, res) => {
    try {
      const guestId = req.query.guestId as string;
      
      if (!guestId) {
        return res.status(400).json({ message: "Guest ID is required" });
      }
      
      console.log("Fetching questions for guest ID:", guestId);
      
      // Fetch all questions and filter by the guestId field
      // Since we're storing the guestId in the userId field as a string, we need to do a string comparison
      const allQuestions = await storage.getRecentQuestions(100); // Fetch more to ensure we get user's questions
      
      // Log all questions to help with debugging
      console.log("All questions:", JSON.stringify(allQuestions.map(q => ({ 
        id: q.id, 
        userId: q.userId,
        question: q.question.substring(0, 20) + "..."
      }))));
      
      const guestQuestions = allQuestions.filter(q => {
        // Compare as strings to handle any type mismatches
        const questionUserId = q.userId !== null ? q.userId.toString() : null;
        const matches = questionUserId === guestId;
        
        if (matches) {
          console.log("Found matching question for guest:", q.id, q.question.substring(0, 20) + "...");
        }
        
        return matches;
      });
      
      console.log(`Found ${guestQuestions.length} questions for guest ID ${guestId}`);
      
      return res.json(guestQuestions.slice(0, 20)); // Return at most 20
    } catch (error) {
      console.error("Error fetching guest questions:", error);
      return res.status(500).json({ 
        message: "Failed to fetch your questions" 
      });
    }
  });
  
  // Get questions for the current user (authenticated users only)
  app.get("/api/questions/user", async (req, res) => {
    try {
      // Get user ID from session
      const userId = (req as any).session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Fetch questions for this user
      const questions = await storage.getUserQuestions(userId, 20);
      return res.json(questions);
    } catch (error) {
      console.error("Error fetching user questions:", error);
      return res.status(500).json({ 
        message: "Failed to fetch your questions" 
      });
    }
  });
  
  // Get user badges
  app.get("/api/badges", async (req, res) => {
    try {
      // Get user ID from session
      const userId = (req as any).session?.userId || null;
      
      if (!userId) {
        // Instead of returning 401, return empty array for unauthenticated users
        return res.json([]);
      }
      
      // Import badge controller
      const { getUserBadges } = require('./badges');
      const badges = await getUserBadges(userId);
      
      return res.json(badges || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
      // Return empty array on error too
      return res.json([]);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
