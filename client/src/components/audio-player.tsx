import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Session } from "@shared/schema";

interface AudioPlayerProps {
  session: Session;
  onClose: () => void;
}

const DEMO_USER_ID = 1;

export function AudioPlayer({ session, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(session.duration * 60); // Convert minutes to seconds
  const queryClient = useQueryClient();
  
  // Simulate audio progress
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateProgressMutation = useMutation({
    mutationFn: async (progress: number) => {
      await apiRequest("POST", `/api/users/${DEMO_USER_ID}/progress/${session.id}`, {
        audioProgress: progress,
        completed: progress >= duration * 0.9, // Mark as completed when 90% done
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "progress"] });
    },
  });

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          // Update progress every 10 seconds
          if (newTime % 10 === 0) {
            updateProgressMutation.mutate(newTime);
          }
          
          // Auto-pause when reaching the end
          if (newTime >= duration) {
            setIsPlaying(false);
            updateProgressMutation.mutate(newTime);
            return duration;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, duration, updateProgressMutation]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50">
      <Card className="shadow-lg border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              className="rounded-full w-10 h-10 p-0"
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex-1">
              <h4 className="font-medium text-primary text-sm line-clamp-1">
                {session.title}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 h-1 bg-gray-200 rounded-full">
                  <div 
                    className="h-1 bg-accent rounded-full transition-all duration-300 audio-progress"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTime(duration)}
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
        </CardContent>
      </Card>
    </div>
  );
}
