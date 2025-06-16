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
        return;
      }
    }

    // For demo purposes, show immediate toast notification
    // In production, this would integrate with the service worker
    setTimeout(() => {
      toast({
        title: options.title,
        description: options.message,
      });
      
      // Also show browser notification if available
      if ("Notification" in window && permission === "granted") {
        new Notification(options.title, {
          body: options.message,
          icon: "/apple-touch-icon.png",
          badge: "/favicon-32x32.png",
        });
      }
    }, 1000);
  };

  const scheduleDailyReminder = () => {
    scheduleNotification({
      title: "Time for Practice",
      message: "Your daily mindfulness session is ready. Take a moment to center yourself.",
      type: "practice",
    });
  };

  const scheduleHandyHackReminder = () => {
    scheduleNotification({
      title: "Handy Hack Reminder",
      message: "Try a quick mindfulness hack to bring awareness to this moment.",
      type: "hack",
    });
  };

  const scheduleWeeklyProgress = (week: number) => {
    scheduleNotification({
      title: `Week ${week} Complete!`,
      message: "Congratulations on completing another week of mindful practice.",
      type: "weekly",
    });
  };

  return {
    permission,
    requestPermission,
    scheduleNotification,
    scheduleDailyReminder,
    scheduleHandyHackReminder,
    scheduleWeeklyProgress,
  };
}
