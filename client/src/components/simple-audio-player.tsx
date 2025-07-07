import React, { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Session } from "@shared/schema";

interface SimpleAudioPlayerProps {
  session: Session;
  onClose: () => void;
}

const DEMO_USER_ID = 1;

export function SimpleAudioPlayer({ session, onClose }: SimpleAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const queryClient = useQueryClient();
  const sessionStartTime = useRef<number>(Date.now());
  const currentAnalyticsId = useRef<number | null>(null);
  const pauseStartTime = useRef<number | null>(null);
  const pauseDurations = useRef<number[]>([]);
  const seekEvents = useRef<number[]>([]);
  const playCount = useRef(0);
  const pauseCount = useRef(0);
  const skipCount = useRef(0);

  const updateProgressMutation = useMutation({
    mutationFn: async (progress: { 
      audioProgress: number; 
      totalListenTime: number; 
      completed: boolean;
      analyticsData?: {
        startTime?: string;
        endTime?: string;
        totalDuration?: number;
        pauseDurations?: number[];
        seekEvents?: number[];
        completionRate?: number;
        deviceType?: string;
      };
    }) => {
      await apiRequest("POST", `/api/users/${DEMO_USER_ID}/progress/${session.id}`, progress);
      return progress.completed;
    },
    onSuccess: (isCompleted) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "progress"] });
      
      // Check for new milestones when session is completed
      if (isCompleted && (window as any).checkMilestones) {
        (window as any).checkMilestones();
      }
    },
  });

  const createAnalyticsMutation = useMutation({
    mutationFn: async (analyticsData: any) => {
      const response = await apiRequest("POST", `/api/users/${DEMO_USER_ID}/analytics`, analyticsData);
      return response;
    },
    onSuccess: (data) => {
      currentAnalyticsId.current = data.id;
    },
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let lastUpdateTime = 0;

    // Initialize session analytics
    const startAnalytics = () => {
      playCount.current += 1;
      createAnalyticsMutation.mutate({
        sessionId: session.id,
        startTime: new Date().toISOString(),
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
      });
    };

    const handleTimeUpdate = () => {
      const currentSeconds = Math.floor(audio.currentTime);
      const duration = Math.floor(audio.duration || 0);
      
      // Update progress every 10 seconds
      if (currentSeconds > lastUpdateTime && currentSeconds % 10 === 0) {
        lastUpdateTime = currentSeconds;
        const isCompleted = duration > 0 && currentSeconds >= duration * 0.9;
        const completionRate = duration > 0 ? Math.round((currentSeconds / duration) * 100) : 0;
        
        updateProgressMutation.mutate({
          audioProgress: currentSeconds,
          totalListenTime: currentSeconds,
          completed: isCompleted,
          analyticsData: {
            totalDuration: currentSeconds,
            completionRate,
            pauseDurations: pauseDurations.current,
            seekEvents: seekEvents.current,
          },
        });
      }
    };

    const handleEnded = () => {
      const duration = Math.floor(audio.duration || 0);
      updateProgressMutation.mutate({
        audioProgress: duration,
        totalListenTime: duration,
        completed: true,
        analyticsData: {
          endTime: new Date().toISOString(),
          totalDuration: duration,
          completionRate: 100,
          pauseDurations: pauseDurations.current,
          seekEvents: seekEvents.current,
        },
      });
    };

    const handlePlay = () => {
      if (playCount.current === 0) {
        startAnalytics();
      }
      
      // End pause tracking
      if (pauseStartTime.current) {
        const pauseDuration = Date.now() - pauseStartTime.current;
        pauseDurations.current.push(pauseDuration);
        pauseStartTime.current = null;
      }
    };

    const handlePause = () => {
      pauseCount.current += 1;
      pauseStartTime.current = Date.now();
    };

    const handleSeeking = () => {
      seekEvents.current.push(Math.floor(audio.currentTime));
      skipCount.current += 1;
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('seeking', handleSeeking);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('seeking', handleSeeking);
    };
  }, [session.id, updateProgressMutation, createAnalyticsMutation]);
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
            ref={audioRef}
            controls 
            className="w-full"
            preload="metadata"
            autoPlay={true}
          >
            <source src={session.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </CardContent>
      </Card>
    </div>
  );
}