// Notification Service - Handles scheduling and sending practice reminders

interface NotificationSchedule {
  id: string;
  title: string;
  message: string;
  scheduledTime: Date;
  isRecurring: boolean;
  pattern?: 'daily' | 'weekly';
}

class NotificationService {
  private schedules: Map<string, NotificationSchedule> = new Map();
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.initializePermissions();
    this.startScheduler();
  }

  async initializePermissions(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async scheduleReminder(
    id: string,
    title: string,
    message: string,
    scheduledTime: Date,
    isRecurring: boolean = false,
    pattern?: 'daily' | 'weekly'
  ): Promise<void> {
    const schedule: NotificationSchedule = {
      id,
      title,
      message,
      scheduledTime,
      isRecurring,
      pattern,
    };

    this.schedules.set(id, schedule);
    this.saveSchedulesToStorage();
  }

  async cancelReminder(id: string): Promise<void> {
    this.schedules.delete(id);
    this.saveSchedulesToStorage();
  }

  async sendNotification(title: string, message: string, options?: NotificationOptions): Promise<void> {
    if (!await this.initializePermissions()) {
      console.warn('Notifications not permitted');
      return;
    }

    const notification = new Notification(title, {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'practice-reminder',
      requireInteraction: false,
      silent: false,
      ...options,
    });

    // Auto-close notification after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
      // Navigate to the app if it's not already focused
      if (document.hidden) {
        window.location.href = '/';
      }
    };
  }

  private startScheduler(): void {
    // Check for due notifications every minute
    this.intervalId = setInterval(() => {
      this.checkAndSendDueNotifications();
    }, 60000); // Check every minute

    // Also check immediately
    this.checkAndSendDueNotifications();
  }

  private async checkAndSendDueNotifications(): Promise<void> {
    const now = new Date();
    const dueSchedules: NotificationSchedule[] = [];

    this.schedules.forEach((schedule) => {
      if (schedule.scheduledTime <= now) {
        dueSchedules.push(schedule);
      }
    });

    for (const schedule of dueSchedules) {
      await this.sendNotification(schedule.title, schedule.message);

      if (schedule.isRecurring && schedule.pattern) {
        // Reschedule for next occurrence
        const nextTime = this.getNextScheduledTime(schedule.scheduledTime, schedule.pattern);
        const newSchedule = {
          ...schedule,
          scheduledTime: nextTime,
        };
        this.schedules.set(schedule.id, newSchedule);
      } else {
        // Remove one-time notification
        this.schedules.delete(schedule.id);
      }
    }

    if (dueSchedules.length > 0) {
      this.saveSchedulesToStorage();
    }
  }

  private getNextScheduledTime(currentTime: Date, pattern: 'daily' | 'weekly'): Date {
    const next = new Date(currentTime);
    
    if (pattern === 'daily') {
      next.setDate(next.getDate() + 1);
    } else if (pattern === 'weekly') {
      next.setDate(next.getDate() + 7);
    }
    
    return next;
  }

  private saveSchedulesToStorage(): void {
    const scheduleArray = Array.from(this.schedules.entries()).map(([scheduleId, schedule]) => ({
      scheduleId,
      ...schedule,
      scheduledTime: schedule.scheduledTime.toISOString(),
    }));
    localStorage.setItem('notification-schedules', JSON.stringify(scheduleArray));
  }

  private loadSchedulesFromStorage(): void {
    try {
      const saved = localStorage.getItem('notification-schedules');
      if (saved) {
        const scheduleArray = JSON.parse(saved);
        scheduleArray.forEach((item: any) => {
          this.schedules.set(item.scheduleId || item.id, {
            id: item.id,
            title: item.title,
            message: item.message,
            scheduledTime: new Date(item.scheduledTime),
            isRecurring: item.isRecurring,
            pattern: item.pattern,
          });
        });
      }
    } catch (error) {
      console.error('Failed to load notification schedules:', error);
    }
  }

  async scheduleUserReminders(
    userId: number,
    reminderTime: string,
    reminderDays: number[],
    enabled: boolean = true
  ): Promise<void> {
    // Clear existing reminders for this user
    const userScheduleIds = Array.from(this.schedules.keys()).filter(id => 
      id.startsWith(`user-${userId}-`)
    );
    userScheduleIds.forEach(id => this.schedules.delete(id));

    if (!enabled) {
      this.saveSchedulesToStorage();
      return;
    }

    const [hours, minutes] = reminderTime.split(':').map(Number);
    const reminderMessages = [
      "Time for your daily mindfulness practice! 🧘‍♀️",
      "Take a moment to breathe and be present 🌱",
      "Your meditation session is waiting for you ✨",
      "Remember to pause and practice mindfulness today 🌸",
      "A few minutes of mindfulness can transform your day 🌟"
    ];

    // Schedule reminders for the next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);
      const dayOfWeek = targetDate.getDay();

      if (reminderDays.includes(dayOfWeek)) {
        targetDate.setHours(hours, minutes, 0, 0);

        // Only schedule future reminders
        if (targetDate > new Date()) {
          const randomMessage = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
          const scheduleId = `user-${userId}-${dayOffset}`;
          
          await this.scheduleReminder(
            scheduleId,
            "Practice Reminder",
            randomMessage,
            targetDate,
            true,
            'daily'
          );
        }
      }
    }
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Get current schedules for debugging
  getSchedules(): NotificationSchedule[] {
    return Array.from(this.schedules.values());
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Initialize from storage on load
notificationService['loadSchedulesFromStorage']();

// Global cleanup on page unload
window.addEventListener('beforeunload', () => {
  notificationService.destroy();
});