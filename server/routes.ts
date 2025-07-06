import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { upsertUserSchema, insertJournalEntrySchema, insertNotificationSchema } from "@shared/schema";
import { transcribeAudio } from "./transcription";
import multer from "multer";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware (temporarily disabled for demo)
  // await setupAuth(app);

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      // Allow audio files
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed'));
      }
    }
  });
  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes  
  app.post("/api/users", async (req, res) => {
    try {
      const userData = upsertUserSchema.parse(req.body);
      const user = await storage.upsertUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub; // Use authenticated user's ID
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id/week", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub; // Use authenticated user's ID
      const { week } = req.body;
      await storage.updateUserWeek(userId, week);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user week" });
    }
  });

  // Session routes
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/week/:week", async (req, res) => {
    try {
      const week = parseInt(req.params.week);
      const sessions = await storage.getSessionsByWeek(week);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions for week" });
    }
  });

  // Progress routes
  app.get("/api/users/:userId/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub; // Use authenticated user's ID
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user progress" });
    }
  });

  app.post("/api/users/:userId/progress/:sessionId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub; // Use authenticated user's ID
      const sessionId = parseInt(req.params.sessionId);
      const { audioProgress, completed, totalListenTime } = req.body;
      
      await storage.updateSessionProgress(userId, sessionId, { 
        audioProgress, 
        completed, 
        totalListenTime 
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  app.post("/api/users/:userId/complete/:sessionId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessionId = parseInt(req.params.sessionId);
      
      await storage.completeSession(userId, sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete session" });
    }
  });

  // Journal routes
  app.get("/api/users/:userId/journal", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const entries = await storage.getUserJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/users/:userId/journal", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const entryData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(userId, entryData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid journal entry data" });
    }
  });

  app.put("/api/users/:userId/journal/:entryId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const entryId = parseInt(req.params.entryId);
      const entryData = insertJournalEntrySchema.parse(req.body);
      
      const entry = await storage.updateJournalEntry(userId, entryId, entryData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid journal entry data" });
    }
  });

  // Transcription endpoint
  app.post("/api/transcribe", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const transcription = await transcribeAudio(req.file.buffer, req.file.originalname);
      res.json({ transcription });
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({ error: "Failed to transcribe audio" });
    }
  });

  // Handy Hacks routes
  app.get("/api/handy-hacks", async (req, res) => {
    try {
      const hacks = await storage.getAllHandyHacks();
      res.json(hacks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch handy hacks" });
    }
  });

  app.get("/api/handy-hacks/random", async (req, res) => {
    try {
      const hack = await storage.getRandomHandyHack();
      if (!hack) {
        return res.status(404).json({ error: "No handy hacks available" });
      }
      res.json(hack);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch random handy hack" });
    }
  });

  app.post("/api/users/:userId/hacks/:hackId/complete", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const hackId = parseInt(req.params.hackId);
      
      await storage.markHackComplete(userId, hackId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark hack as complete" });
    }
  });

  app.get("/api/users/:userId/hack-completions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const completions = await storage.getUserHackCompletions(userId);
      res.json(completions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hack completions" });
    }
  });

  // Notification routes
  app.get("/api/users/:userId/notifications", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/users/:userId/notifications", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(userId, notificationData);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ error: "Invalid notification data" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Milestone routes
  app.get("/api/milestones", async (req, res) => {
    try {
      const milestones = await storage.getAllMilestones();
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch milestones" });
    }
  });

  app.get("/api/users/:userId/milestones", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userMilestones = await storage.getUserMilestones(userId);
      res.json(userMilestones);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user milestones" });
    }
  });

  app.post("/api/users/:userId/milestones/check", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const newMilestones = await storage.checkAndUpdateMilestones(userId);
      res.json(newMilestones);
    } catch (error) {
      res.status(500).json({ error: "Failed to check milestones" });
    }
  });

  // Notification settings routes
  app.put("/api/users/:userId/notification-settings", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { notificationsEnabled, reminderTime, reminderDays } = req.body;
      
      await storage.updateUserNotificationSettings(userId, {
        notificationsEnabled,
        reminderTime,
        reminderDays,
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update notification settings" });
    }
  });

  app.post("/api/users/:userId/schedule-reminders", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      await storage.scheduleUserReminders(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to schedule reminders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
