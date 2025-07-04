import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/lib/notification-service";
import { Bell, CheckCircle, XCircle, Clock } from "lucide-react";

export function NotificationTest() {
  const { toast } = useToast();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Not Supported",
        description: "Notifications are not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    
    if (permission === 'granted') {
      toast({
        title: "Permission Granted",
        description: "You can now receive practice reminders.",
      });
    } else {
      toast({
        title: "Permission Denied",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const sendTestNotification = async () => {
    await notificationService.sendNotification(
      "Test Reminder",
      "This is a test notification from Coming to Our Senses! 🧘‍♀️"
    );
    toast({
      title: "Test Sent",
      description: "Check if you received the notification.",
    });
  };

  const scheduleTestReminder = async () => {
    const in30Seconds = new Date(Date.now() + 30000);
    await notificationService.scheduleReminder(
      "test-reminder",
      "Scheduled Test",
      "Your scheduled test reminder is working! 🌟",
      in30Seconds
    );
    toast({
      title: "Reminder Scheduled",
      description: "You'll receive a test notification in 30 seconds.",
    });
  };

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Enabled</Badge>;
      case 'denied':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Test Center
        </CardTitle>
        <CardDescription>
          Test browser notifications and permission settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Browser Permission Status</p>
            <p className="text-sm text-gray-600">Current notification access level</p>
          </div>
          {getPermissionBadge()}
        </div>

        {/* Test Actions */}
        <div className="space-y-3">
          {permissionStatus !== 'granted' && (
            <Button 
              onClick={requestPermission}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Request Notification Permission
            </Button>
          )}

          {permissionStatus === 'granted' && (
            <>
              <Button 
                onClick={sendTestNotification}
                className="w-full"
                variant="outline"
              >
                Send Instant Test Notification
              </Button>

              <Button 
                onClick={scheduleTestReminder}
                className="w-full"
                variant="outline"
              >
                <Clock className="h-4 w-4 mr-2" />
                Schedule Test Reminder (30s)
              </Button>
            </>
          )}
        </div>

        {/* Information */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> Practice reminders will appear as browser notifications 
            at your scheduled times. Make sure to keep this tab open or add the app to your home screen 
            for the best experience.
          </p>
        </div>

        {/* Current Schedules */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium mb-2">Active Schedules:</p>
          <p className="text-sm text-gray-600">
            {notificationService.getSchedules().length} reminder(s) currently scheduled
          </p>
        </div>
      </CardContent>
    </Card>
  );
}