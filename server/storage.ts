import {
  users,
  sessions,
  userProgress,
  journalEntries,
  handyHacks,
  userHackCompletions,
  notifications,
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private userProgress: Map<string, UserProgress>;
  private journalEntries: Map<number, JournalEntry>;
  private handyHacks: Map<number, HandyHack>;
  private userHackCompletions: Map<number, UserHackCompletion>;
  private notifications: Map<number, Notification>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.userProgress = new Map();
    this.journalEntries = new Map();
    this.handyHacks = new Map();
    this.userHackCompletions = new Map();
    this.notifications = new Map();
    this.currentId = 1;
    
    // Initialize default data
    this.initializeSessions();
    this.initializeHandyHacks();
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
        title: "The Sense of Being Alive",
        description: "Foundation practice for presence and awareness",
        audioUrl: "https://soundcloud.com/undoing-agency/sets/coming-to-our-senses/track-1",
        duration: 12,
        illustration: "seven-stations-spine",
        isLocked: false,
      },
      {
        week: 2,
        title: "Journaling for Flow",
        description: "Creative expression and mindful awareness through writing",
        audioUrl: "https://soundcloud.com/undoing-agency/sets/coming-to-our-senses/track-2",
        duration: 18,
        illustration: "journaling-flow",
        isLocked: false,
      },
      {
        week: 3,
        title: "Mind in Body, Body in Movement",
        description: "Integrating physical awareness with mental presence",
        audioUrl: "https://soundcloud.com/undoing-agency/sets/coming-to-our-senses/track-3",
        duration: 15,
        illustration: "mind-body-movement",
        isLocked: false,
      },
      {
        week: 4,
        title: "Dropping the Balloon",
        description: "Letting go of mental burdens and finding lightness",
        audioUrl: "https://soundcloud.com/undoing-agency/sets/coming-to-our-senses/track-4",
        duration: 20,
        illustration: "dropping-balloon",
        isLocked: true,
      },
      {
        week: 5,
        title: "Great Smile Practice",
        description: "Cultivating joy and positive energy through mindful smiling",
        audioUrl: "https://soundcloud.com/undoing-agency/sets/coming-to-our-senses/track-5",
        duration: 16,
        illustration: "great-smile",
        isLocked: true,
      },
      {
        week: 6,
        title: "Five Elements Integration",
        description: "Harmonizing with natural elements for deeper awareness",
        audioUrl: "https://soundcloud.com/undoing-agency/sets/coming-to-our-senses/track-6",
        duration: 22,
        illustration: "five-elements",
        isLocked: true,
      },
      {
        week: 7,
        title: "Advanced Presence Practice",
        description: "Deepening your capacity for sustained awareness",
        audioUrl: "https://soundcloud.com/undoing-agency/sets/coming-to-our-senses/track-7",
        duration: 25,
        illustration: "advanced-presence",
        isLocked: true,
      },
      {
        week: 8,
        title: "Integration and Beyond",
        description: "Bringing mindfulness into daily life with confidence",
        audioUrl: "https://soundcloud.com/undoing-agency/sets/coming-to-our-senses/track-8",
        duration: 28,
        illustration: "integration-beyond",
        isLocked: true,
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
      ...entry,
      id,
      userId,
      date: new Date(),
    };
    this.journalEntries.set(id, journalEntry);
    return journalEntry;
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
        title: "Great Smile Practice",
        description: "Take a moment to smile genuinely. Notice how it changes your internal state and the energy around you.",
        category: "joy",
        illustration: "great-smile",
      },
      {
        title: "Three Conscious Breaths",
        description: "Pause and take three deep, mindful breaths. Feel your body settling with each exhale.",
        category: "breathing",
        illustration: "conscious-breathing",
      },
      {
        title: "Gratitude Moment",
        description: "Notice one thing you're grateful for right now. Really feel the appreciation in your body.",
        category: "gratitude",
        illustration: "gratitude-moment",
      },
      {
        title: "Body Scan Check-in",
        description: "Quickly scan your body from head to toe. Notice any tension and breathe into those areas.",
        category: "body-awareness",
        illustration: "body-scan",
      },
      {
        title: "Mindful Listening",
        description: "Stop and listen to the sounds around you for 30 seconds. Be completely present with what you hear.",
        category: "awareness",
        illustration: "mindful-listening",
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
}

export const storage = new MemStorage();
