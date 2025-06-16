import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface NotificationOptions {
  title: string;
  message: string;
  type: "practice" | "hack" | "weekly";
  scheduledFor?: Date;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isScheduled, setIsScheduled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return "denied";
  };

  const scheduleNotification = async (options: NotificationOptions) => {
    if (permission !== "granted") {
      const result = await requestPermission();
      if (result !== "granted") {
        toast({
          title: "Notifications Disabled",
          description: "Please enable notifications to receive mindfulness reminders.",
          variant: "destructive",
        });
        return false;
      }
    }

    // Register with service worker for background notifications
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        payload: options
      });
    }

    // Also show browser notification if available
    if ("Notification" in window && permission === "granted") {
      new Notification(options.title, {
        body: options.message,
        icon: "./apple-touch-icon.png",
        badge: "./favicon-32x32.png",
        tag: options.type,
      });
    }

    return true;
  };

  const scheduleDailyPracticeReminder = async (time: string = '09:00') => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return scheduleNotification({
      title: "Coming to Our Senses",
      message: "Time for your daily mindfulness practice. Take a moment to drop the balloon and breathe.",
      type: "practice",
      scheduledFor: scheduledTime,
    });
  };

  const scheduleRandomHandyHackReminders = async () => {
    if (isScheduled) return;
    
    // Schedule 4 random reminders throughout the day
    const reminderTimes = [
      { hour: 11, minute: 30 }, // Mid-morning
      { hour: 14, minute: 15 }, // Early afternoon  
      { hour: 17, minute: 45 }, // Late afternoon
      { hour: 20, minute: 30 }, // Evening
    ];

    const today = new Date();
    
    for (const time of reminderTimes) {
      const scheduledTime = new Date(today);
      scheduledTime.setHours(time.hour, time.minute, 0, 0);
      
      if (scheduledTime > new Date()) {
        // Fetch a random hack and schedule it
        setTimeout(async () => {
          try {
            const response = await fetch('/api/handy-hacks/random');
            const hack = await response.json();
            
            scheduleNotification({
              title: hack.title,
              message: hack.description,
              type: "hack",
            });
          } catch (error) {
            console.error('Failed to fetch handy hack for notification:', error);
          }
        }, scheduledTime.getTime() - Date.now());
      }
    }
    
    setIsScheduled(true);
  };

  const scheduleWeeklyProgress = (week: number) => {
    scheduleNotification({
      title: `Week ${week} Complete!`,
      message: "Congratulations on completing another week of mindful practice. Your journey continues to unfold.",
      type: "weekly",
    });
  };

  // Auto-schedule notifications when permission is granted
  useEffect(() => {
    if (permission === 'granted' && !isScheduled) {
      scheduleDailyPracticeReminder();
      scheduleRandomHandyHackReminders();
    }
  }, [permission, isScheduled]);

  return {
    permission,
    requestPermission,
    scheduleNotification,
    scheduleDailyPracticeReminder,
    scheduleRandomHandyHackReminders,
    scheduleWeeklyProgress,
    isScheduled,
  };
}
