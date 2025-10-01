import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, X } from "lucide-react";
import type { Session } from "@shared/schema";

interface TestSimplePlayerProps {
  session: Session;
  onClose: () => void;
}

export function TestSimplePlayer({ session, onClose }: TestSimplePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="fixed bottom-20 left-0 right-0 z-50 mx-4 bg-white shadow-2xl border-2 border-gray-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold truncate">{session.title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-player-btn">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <audio
          ref={audioRef}
          src={session.audioUrl}
          preload="metadata"
          crossOrigin="anonymous"
        />
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePlayPause}
              size="lg"
              className={
                isPlaying 
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg" 
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              }
              data-testid="audio-play-pause-btn"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>
            
            <div className="flex-1">
              <div className="text-sm text-gray-500">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}