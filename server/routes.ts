import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { processQuestion } from "./openai";
import { z } from "zod";
import { insertQuestionSchema, AskResponse } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Endpoint to serve audio files from the database
  app.get('/api/audio/:filename', async (req, res) => {
    try {
      const filename = req.params.filename;
      
      // Only MP3 files are supported
      if (!filename.endsWith('.mp3')) {
        return res.status(404).send('Not found');
      }
      
      // Try to get the audio file from the database first
      const { getAudioFromDatabase } = await import('./audio-service');
      const audio = await getAudioFromDatabase(filename);
      
      if (audio) {
        // Set appropriate headers
        res.setHeader('Content-Type', audio.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        
        // Send the file content as a response
        return res.send(audio.content);
      }
      
      // If not found in the database, try the filesystem as fallback
      const filePath = path.join(process.cwd(), 'public', 'audio', filename);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath, {
          headers: {
            'Content-Type': 'audio/mpeg',
          }
        });
      }
      
      // File not found in database or filesystem
      return res.status(404).send('Audio file not found');
    } catch (error) {
      console.error('Error serving audio file:', error);
      res.status(500).send('Error serving audio file');
    }
  });
  
  // Legacy route to serve audio files from the filesystem
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
    guestId: z.string().optional(), // Optional guest user ID
    firebaseId: z.string().optional() // Optional Firebase ID for authenticated users
  });

  // API endpoint to ask a question
  app.post("/api/ask", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = askRequestSchema.parse(req.body);
      const { 
        question, 
        contentFilter, 
        generateImage, 
        generateAudio, 
        guestId,
        firebaseId 
      } = validatedData;
      
      // Get user ID - authenticated users have numeric IDs in the session
      let userId = (req as any).session?.userId || null;
      let guestUserId = null;
      
      // If Firebase ID is provided and no session userId exists, look up the user by Firebase ID
      if (!userId && firebaseId) {
        console.log("Looking up user by Firebase ID:", firebaseId);
        try {
          const user = await storage.getUserByFirebaseId(firebaseId);
          if (user) {
            userId = user.id;
            console.log("Found user ID:", userId, "from Firebase ID");
          }
        } catch (err) {
          console.error("Error looking up user by Firebase ID:", err);
        }
      }
      
      // Handle guest users (they have string IDs like "guest_abc123")
      if (!userId && guestId) {
        guestUserId = guestId;
        console.log("Using guest ID for question:", guestUserId);
      }
      
      if (userId) {
        console.log("Question being saved with authenticated userId:", userId);
      } else if (guestUserId) {
        console.log("Question being saved with guestId:", guestUserId);
      } else {
        console.log("Anonymous question (no user or guest ID)");
      }
      
      // Process the question through OpenAI
      const answer = await processQuestion(question, contentFilter, generateImage, generateAudio);
      
      // Store the question and answer in the database
      const savedQuestion = await storage.createQuestion({
        userId: userId,
        guestId: guestUserId,
        question,
        answer: answer.text,
        imageUrl: answer.imageUrl,
        audioUrl: answer.audioUrl,
      });
      
      // Check if user earned any badges from this question
      let earnedBadge = null;
      if (userId) {
        // Import badge controller - using ES module import instead of require
        const badgeController = await import('./badge-controller');
        earnedBadge = await badgeController.checkAndAwardBadges(userId, savedQuestion);
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
  
  // Get questions for guest users by their guest ID (stored in the guestId query parameter)
  app.get("/api/questions/guest", async (req, res) => {
    try {
      const guestId = req.query.guestId as string;
      
      if (!guestId) {
        return res.status(400).json({ message: "Guest ID is required" });
      }
      
      console.log("Fetching questions for guest ID:", guestId);
      
      // Use the new storage method to get questions by guestId
      const guestQuestions = await storage.getGuestQuestions(guestId, 20);
      
      console.log(`Found ${guestQuestions.length} questions for guest ID ${guestId}`);
      
      return res.json(guestQuestions);
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
      // Try to get user ID from query parameter (Firebase auth)
      const firebaseId = req.query.firebaseId as string;
      let userId = null;
      
      // If Firebase ID is provided, try to get the user
      if (firebaseId) {
        console.log("Looking up user by Firebase ID:", firebaseId);
        const user = await storage.getUserByFirebaseId(firebaseId);
        if (user) {
          userId = user.id;
          console.log("Found user ID:", userId, "for Firebase ID:", firebaseId);
        }
      } 
      
      // If no Firebase ID or no user found, check session
      if (!userId) {
        userId = (req as any).session?.userId;
      }
      
      // If we still don't have a user ID, return unauthorized
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
      // Try to get Firebase ID from query parameter
      const firebaseId = req.query.firebaseId as string;
      let userId = null;
      
      // If Firebase ID is provided, look up the user
      if (firebaseId) {
        console.log("Looking up user by Firebase ID for badges:", firebaseId);
        try {
          const user = await storage.getUserByFirebaseId(firebaseId);
          if (user) {
            userId = user.id;
            console.log("Found user ID for badges:", userId);
          }
        } catch (err) {
          console.error("Error looking up user by Firebase ID:", err);
        }
      }
      
      // If no Firebase ID or no user found, check session
      if (!userId) {
        userId = (req as any).session?.userId || null;
      }
      
      if (!userId) {
        // Instead of returning 401, return empty array for unauthenticated users
        return res.json([]);
      }
      
      // Import badge controller - using ES module import
      const badgesModule = await import('./badges');
      const badges = await badgesModule.getUserBadges(userId);
      
      return res.json(badges || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
      // Return empty array on error too
      return res.json([]);
    }
  });
  
  // Authenticate with Firebase
  app.post("/api/auth/firebase", async (req, res) => {
    try {
      const { firebaseId, email, displayName, photoUrl } = req.body;
      
      if (!firebaseId) {
        return res.status(400).json({ message: "Firebase ID is required" });
      }
      
      // Check if user exists
      let user = await storage.getUserByFirebaseId(firebaseId);
      
      if (!user) {
        // Create a new user
        user = await storage.createUser({
          username: email || `user_${Date.now()}`,
          firebaseId,
          email,
          displayName,
          photoURL: photoUrl,
          isGuest: false
        });
        console.log("Created new user:", user.id);
      }
      
      // Set session
      if ((req as any).session) {
        (req as any).session.userId = user.id;
        
        // Save session explicitly
        if (typeof (req as any).session.save === 'function') {
          (req as any).session.save((err: any) => {
            if (err) {
              console.error('Error saving session:', err);
            } else {
              console.log('Session saved successfully, userId:', user.id);
            }
          });
        } else {
          console.log('Session saved (implicit), userId:', user.id);
        }
      } else {
        console.error('Session object not available');
      }
      
      return res.json({ 
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        photoUrl: user.photoURL
      });
    } catch (error) {
      console.error("Error authenticating with Firebase:", error);
      return res.status(500).json({ message: "Authentication failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
