import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, X, Volume2 } from "lucide-react";
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
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const queryClient = useQueryClient();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateProgressMutation = useMutation({
    mutationFn: async (progress: number) => {
      const isCompleted = progress >= duration * 0.9;
      await apiRequest("POST", `/api/users/${DEMO_USER_ID}/progress/${session.id}`, {
        audioProgress: progress,
        totalListenTime: progress, // Track total time listened
        completed: isCompleted,
      });
      return isCompleted;
    },
    onSuccess: (isCompleted) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "progress"] });
      
      // Check for new milestones when session is completed
      if (isCompleted && (window as any).checkMilestones) {
        (window as any).checkMilestones();
      }
    },
  });

  // Initialize audio element
  useEffect(() => {
    if (session.audioUrl) {
      console.log('Loading audio:', session.audioUrl);
      audioRef.current = new Audio(session.audioUrl);
      const audio = audioRef.current;
      
      const handleLoadedMetadata = () => {
        console.log('Audio metadata loaded, duration:', audio.duration);
        setDuration(Math.floor(audio.duration));
        setIsLoaded(true);
      };
      
      const handleTimeUpdate = () => {
        const currentSeconds = Math.floor(audio.currentTime);
        setCurrentTime(currentSeconds);
        
        // Update progress every 10 seconds
        if (currentSeconds % 10 === 0) {
          updateProgressMutation.mutate(currentSeconds);
        }
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        updateProgressMutation.mutate(Math.floor(audio.duration));
      };
      
      const handleError = (e: Event) => {
        console.error('Audio loading error:', e);
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.pause();
      };
    }
  }, [session.audioUrl, updateProgressMutation]);

  const togglePlayback = async () => {
    console.log('togglePlayback called, audioRef.current:', !!audioRef.current, 'isLoaded:', isLoaded);
    if (!audioRef.current || !isLoaded) {
      console.log('Audio not ready - audioRef:', !!audioRef.current, 'isLoaded:', isLoaded);
      return;
    }
    
    try {
      if (isPlaying) {
        console.log('Pausing audio');
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('Attempting to play audio from URL:', session.audioUrl);
        await audioRef.current.play();
        console.log('Audio play() called successfully');
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
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
              disabled={!isLoaded}
            >
              {!isLoaded ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : isPlaying ? (
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
