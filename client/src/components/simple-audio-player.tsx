import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { X, Clock, ChevronDown, ChevronUp, Lightbulb, Check, Bell } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Session, HandyHack, UserHackCompletion } from "@shared/schema";

interface SimpleAudioPlayerProps {
  session: Session;
  onClose: () => void;
}

const DEMO_USER_ID = "1";

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
  
  // State for handy hacks
  const [hacksExpanded, setHacksExpanded] = useState(false);

  // Fetch session-specific handy hacks
  const { data: sessionHacks = [] } = useQuery<HandyHack[]>({
    queryKey: ["/api/sessions", session.id, "hacks"],
  });

  // Fetch user hack completions
  const { data: hackCompletions = [] } = useQuery<UserHackCompletion[]>({
    queryKey: ["/api/users", DEMO_USER_ID, "hack-completions"],
  });

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
    onError: (error) => {
      console.error("Failed to update progress:", error);
      // Continue playback even if progress update fails
    },
  });

  const createAnalyticsMutation = useMutation({
    mutationFn: async (analyticsData: any) => {
      const response = await apiRequest("POST", `/api/users/${DEMO_USER_ID}/analytics`, analyticsData);
      return response;
    },
    onSuccess: (data) => {
      if (data && data.id) {
        currentAnalyticsId.current = data.id;
      }
    },
    onError: (error) => {
      console.error("Failed to create analytics:", error);
      // Continue playback even if analytics fails
    },
  });

  // Mutations for handy hacks
  const completeHackMutation = useMutation({
    mutationFn: async ({ hackId }: { hackId: number }) => {
      await apiRequest("POST", `/api/users/${DEMO_USER_ID}/hacks/${hackId}/complete`, {
        sessionId: session.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "hack-completions"] });
    },
  });

  const scheduleReminderMutation = useMutation({
    mutationFn: async ({ hackId, scheduledFor }: { hackId: number; scheduledFor: Date }) => {
      await apiRequest("POST", `/api/hacks/${hackId}/reminders`, {
        userId: DEMO_USER_ID,
        scheduledFor: scheduledFor.toISOString(),
        sessionId: session.id,
        count: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "hack-reminders"] });
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
      if (!audio || isNaN(audio.currentTime)) return;
      
      const currentSeconds = Math.floor(audio.currentTime);
      const duration = Math.floor(audio.duration || 0);
      
      // Update progress every 10 seconds
      if (currentSeconds > lastUpdateTime && currentSeconds % 10 === 0) {
        lastUpdateTime = currentSeconds;
        const isCompleted = duration > 0 && currentSeconds >= duration * 0.9;
        const completionRate = duration > 0 ? Math.round((currentSeconds / duration) * 100) : 0;
        
        // Only update if we have valid data
        if (!updateProgressMutation.isPending) {
          updateProgressMutation.mutate({
            audioProgress: currentSeconds,
            totalListenTime: currentSeconds,
            completed: isCompleted,
            analyticsData: {
              totalDuration: currentSeconds,
              completionRate,
              pauseDurations: [...pauseDurations.current], // Create copy to avoid reference issues
              seekEvents: [...seekEvents.current], // Create copy to avoid reference issues
            },
          });
        }
      }
    };

    const handleEnded = () => {
      if (!audio || isNaN(audio.duration)) return;
      
      const duration = Math.floor(audio.duration || 0);
      
      // Only update if we have valid data and no pending mutation
      if (!updateProgressMutation.isPending && duration > 0) {
        updateProgressMutation.mutate({
          audioProgress: duration,
          totalListenTime: duration,
          completed: true,
          analyticsData: {
            endTime: new Date().toISOString(),
            totalDuration: duration,
            completionRate: 100,
            pauseDurations: [...pauseDurations.current], // Create copy to avoid reference issues
            seekEvents: [...seekEvents.current], // Create copy to avoid reference issues
          },
        });
      }
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
      if (!audio || isNaN(audio.currentTime)) return;
      
      const currentTime = Math.floor(audio.currentTime);
      seekEvents.current.push(currentTime);
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

  // Helper functions for handy hacks
  const isHackCompleted = (hackId: number) => {
    return hackCompletions.some(completion => 
      completion.hackId === hackId && 
      (completion.sessionId === session.id || completion.sessionId === null)
    );
  };

  const handleCompleteHack = (hackId: number) => {
    completeHackMutation.mutate({ hackId });
  };

  const handleScheduleReminder = (hackId: number) => {
    // Schedule reminder for tomorrow at 10 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    scheduleReminderMutation.mutate({ hackId, scheduledFor: tomorrow });
  };

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

          {/* Session Handy Hacks */}
          {sessionHacks.length > 0 && (
            <Collapsible open={hacksExpanded} onOpenChange={setHacksExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full mt-3 p-2 justify-between hover:bg-gray-50"
                  data-testid="hacks-toggle-btn"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">
                      Session Tips ({sessionHacks.length})
                    </span>
                  </div>
                  {hacksExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-2">
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sessionHacks.map((hack) => {
                    const completed = isHackCompleted(hack.id);
                    return (
                      <div
                        key={hack.id}
                        className="p-3 bg-gray-50 rounded-lg border"
                        data-testid={`hack-item-${hack.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900 mb-1">
                              {hack.title}
                            </h5>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {hack.description}
                            </p>
                            {hack.category && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                {hack.category}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <Button
                              variant={completed ? "default" : "outline"}
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleCompleteHack(hack.id)}
                              disabled={completed || completeHackMutation.isPending}
                              data-testid={`hack-complete-btn-${hack.id}`}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleScheduleReminder(hack.id)}
                              disabled={scheduleReminderMutation.isPending}
                              data-testid={`hack-reminder-btn-${hack.id}`}
                            >
                              <Bell className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    </div>
  );
}