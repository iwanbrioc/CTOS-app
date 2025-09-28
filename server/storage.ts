import {
  users,
  meditationSessions,
  userProgress,
  journalEntries,
  handyHacks,
  userHackCompletions,
  notifications,
  milestones,
  userMilestones,
  sessionAnalytics,
  type User,
  type UpsertUser,
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
  type SessionAnalytics,
  type InsertSessionAnalytics,
} from "@shared/schema";

export interface IStorage {
  // User management (Replit Auth compatible)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserWeek(userId: string, week: number): Promise<void>;
  updateUserSessionsPace(userId: string, sessionsPace: number): Promise<void>;
  updateUserCourseFormat(userId: string, courseFormat: string): Promise<void>;

  // Sessions
  getAllSessions(): Promise<Session[]>;
  getSessionsByWeek(week: number): Promise<Session[]>;
  initializeSessions(): Promise<void>;

  // User Progress
  getUserProgress(userId: string): Promise<UserProgress[]>;
  updateSessionProgress(userId: string, sessionId: number, progress: Partial<UserProgress>): Promise<void>;
  completeSession(userId: string, sessionId: number): Promise<void>;

  // Journal
  getUserJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(userId: string, entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(userId: string, entryId: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry>;

  // Handy Hacks
  getAllHandyHacks(): Promise<HandyHack[]>;
  getRandomHandyHack(): Promise<HandyHack | undefined>;
  markHackComplete(userId: string, hackId: number): Promise<void>;
  getUserHackCompletions(userId: string): Promise<UserHackCompletion[]>;
  initializeHandyHacks(): Promise<void>;

  // Notifications
  createNotification(userId: string, notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(notificationId: number): Promise<void>;

  // Milestones
  getAllMilestones(): Promise<Milestone[]>;
  getUserMilestones(userId: string): Promise<UserMilestone[]>;
  checkAndUpdateMilestones(userId: string): Promise<UserMilestone[]>;
  initializeMilestones(): Promise<void>;

  // Notification Settings
  updateUserNotificationSettings(userId: string, settings: {
    notificationsEnabled: boolean;
    reminderTime: string;
    reminderDays: number[];
  }): Promise<void>;
  scheduleUserReminders(userId: string): Promise<void>;

  // Session Analytics
  createSessionAnalytics(userId: string, analytics: Omit<InsertSessionAnalytics, 'userId'>): Promise<SessionAnalytics>;
  updateSessionAnalytics(analyticsId: number, analytics: Partial<InsertSessionAnalytics>): Promise<void>;
  getSessionAnalytics(userId: string, sessionId?: number): Promise<SessionAnalytics[]>;
  getAdvancedProgressData(userId: string): Promise<{
    totalListenTime: number;
    averageSessionCompletion: number;
    mostPlayedSession: Session | null;
    streakDays: number;
    weeklyProgress: Array<{ week: number; completedSessions: number; totalSessions: number }>;
    practicePattern: Array<{ hour: number; sessionCount: number }>;
  }>;
}

// Database storage implementation for Replit Auth
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const { db } = await import("./db");
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserWeek(userId: string, week: number): Promise<void> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ currentWeek: week }).where(eq(users.id, userId));
  }

  async updateUserSessionsPace(userId: string, sessionsPace: number): Promise<void> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ sessionsPace }).where(eq(users.id, userId));
  }

  async updateUserCourseFormat(userId: string, courseFormat: string): Promise<void> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ courseFormat }).where(eq(users.id, userId));
  }

  async getAllSessions(): Promise<Session[]> {
    const { db } = await import("./db");
    const { asc } = await import("drizzle-orm");
    return await db.select().from(meditationSessions).orderBy(asc(meditationSessions.week), asc(meditationSessions.id));
  }

  async getSessionsByWeek(week: number): Promise<Session[]> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    return await db.select().from(meditationSessions).where(eq(meditationSessions.week, week));
  }

  async initializeSessions(): Promise<void> {
    const { db } = await import("./db");
    const { sessionData } = await import("../client/src/lib/session-data");
    
    // Check if sessions already exist
    const existingSessions = await db.select().from(meditationSessions).limit(1);
    if (existingSessions.length > 0) {
      return; // Sessions already initialized
    }

    // Insert session data
    for (const session of sessionData) {
      await db.insert(meditationSessions).values({
        week: session.week,
        title: session.title,
        description: session.description || session.desc || `Week ${session.week} meditation session`,
        audioUrl: session.audioUrl || '/attached_assets/placeholder.mp3',
        duration: session.duration || 10,
        illustration: session.illustration || 'default',
        isLocked: false,
      });
    }
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async updateSessionProgress(userId: string, sessionId: number, progress: Partial<UserProgress>): Promise<void> {
    const { db } = await import("./db");
    const { eq, and } = await import("drizzle-orm");
    await db.update(userProgress)
      .set(progress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.sessionId, sessionId)));
  }

  async completeSession(userId: string, sessionId: number): Promise<void> {
    const { db } = await import("./db");
    const { eq, and } = await import("drizzle-orm");
    await db.update(userProgress)
      .set({ completed: true, completedAt: new Date() })
      .where(and(eq(userProgress.userId, userId), eq(userProgress.sessionId, sessionId)));
  }

  async getUserJournalEntries(userId: string): Promise<JournalEntry[]> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    return await db.select().from(journalEntries).where(eq(journalEntries.userId, userId));
  }

  async createJournalEntry(userId: string, entry: InsertJournalEntry): Promise<JournalEntry> {
    const { db } = await import("./db");
    const [journalEntry] = await db
      .insert(journalEntries)
      .values({ ...entry, userId })
      .returning();
    return journalEntry;
  }

  async updateJournalEntry(userId: string, entryId: number, entryData: Partial<InsertJournalEntry>): Promise<JournalEntry> {
    const { db } = await import("./db");
    const { eq, and } = await import("drizzle-orm");
    const [updatedEntry] = await db
      .update(journalEntries)
      .set(entryData)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .returning();
    return updatedEntry;
  }

  async getAllHandyHacks(): Promise<HandyHack[]> {
    const { db } = await import("./db");
    return await db.select().from(handyHacks);
  }

  async getRandomHandyHack(): Promise<HandyHack | undefined> {
    const { db } = await import("./db");
    const { sql } = await import("drizzle-orm");
    const [hack] = await db.select().from(handyHacks).orderBy(sql`RANDOM()`).limit(1);
    return hack;
  }

  async markHackComplete(userId: string, hackId: number): Promise<void> {
    const { db } = await import("./db");
    await db.insert(userHackCompletions)
      .values({ userId, hackId })
      .onConflictDoNothing();
  }

  async getUserHackCompletions(userId: string): Promise<UserHackCompletion[]> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    return await db.select().from(userHackCompletions).where(eq(userHackCompletions.userId, userId));
  }

  async initializeHandyHacks(): Promise<void> {
    const { db } = await import("./db");
    const { handyHacksData } = await import("../client/src/lib/session-data");
    
    // Check if handy hacks already exist
    const existingHacks = await db.select().from(handyHacks).limit(1);
    if (existingHacks.length > 0) {
      return; // Handy hacks already initialized
    }

    // Insert handy hacks data
    for (const hack of handyHacksData) {
      await db.insert(handyHacks).values({
        title: hack.title,
        description: hack.description,
        category: hack.category,
        illustration: hack.illustration,
      });
    }
  }

  async createNotification(userId: string, notification: InsertNotification): Promise<Notification> {
    const { db } = await import("./db");
    const [newNotification] = await db
      .insert(notifications)
      .values({ ...notification, userId })
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
  }

  async getAllMilestones(): Promise<Milestone[]> {
    const { db } = await import("./db");
    return await db.select().from(milestones);
  }

  async getUserMilestones(userId: string): Promise<UserMilestone[]> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    return await db.select().from(userMilestones).where(eq(userMilestones.userId, userId));
  }

  async checkAndUpdateMilestones(userId: string): Promise<UserMilestone[]> {
    // Milestone checking logic would go here
    return [];
  }

  async initializeMilestones(): Promise<void> {
    const { db } = await import("./db");
    
    // Check if milestones already exist
    const existingMilestones = await db.select().from(milestones).limit(1);
    if (existingMilestones.length > 0) {
      return; // Milestones already initialized
    }

    // Insert milestone data
    const milestonesData = [
      { title: "First Session", description: "Complete your first meditation session", type: "sessions", target: 1, badge: "🧘", color: "#3B82F6" },
      { title: "Week Warrior", description: "Complete all sessions in a week", type: "weekly", target: 1, badge: "⭐", color: "#10B981" },
      { title: "Consistent Practice", description: "Meditate for 7 days in a row", type: "streak", target: 7, badge: "🔥", color: "#F59E0B" },
      { title: "Deep Listener", description: "Listen for 60 minutes total", type: "time", target: 3600, badge: "🎧", color: "#8B5CF6" },
    ];

    for (const milestone of milestonesData) {
      await db.insert(milestones).values(milestone);
    }
  }

  async updateUserNotificationSettings(userId: string, settings: {
    notificationsEnabled: boolean;
    reminderTime: string;
    reminderDays: number[];
  }): Promise<void> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    await db.update(users)
      .set({
        notificationsEnabled: settings.notificationsEnabled,
        reminderTime: settings.reminderTime,
        reminderDays: settings.reminderDays,
      })
      .where(eq(users.id, userId));
  }

  async scheduleUserReminders(userId: string): Promise<void> {
    // Reminder scheduling logic would go here
  }

  async createSessionAnalytics(userId: string, analytics: Omit<InsertSessionAnalytics, 'userId'>): Promise<SessionAnalytics> {
    const [result] = await db.insert(sessionAnalytics).values({
      userId,
      ...analytics,
    }).returning();
    return result;
  }

  async updateSessionAnalytics(analyticsId: number, analytics: Partial<InsertSessionAnalytics>): Promise<void> {
    await db.update(sessionAnalytics)
      .set(analytics)
      .where(eq(sessionAnalytics.id, analyticsId));
  }

  async getSessionAnalytics(userId: string, sessionId?: number): Promise<SessionAnalytics[]> {
    const query = db.select().from(sessionAnalytics).where(eq(sessionAnalytics.userId, userId));
    
    if (sessionId) {
      return await query.where(eq(sessionAnalytics.sessionId, sessionId));
    }
    
    return await query;
  }

  async getAdvancedProgressData(userId: string): Promise<{
    totalListenTime: number;
    averageSessionCompletion: number;
    mostPlayedSession: Session | null;
    streakDays: number;
    weeklyProgress: Array<{ week: number; completedSessions: number; totalSessions: number }>;
    practicePattern: Array<{ hour: number; sessionCount: number }>;
  }> {
    const { sql, sum, avg, count, max } = await import("drizzle-orm");
    
    // Get total listen time
    const totalListenTimeResult = await db
      .select({ total: sum(userProgress.totalListenTime) })
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    
    const totalListenTime = totalListenTimeResult[0]?.total || 0;

    // Get average session completion
    const avgCompletionResult = await db
      .select({ avg: avg(userProgress.completionPercentage) })
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    
    const averageSessionCompletion = avgCompletionResult[0]?.avg || 0;

    // Get most played session
    const mostPlayedResult = await db
      .select({ 
        sessionId: userProgress.sessionId,
        playCount: max(userProgress.playCount)
      })
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .groupBy(userProgress.sessionId)
      .orderBy(sql`${max(userProgress.playCount)} DESC`)
      .limit(1);
    
    let mostPlayedSession = null;
    if (mostPlayedResult[0]?.sessionId) {
      const sessionResult = await db
        .select()
        .from(meditationSessions)
        .where(eq(meditationSessions.id, mostPlayedResult[0].sessionId));
      mostPlayedSession = sessionResult[0] || null;
    }

    // Get current streak
    const streakResult = await db
      .select({ streak: max(userProgress.streakDays) })
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    
    const streakDays = streakResult[0]?.streak || 0;

    // Get weekly progress
    const weeklyProgressResult = await db
      .select({
        week: meditationSessions.week,
        completedSessions: count(sql`CASE WHEN ${userProgress.completed} = true THEN 1 END`),
        totalSessions: count(meditationSessions.id)
      })
      .from(meditationSessions)
      .leftJoin(userProgress, 
        sql`${meditationSessions.id} = ${userProgress.sessionId} AND ${userProgress.userId} = ${userId}`)
      .groupBy(meditationSessions.week)
      .orderBy(meditationSessions.week);

    const weeklyProgress = weeklyProgressResult.map(row => ({
      week: row.week,
      completedSessions: row.completedSessions || 0,
      totalSessions: row.totalSessions || 0
    }));

    // Get practice pattern by hour
    const practicePatternResult = await db
      .select({
        hour: sql`EXTRACT(HOUR FROM ${sessionAnalytics.startTime})`.as('hour'),
        sessionCount: count(sessionAnalytics.id)
      })
      .from(sessionAnalytics)
      .where(eq(sessionAnalytics.userId, userId))
      .groupBy(sql`EXTRACT(HOUR FROM ${sessionAnalytics.startTime})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${sessionAnalytics.startTime})`);

    const practicePattern = practicePatternResult.map(row => ({
      hour: Number(row.hour),
      sessionCount: row.sessionCount || 0
    }));

    return {
      totalListenTime,
      averageSessionCompletion,
      mostPlayedSession,
      streakDays,
      weeklyProgress,
      practicePattern
    };
  }
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

  async updateUserSessionsPace(userId: string, sessionsPace: number): Promise<void> {
    // Convert string userId to number for MemStorage compatibility
    const numericUserId = parseInt(userId);
    const user = this.users.get(numericUserId);
    if (user) {
      user.sessionsPace = sessionsPace;
      this.users.set(numericUserId, user);
    }
  }

  async updateUserCourseFormat(userId: string, courseFormat: string): Promise<void> {
    // Convert string userId to number for MemStorage compatibility
    const numericUserId = parseInt(userId);
    const user = this.users.get(numericUserId);
    if (user) {
      user.courseFormat = courseFormat;
      this.users.set(numericUserId, user);
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

export const storage = new DatabaseStorage();
