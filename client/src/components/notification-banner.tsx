import { } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationBannerProps {
  show: boolean;
  onClose: () => void;
}

export function NotificationBanner({ show, onClose }: NotificationBannerProps) {
  return (
    <div className={cn(
      "fixed top-20 left-4 right-4 z-50 transition-all duration-300",
      show ? "transform translate-y-0 opacity-100" : "transform -translate-y-20 opacity-0 pointer-events-none"
    )}>
      <Card className="shadow-lg border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-primary text-sm">Time for your practice</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Your daily mindfulness session is ready. Take 15 minutes to center yourself.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
