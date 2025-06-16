import { useState, useEffect, useRef } from "react";

interface UseAudioPlayerProps {
  duration: number; // in seconds
  onProgressUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

export function useAudioPlayer({ duration, onProgressUpdate, onComplete }: UseAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          // Call progress update callback
          if (onProgressUpdate) {
            onProgressUpdate(newTime);
          }
          
          // Check if completed
          if (newTime >= duration) {
            setIsPlaying(false);
            if (onComplete) {
              onComplete();
            }
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
  }, [isPlaying, duration, onProgressUpdate, onComplete]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const toggle = () => setIsPlaying(!isPlaying);
  const reset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const seek = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, duration)));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return {
    isPlaying,
    currentTime,
    duration,
    progressPercentage,
    play,
    pause,
    toggle,
    reset,
    seek,
    formatTime,
  };
}
