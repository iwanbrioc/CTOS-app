// Notification Service
// Uses @capacitor/local-notifications on iOS/Android, browser Notification API on web.

import { Capacitor } from "@capacitor/core";

// Lazy-import the native plugin so the web build never errors
async function getLocalNotifications() {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  return LocalNotifications;
}

// ─── Permission helpers ────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const LN = await getLocalNotifications();
    const result = await LN.requestPermissions();
    return result.display === "granted";
  }

  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export async function checkNotificationPermission(): Promise<"granted" | "denied" | "prompt"> {
  if (Capacitor.isNativePlatform()) {
    const LN = await getLocalNotifications();
    const result = await LN.checkPermissions();
    if (result.display === "granted") return "granted";
    if (result.display === "denied") return "denied";
    return "prompt";
  }

  if (!("Notification" in window)) return "denied";
  return Notification.permission as "granted" | "denied" | "prompt";
}

// ─── Core send ─────────────────────────────────────────────────────────────

let nativeIdCounter = 1000; // start above 0, avoids iOS edge cases

export async function sendNotificationNow(title: string, body: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const LN = await getLocalNotifications();
    await LN.schedule({
      notifications: [{
        id: nativeIdCounter++,
        title,
        body,
        schedule: { at: new Date(Date.now() + 500) }, // 0.5 s delay so iOS registers it
        sound: undefined,
        actionTypeId: "",
        extra: null,
      }],
    });
    return;
  }

  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const n = new Notification(title, { body, icon: "/favicon.ico", tag: "practice-reminder" });
  setTimeout(() => n.close(), 10000);
  n.onclick = () => { window.focus(); n.close(); };
}

// ─── Schedule / cancel helpers ─────────────────────────────────────────────

// We store scheduled native IDs in localStorage so we can cancel them later
const STORAGE_KEY = "ctos-native-notification-ids";

function loadNativeIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveNativeIds(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

async function cancelAllNative(): Promise<void> {
  const LN = await getLocalNotifications();
  const ids = loadNativeIds().map(id => ({ id }));
  if (ids.length > 0) {
    await LN.cancel({ notifications: ids }).catch(() => {});
  }
  saveNativeIds([]);
}

// ─── User reminder scheduling ──────────────────────────────────────────────

const REMINDER_MESSAGES = [
  "Time for your daily mindfulness practice",
  "Take a moment to breathe and be present",
  "Your meditation session is waiting for you",
  "A few minutes of mindfulness can transform your day",
  "Pause, breathe, arrive",
];

function randomMessage() {
  return REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
}

export async function scheduleUserReminders(
  userId: string,
  reminderTime: string,
  reminderDays: number[],
  enabled: boolean
): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await scheduleNativeReminders(reminderTime, reminderDays, enabled);
  } else {
    await scheduleWebReminders(userId, reminderTime, reminderDays, enabled);
  }
}

// ── Native (iOS / Android) ──────────────────────────────────────────────────

async function scheduleNativeReminders(
  reminderTime: string,
  reminderDays: number[],
  enabled: boolean
): Promise<void> {
  const LN = await getLocalNotifications();

  // Always cancel existing ones first
  await cancelAllNative();
  if (!enabled || reminderDays.length === 0) return;

  const [hours, minutes] = reminderTime.split(":").map(Number);
  const notifications: {
    id: number; title: string; body: string;
    schedule: { at: Date; repeats: boolean; every: "week" };
    sound: undefined; actionTypeId: string; extra: null;
  }[] = [];
  const ids: number[] = [];

  // Schedule one repeating notification per selected weekday (repeats weekly)
  // We find the next occurrence of each weekday within the next 7 days
  for (const targetDay of reminderDays) {
    const now = new Date();
    const at = new Date();
    at.setHours(hours, minutes, 0, 0);

    // Advance to the correct weekday
    const daysUntil = (targetDay - now.getDay() + 7) % 7;
    at.setDate(at.getDate() + (daysUntil === 0 && at <= now ? 7 : daysUntil));

    const id = nativeIdCounter++;
    ids.push(id);

    notifications.push({
      id,
      title: "Coming to Our Senses",
      body: randomMessage(),
      schedule: { at, repeats: true, every: "week" },
      sound: undefined,
      actionTypeId: "",
      extra: null,
    });
  }

  await LN.schedule({ notifications });
  saveNativeIds(ids);
}

// ── Web (browser) ───────────────────────────────────────────────────────────
// Uses an in-memory + localStorage poll-based approach (app must be open)

interface WebSchedule {
  id: string;
  title: string;
  body: string;
  at: string; // ISO
  recurring: boolean;
}

const WEB_STORAGE_KEY = "ctos-web-notification-schedules";
let webIntervalId: ReturnType<typeof setInterval> | null = null;

function loadWebSchedules(): WebSchedule[] {
  try {
    return JSON.parse(localStorage.getItem(WEB_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveWebSchedules(schedules: WebSchedule[]) {
  localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(schedules));
}

function startWebScheduler() {
  if (webIntervalId) return;
  webIntervalId = setInterval(async () => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const now = Date.now();
    const schedules = loadWebSchedules();
    const updated: WebSchedule[] = [];

    for (const s of schedules) {
      if (new Date(s.at).getTime() <= now) {
        const n = new Notification(s.title, { body: s.body, icon: "/favicon.ico" });
        setTimeout(() => n.close(), 10000);

        if (s.recurring) {
          // Reschedule for 7 days later
          const next = new Date(s.at);
          next.setDate(next.getDate() + 7);
          updated.push({ ...s, at: next.toISOString() });
        }
        // else drop it (one-time)
      } else {
        updated.push(s);
      }
    }

    saveWebSchedules(updated);
  }, 60_000);
}

async function scheduleWebReminders(
  userId: string,
  reminderTime: string,
  reminderDays: number[],
  enabled: boolean
): Promise<void> {
  if (!enabled || reminderDays.length === 0) {
    saveWebSchedules([]);
    return;
  }

  const [hours, minutes] = reminderTime.split(":").map(Number);
  const schedules: WebSchedule[] = [];

  for (const targetDay of reminderDays) {
    const now = new Date();
    const at = new Date();
    at.setHours(hours, minutes, 0, 0);
    const daysUntil = (targetDay - now.getDay() + 7) % 7;
    at.setDate(at.getDate() + (daysUntil === 0 && at <= now ? 7 : daysUntil));

    schedules.push({
      id: `user-${userId}-day-${targetDay}`,
      title: "Coming to Our Senses",
      body: randomMessage(),
      at: at.toISOString(),
      recurring: true,
    });
  }

  saveWebSchedules(schedules);
  startWebScheduler();
}

// Start web scheduler on module load (picks up persisted schedules)
if (!Capacitor.isNativePlatform()) {
  startWebScheduler();
}

window.addEventListener("beforeunload", () => {
  if (webIntervalId) clearInterval(webIntervalId);
});

// ─── Legacy compat export (used by older notification-test component) ───────
export const notificationService = {
  sendNotification: sendNotificationNow,
  scheduleUserReminders: (
    userId: number | string,
    reminderTime: string,
    reminderDays: number[],
    enabled: boolean
  ) => scheduleUserReminders(String(userId), reminderTime, reminderDays, enabled),
  scheduleReminder: async (
    id: string, title: string, message: string, at: Date
  ) => {
    const schedules = loadWebSchedules();
    schedules.push({ id, title, body: message, at: at.toISOString(), recurring: false });
    saveWebSchedules(schedules);
    startWebScheduler();
  },
  getSchedules: () => loadWebSchedules(),
};
