import {
  users,
  sessions,
  userProgress,
  journalEntries,
  handyHacks,
  userHackCompletions,
  notifications,
  milestones,
  userMilestones,
  type User,
  type InsertUser,
  type Session,
  type UserProgress,
  type JournalEntry,
  type InsertJournalEntry,
  type HandyHack,
  type UserHackCompletion,
  type Notification,
  type InsertNotification,
  type Milestone,
  type UserMilestone,
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWeek(userId: number, week: number): Promise<void>;

  // Sessions
  getAllSessions(): Promise<Session[]>;
  getSessionsByWeek(week: number): Promise<Session[]>;
  initializeSessions(): Promise<void>;

  // User Progress
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateSessionProgress(userId: number, sessionId: number, progress: Partial<UserProgress>): Promise<void>;
  completeSession(userId: number, sessionId: number): Promise<void>;

  // Journal
  getUserJournalEntries(userId: number): Promise<JournalEntry[]>;
  createJournalEntry(userId: number, entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(userId: number, entryId: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry>;

  // Handy Hacks
  getAllHandyHacks(): Promise<HandyHack[]>;
  getRandomHandyHack(): Promise<HandyHack | undefined>;
  markHackComplete(userId: number, hackId: number): Promise<void>;
  getUserHackCompletions(userId: number): Promise<UserHackCompletion[]>;
  initializeHandyHacks(): Promise<void>;

  // Notifications
  createNotification(userId: number, notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationRead(notificationId: number): Promise<void>;

  // Milestones
  getAllMilestones(): Promise<Milestone[]>;
  getUserMilestones(userId: number): Promise<UserMilestone[]>;
  checkAndUpdateMilestones(userId: number): Promise<UserMilestone[]>;
  initializeMilestones(): Promise<void>;

  // Notification Settings
  updateUserNotificationSettings(userId: number, settings: {
    notificationsEnabled: boolean;
    reminderTime: string;
    reminderDays: number[];
  }): Promise<void>;
  scheduleUserReminders(userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private userProgress: Map<string, UserProgress>;
  private journalEntries: Map<number, JournalEntry>;
  private handyHacks: Map<number, HandyHack>;
  private userHackCompletions: Map<number, UserHackCompletion>;
  private notifications: Map<number, Notification>;
  private milestones: Map<number, Milestone>;
  private userMilestones: Map<number, UserMilestone>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.userProgress = new Map();
    this.journalEntries = new Map();
    this.handyHacks = new Map();
    this.userHackCompletions = new Map();
    this.notifications = new Map();
    this.milestones = new Map();
    this.userMilestones = new Map();
    this.currentId = 1;
    
    // Initialize default data
    this.initializeSessions();
    this.initializeHandyHacks();
    this.initializeMilestones();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      currentWeek: 1,
      joinedAt: new Date(),
      notificationsEnabled: true,
      reminderTime: "09:00",
      reminderDays: [1, 2, 3, 4, 5],
      timezone: "UTC",
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserWeek(userId: number, week: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.currentWeek = week;
      this.users.set(userId, user);
    }
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getSessionsByWeek(week: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(session => session.week === week);
  }

  async initializeSessions(): Promise<void> {
    const sessionData = [
      {
        week: 1,
        title: "Dropping the Balloon",
        description: "Letting go of mental burdens and finding lightness",
        audioUrl: "/attached_assets/Grounding 10min_1751647354223.mp3",
        duration: 10,
        illustration: "dropping-balloon",
        isLocked: false,
      },
      {
        week: 2,
        title: "Seven Stations of the Spine",
        description: "Foundation practice for grounding and spinal awareness",
        audioUrl: "/attached_assets/The Seven Stations of the Spine_1751648246548.mp3",
        duration: 20,
        illustration: "seven-stations-spine",
        isLocked: false,
      },
      {
        week: 3,
        title: "The Sense of Being Alive",
        description: "Awakening to the fundamental aliveness within",
        audioUrl: "/attached_assets/The Sense of Being Alive (20 minutes)_1751649276591.mp3",
        duration: 20,
        illustration: "the-sense-being-alive",
        isLocked: false,
      },
      {
        week: 4,
        title: "Mind in Body, Body in Movement, Movement in Mind",
        description: "Integrating physical awareness with mental presence",
        audioUrl: "/attached_assets/Mind in Body, Body in Movement, Movement n Mind (10min)_1751649693383.mp3",
        duration: 10,
        illustration: "mind-body-movement",
        isLocked: false,
      },
      {
        week: 5,
        title: "What if All There is Is This?",
        description: "Exploring presence and acceptance of the current moment",
        audioUrl: "/attached_assets/What if all there is is this 10 minute version_1751649984256.mp3",
        duration: 10,
        illustration: "what-if-all-there-is",
        isLocked: false,
      },
      {
        week: 6,
        title: "Turning Towards Discomfort",
        description: "Learning to face difficulty with awareness",
        audioUrl: "/attached_assets/turning towards the difficult 15 Minutes_1751650302023.mp3",
        duration: 15,
        illustration: "turning-towards-discomfort",
        isLocked: false,
      },
      {
        week: 6,
        title: "Five Elements Practice",
        description: "Harmonizing with natural elements for deeper awareness",
        audioUrl: "https://soundcloud.com/undoing-agency/5-elements-practice",
        duration: 15,
        illustration: "five-elements",
        isLocked: false,
      },
      {
        week: 7,
        title: "The Four Pillars of Wellbeing",
        description: "Building sustainable foundations for mindful living",
        audioUrl: "/attached_assets/fourpillarspractice_1751651309349.mp3",
        duration: 22,
        illustration: "four-pillars",
        isLocked: false,
      },
      {
        week: 8,
        title: "Great Smile Practice",
        description: "Cultivating joy and positive energy through mindful smiling",
        audioUrl: "https://soundcloud.com/undoing-agency/great-smile-practice",
        duration: 16,
        illustration: "great-smile",
        isLocked: false,
      },
    ];

    sessionData.forEach((session, index) => {
      const id = index + 1;
      this.sessions.set(id, { ...session, id });
    });
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(
      progress => progress.userId === userId
    );
  }

  async updateSessionProgress(userId: number, sessionId: number, progress: Partial<UserProgress>): Promise<void> {
    const key = `${userId}-${sessionId}`;
    const existing = this.userProgress.get(key);
    
    if (existing) {
      const updated = { ...existing, ...progress };
      this.userProgress.set(key, updated);
    } else {
      const id = this.currentId++;
      const newProgress: UserProgress = {
        id,
        userId,
        sessionId,
        completed: false,
        completedAt: null,
        audioProgress: 0,
        totalListenTime: 0,
        streakDays: 0,
        ...progress,
      };
      this.userProgress.set(key, newProgress);
    }
  }

  async completeSession(userId: number, sessionId: number): Promise<void> {
    const key = `${userId}-${sessionId}`;
    const existing = this.userProgress.get(key);
    
    if (existing) {
      existing.completed = true;
      existing.completedAt = new Date();
      this.userProgress.set(key, existing);
    } else {
      const id = this.currentId++;
      const newProgress: UserProgress = {
        id,
        userId,
        sessionId,
        completed: true,
        completedAt: new Date(),
        audioProgress: 0,
        totalListenTime: 0,
        streakDays: 0,
      };
      this.userProgress.set(key, newProgress);
    }
  }

  async getUserJournalEntries(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values()).filter(
      entry => entry.userId === userId
    );
  }

  async createJournalEntry(userId: number, entry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentId++;
    const journalEntry: JournalEntry = {
      id,
      userId,
      date: new Date(),
      gratitude1: entry.gratitude1 || null,
      gratitude2: entry.gratitude2 || null,
      gratitude3: entry.gratitude3 || null,
      highValuePriority1: entry.highValuePriority1 || null,
      highValuePriority2: entry.highValuePriority2 || null,
      highValuePriority3: entry.highValuePriority3 || null,
      highFlowPriority1: entry.highFlowPriority1 || null,
      highFlowPriority2: entry.highFlowPriority2 || null,
      highFlowPriority3: entry.highFlowPriority3 || null,
      scriptingVoiceNote: entry.scriptingVoiceNote || null,
      scriptingText: entry.scriptingText || null,
      reflectionVoiceNote: entry.reflectionVoiceNote || null,
      reflectionText: entry.reflectionText || null,
      morningCompleted: entry.morningCompleted || false,
      eveningCompleted: entry.eveningCompleted || false,
      completedAt: null,
    };
    this.journalEntries.set(id, journalEntry);
    return journalEntry;
  }

  async updateJournalEntry(userId: number, entryId: number, entryData: Partial<InsertJournalEntry>): Promise<JournalEntry> {
    const existingEntry = this.journalEntries.get(entryId);
    if (!existingEntry || existingEntry.userId !== userId) {
      throw new Error("Journal entry not found");
    }

    const updatedEntry: JournalEntry = {
      ...existingEntry,
      gratitude1: entryData.gratitude1 !== undefined ? entryData.gratitude1 : existingEntry.gratitude1,
      gratitude2: entryData.gratitude2 !== undefined ? entryData.gratitude2 : existingEntry.gratitude2,
      gratitude3: entryData.gratitude3 !== undefined ? entryData.gratitude3 : existingEntry.gratitude3,
      highValuePriority1: entryData.highValuePriority1 !== undefined ? entryData.highValuePriority1 : existingEntry.highValuePriority1,
      highValuePriority2: entryData.highValuePriority2 !== undefined ? entryData.highValuePriority2 : existingEntry.highValuePriority2,
      highValuePriority3: entryData.highValuePriority3 !== undefined ? entryData.highValuePriority3 : existingEntry.highValuePriority3,
      highFlowPriority1: entryData.highFlowPriority1 !== undefined ? entryData.highFlowPriority1 : existingEntry.highFlowPriority1,
      highFlowPriority2: entryData.highFlowPriority2 !== undefined ? entryData.highFlowPriority2 : existingEntry.highFlowPriority2,
      highFlowPriority3: entryData.highFlowPriority3 !== undefined ? entryData.highFlowPriority3 : existingEntry.highFlowPriority3,
      scriptingVoiceNote: entryData.scriptingVoiceNote !== undefined ? entryData.scriptingVoiceNote : existingEntry.scriptingVoiceNote,
      scriptingText: entryData.scriptingText !== undefined ? entryData.scriptingText : existingEntry.scriptingText,
      reflectionVoiceNote: entryData.reflectionVoiceNote !== undefined ? entryData.reflectionVoiceNote : existingEntry.reflectionVoiceNote,
      reflectionText: entryData.reflectionText !== undefined ? entryData.reflectionText : existingEntry.reflectionText,
      morningCompleted: entryData.morningCompleted !== undefined ? entryData.morningCompleted : existingEntry.morningCompleted,
      eveningCompleted: entryData.eveningCompleted !== undefined ? entryData.eveningCompleted : existingEntry.eveningCompleted,
      completedAt: (entryData.morningCompleted && entryData.eveningCompleted) ? new Date() : existingEntry.completedAt,
    };

    this.journalEntries.set(entryId, updatedEntry);
    return updatedEntry;
  }

  async getAllHandyHacks(): Promise<HandyHack[]> {
    return Array.from(this.handyHacks.values());
  }

  async getRandomHandyHack(): Promise<HandyHack | undefined> {
    const hacks = Array.from(this.handyHacks.values());
    if (hacks.length === 0) return undefined;
    return hacks[Math.floor(Math.random() * hacks.length)];
  }

  async markHackComplete(userId: number, hackId: number): Promise<void> {
    const id = this.currentId++;
    const completion: UserHackCompletion = {
      id,
      userId,
      hackId,
      completedAt: new Date(),
    };
    this.userHackCompletions.set(id, completion);
  }

  async getUserHackCompletions(userId: number): Promise<UserHackCompletion[]> {
    return Array.from(this.userHackCompletions.values()).filter(
      completion => completion.userId === userId
    );
  }

  async initializeHandyHacks(): Promise<void> {
    const hacksData = [
      {
        title: "Remember to Drop the Balloon!",
        description: "Let go of what you're carrying that isn't yours to hold. Release mental burdens and find lightness.",
        category: "week-1",
        illustration: "dropping-balloon",
      },
      {
        title: "Remember to Unclench and Breathe",
        description: "Notice where you're holding tension and soften. Allow your breath to flow naturally.",
        category: "week-2",
        illustration: "seven-stations-spine",
      },
      {
        title: "Remember to Take the Three Precious Pills!",
        description: "Connect with the fundamental aliveness within. Feel the sense of being alive in this moment.",
        category: "week-3",
        illustration: "the-sense-being-alive",
      },
      {
        title: "Remember to Explore Opening and Closing to Experience",
        description: "Notice how you open to pleasant experiences and close to difficult ones. Practice staying present with both.",
        category: "week-4",
        illustration: "mind-body-movement",
      },
      {
        title: "Remember to Watch the Wanting",
        description: "Observe your desires and wanting without being swept away by them. What if all there is is this moment?",
        category: "week-5",
        illustration: "what-if-all-there-is",
      },
      {
        title: "Remember to Connect with the 5 Elements",
        description: "Ground yourself by connecting with earth, water, fire, air, and space. Feel your place in the natural world.",
        category: "week-6",
        illustration: "five-elements",
      },
      {
        title: "Remember to Add Scripting and Reflecting to Your Journaling",
        description: "Use the four pillars of wellbeing: script your day, reflect on what went well, and plan mindfully.",
        category: "week-7",
        illustration: "four-pillars",
      },
      {
        title: "Remember to Do a Great Smile",
        description: "Let a genuine smile arise from within. Feel how it transforms your inner state and radiates outward.",
        category: "week-8",
        illustration: "great-smile",
      },
    ];

    hacksData.forEach((hack, index) => {
      const id = index + 1;
      this.handyHacks.set(id, { ...hack, id });
    });
  }

  async createNotification(userId: number, notification: InsertNotification): Promise<Notification> {
    const id = this.currentId++;
    const newNotification: Notification = {
      ...notification,
      id,
      userId,
      sent: false,
      read: false,
      isRecurring: false,
      recurringPattern: null,
      nextScheduled: null,
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      notification => notification.userId === userId
    );
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.notifications.set(notificationId, notification);
    }
  }

  // Milestone methods
  async getAllMilestones(): Promise<Milestone[]> {
    return Array.from(this.milestones.values());
  }

  async getUserMilestones(userId: number): Promise<UserMilestone[]> {
    return Array.from(this.userMilestones.values()).filter(
      milestone => milestone.userId === userId
    );
  }

  async checkAndUpdateMilestones(userId: number): Promise<UserMilestone[]> {
    // Get user's current progress
    const userProgress = await this.getUserProgress(userId);
    const userHackCompletions = await this.getUserHackCompletions(userId);
    const allMilestones = await this.getAllMilestones();
    const userMilestones = await this.getUserMilestones(userId);
    
    const newMilestones: UserMilestone[] = [];
    
    for (const milestone of allMilestones) {
      const existingMilestone = userMilestones.find(um => um.milestoneId === milestone.id);
      if (existingMilestone) continue; // Already achieved
      
      let currentProgress = 0;
      let achieved = false;
      
      switch (milestone.type) {
        case 'sessions':
          currentProgress = userProgress.filter(p => p.completed).length;
          achieved = currentProgress >= milestone.target;
          break;
        case 'time':
          currentProgress = userProgress.reduce((total, p) => total + (p.totalListenTime || 0), 0);
          achieved = currentProgress >= milestone.target;
          break;
        case 'streak':
          currentProgress = userProgress.length > 0 ? Math.max(...userProgress.map(p => p.streakDays || 0)) : 0;
          achieved = currentProgress >= milestone.target;
          break;
        case 'weekly':
          const completedWeeks = new Set(userProgress.filter(p => p.completed).map(p => {
            const session = Array.from(this.sessions.values()).find(s => s.id === p.sessionId);
            return session?.week;
          }));
          currentProgress = completedWeeks.size;
          achieved = currentProgress >= milestone.target;
          break;
      }
      
      if (achieved) {
        const id = this.currentId++;
        const newUserMilestone: UserMilestone = {
          id,
          userId,
          milestoneId: milestone.id,
          achievedAt: new Date(),
          progress: currentProgress,
        };
        this.userMilestones.set(id, newUserMilestone);
        newMilestones.push(newUserMilestone);
      }
    }
    
    return newMilestones;
  }

  async initializeMilestones(): Promise<void> {
    if (this.milestones.size > 0) return;
    
    const milestoneData = [
      {
        id: 1,
        title: "First Steps",
        description: "Complete your first meditation session",
        type: "sessions",
        target: 1,
        badge: "🌱",
        color: "#10B981"
      },
      {
        id: 2,
        title: "Building Momentum",
        description: "Complete 5 meditation sessions",
        type: "sessions",
        target: 5,
        badge: "🌿",
        color: "#3B82F6"
      },
      {
        id: 3,
        title: "Dedication",
        description: "Complete 10 meditation sessions",
        type: "sessions",
        target: 10,
        badge: "🌳",
        color: "#8B5CF6"
      },
      {
        id: 4,
        title: "Time Traveler",
        description: "Meditate for 30 minutes total",
        type: "time",
        target: 1800, // 30 minutes in seconds
        badge: "⏰",
        color: "#F59E0B"
      },
      {
        id: 5,
        title: "Mindful Hour",
        description: "Meditate for 60 minutes total",
        type: "time",
        target: 3600, // 60 minutes in seconds
        badge: "🕐",
        color: "#EF4444"
      },
      {
        id: 6,
        title: "Week Explorer",
        description: "Complete sessions from 3 different weeks",
        type: "weekly",
        target: 3,
        badge: "🗓️",
        color: "#06B6D4"
      },
      {
        id: 7,
        title: "Journey Master",
        description: "Complete sessions from all 8 weeks",
        type: "weekly",
        target: 8,
        badge: "🏆",
        color: "#DC2626"
      }
    ];
    
    milestoneData.forEach(milestone => {
      this.milestones.set(milestone.id, milestone);
    });
  }

  // Notification Settings methods
  async updateUserNotificationSettings(userId: number, settings: {
    notificationsEnabled: boolean;
    reminderTime: string;
    reminderDays: number[];
  }): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = {
        ...user,
        notificationsEnabled: settings.notificationsEnabled,
        reminderTime: settings.reminderTime,
        reminderDays: settings.reminderDays,
      };
      this.users.set(userId, updatedUser);
    }
  }

  async scheduleUserReminders(userId: number): Promise<void> {
    const user = this.users.get(userId);
    if (!user || !user.notificationsEnabled) {
      return;
    }

    // Clear existing reminders for this user
    const existingReminders = Array.from(this.notifications.values()).filter(
      n => n.userId === userId && n.type === 'reminder'
    );
    existingReminders.forEach(reminder => {
      this.notifications.delete(reminder.id);
    });

    // Schedule new reminders for the next 7 days
    const reminderDays = (user.reminderDays as number[]) || [1, 2, 3, 4, 5];
    const reminderTime = user.reminderTime || "09:00";
    const [hours, minutes] = reminderTime.split(':').map(Number);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);
      const dayOfWeek = targetDate.getDay();

      if (reminderDays.includes(dayOfWeek)) {
        targetDate.setHours(hours, minutes, 0, 0);
        
        // Only schedule future reminders
        if (targetDate > new Date()) {
          const reminderMessages = [
            "Time for your daily mindfulness practice! 🧘‍♀️",
            "Take a moment to breathe and be present 🌱",
            "Your meditation session is waiting for you ✨",
            "Remember to pause and practice mindfulness today 🌸",
            "A few minutes of mindfulness can transform your day 🌟"
          ];
          
          const randomMessage = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
          
          const id = this.currentId++;
          const reminder: Notification = {
            id,
            userId,
            type: 'reminder',
            title: 'Practice Reminder',
            message: randomMessage,
            scheduledFor: targetDate,
            sent: false,
            read: false,
            isRecurring: true,
            recurringPattern: 'daily',
            nextScheduled: targetDate,
          };
          
          this.notifications.set(id, reminder);
        }
      }
    }
  }
}

export const storage = new MemStorage();
