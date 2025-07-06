import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Clock } from "lucide-react";
import type { Session } from "@shared/schema";

interface SimpleAudioPlayerProps {
  session: Session;
  onClose: () => void;
}

export function SimpleAudioPlayer({ session, onClose }: SimpleAudioPlayerProps) {
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50">
      <Card className="shadow-lg border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-primary text-sm line-clamp-1">
                {session.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  Week {session.week}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {session.duration} min
                </span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <audio 
            controls 
            className="w-full"
            preload="metadata"
            autoPlay={false}
          >
            <source src={session.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </CardContent>
      </Card>
    </div>
  );
}