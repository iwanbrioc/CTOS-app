import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { notificationService } from "@/lib/notification-service";
import { Bell, Clock, Calendar } from "lucide-react";
import type { User } from "@shared/schema";

interface NotificationSettingsProps {
  userId: number;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

const TIME_OPTIONS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"
];

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>("default");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
  });

  // Initialize state from user data
  useEffect(() => {
    if (user) {
      setNotificationsEnabled(user.notificationsEnabled ?? true);
      setReminderTime(user.reminderTime ?? "09:00");
      setSelectedDays((user.reminderDays as number[]) ?? [1, 2, 3, 4, 5]);
    }
  }, [user]);

  // Check browser notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: {
      notificationsEnabled: boolean;
      reminderTime: string;
      reminderDays: number[];
    }) => {
      await apiRequest("PUT", `/api/users/${userId}/notification-settings`, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    },
  });

  const requestPermissionMutation = useMutation({
    mutationFn: async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setBrowserPermission(permission);
        return permission;
      }
      throw new Error("Notifications not supported");
    },
    onSuccess: (permission) => {
      if (permission === "granted") {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive practice reminders.",
        });
      } else {
        toast({
          title: "Notifications Denied",
          description: "You can enable them later in your browser settings.",
          variant: "destructive",
        });
      }
    },
  });

  const scheduleRemindersMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/users/${userId}/schedule-reminders`);
    },
    onSuccess: () => {
      toast({
        title: "Reminders Scheduled",
        description: "Your practice reminders have been set up.",
      });
    },
  });

  const handleSaveSettings = async () => {
    updateSettingsMutation.mutate({
      notificationsEnabled,
      reminderTime,
      reminderDays: selectedDays,
    });
    
    if (notificationsEnabled) {
      // Schedule backend reminders
      scheduleRemindersMutation.mutate();
      
      // Also schedule browser notifications via the notification service
      await notificationService.scheduleUserReminders(
        userId,
        reminderTime,
        selectedDays,
        notificationsEnabled
      );
    } else {
      // Clear all browser notifications when disabled
      await notificationService.scheduleUserReminders(
        userId,
        reminderTime,
        selectedDays,
        false
      );
    }
  };

  const handleDayToggle = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const sendTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification("Coming to Our Senses", {
        body: "Time for your daily mindfulness practice! 🧘‍♀️",
        icon: "/favicon.ico",
        tag: "practice-reminder",
      });
      toast({
        title: "Test Notification Sent",
        description: "Check if you received the notification.",
      });
    } else {
      toast({
        title: "Notifications Not Available",
        description: "Please enable browser notifications first.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Practice Reminders
          </CardTitle>
          <CardDescription>
            Set up daily reminders to help maintain your mindfulness practice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Browser Permission */}
          {browserPermission !== "granted" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-yellow-800">Enable Notifications</h4>
                  <p className="text-sm text-yellow-700">
                    Allow browser notifications to receive practice reminders
                  </p>
                </div>
                <Button 
                  onClick={() => requestPermissionMutation.mutate()}
                  disabled={requestPermissionMutation.isPending}
                  size="sm"
                >
                  Enable
                </Button>
              </div>
            </div>
          )}

          {/* Main Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications-enabled" className="text-base font-medium">
                Practice Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive daily notifications to practice mindfulness
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          {notificationsEnabled && (
            <>
              {/* Time Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Reminder Time
                </Label>
                <Select value={reminderTime} onValueChange={setReminderTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Days Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Reminder Days
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={selectedDays.includes(day.value)}
                        onCheckedChange={() => handleDayToggle(day.value)}
                      />
                      <Label 
                        htmlFor={`day-${day.value}`}
                        className="text-sm font-normal"
                      >
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Preview:</strong> You'll receive reminders at {reminderTime} on{' '}
                  {selectedDays.length === 7 
                    ? "every day"
                    : selectedDays.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(", ")
                  }
                </p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending}
              className="flex-1"
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
            
            {browserPermission === "granted" && (
              <Button 
                variant="outline" 
                onClick={sendTestNotification}
                size="sm"
              >
                Test
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              // Schedule immediate reminder for testing
              if ('Notification' in window && Notification.permission === 'granted') {
                setTimeout(() => {
                  new Notification("Practice Reminder", {
                    body: "Take a moment to breathe and be present 🌱",
                    icon: "/favicon.ico",
                  });
                }, 2000);
                toast({
                  title: "Reminder Set",
                  description: "You'll receive a test reminder in 2 seconds.",
                });
              }
            }}
          >
            <Bell className="h-4 w-4 mr-2" />
            Send Test Reminder Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}