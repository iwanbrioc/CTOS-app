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
        title: "Dropping the Balloon",
        description: "Letting go of mental burdens and finding lightness",
        audioUrl: "https://soundcloud.com/undoing-agency/grounding-10min-1",
        duration: 10,
        illustration: "dropping-balloon",
        isLocked: false,
      },
      {
        week: 2,
        title: "Seven Stations of the Spine",
        description: "Foundation practice for grounding and spinal awareness",
        audioUrl: "https://soundcloud.com/undoing-agency/the-seven-stations-of-the",
        duration: 20,
        illustration: "seven-stations-spine",
        isLocked: false,
      },
      {
        week: 3,
        title: "The Sense of Being Alive",
        description: "Awakening to the fundamental aliveness within",
        audioUrl: "https://soundcloud.com/undoing-agency/session-3-the-sense-of-being-alive-1",
        duration: 20,
        illustration: "the-sense-being-alive",
        isLocked: false,
      },
      {
        week: 4,
        title: "Mind in Body, Body in Movement, Movement in Mind",
        description: "Integrating physical awareness with mental presence",
        audioUrl: "https://soundcloud.com/undoing-agency/mind-in-body-body-in-movement-movement-in-mind",
        duration: 10,
        illustration: "mind-body-movement",
        isLocked: false,
      },
      {
        week: 5,
        title: "What if All There is Is This?",
        description: "Exploring presence and acceptance of the current moment",
        audioUrl: "https://soundcloud.com/undoing-agency/what-if-all-there-is-is-this",
        duration: 10,
        illustration: "what-if-all-there-is",
        isLocked: false,
      },
      {
        week: 6,
        title: "Turning Towards Discomfort",
        description: "Learning to face difficulty with awareness",
        audioUrl: "https://soundcloud.com/undoing-agency/turning-towards-discomfort",
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
        audioUrl: "https://soundcloud.com/undoing-agency/four-pillars-of-wellbeing",
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
