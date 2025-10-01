import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Clock, CheckCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session, UserProgress } from "@shared/schema";
import sevenStationsSpineImg from "@assets/seven stations of the spine_1750084108018.png";
import journalingFlowImg from "@assets/journaling for flow_1750084108018.png";
import mindBodyMovementImg from "@assets/mind in body, body in movement, movement in mind_1750084108019.png";
import droppingBalloonImg from "@assets/dropping the balloon_1750084108019.png";
import greatSmileImg from "@assets/great smile practice_1750084108019.png";
import fiveElementsImg from "@assets/five elements_1750084108020.png";
import theSenseBeingAliveImg from "@assets/the sense of being alive_1750084108017.png";
import whatIfAllThereIsImg from "@assets/what-if-all-there-is-new.png";
import turningTowardsDiscomfortImg from "@assets/turning towards discomfort_1750084108017.png";
import fourPillarsImg from "@assets/the four pillars_1750084108018.png";

interface SessionCardProps {
  session: Session;
  sessionState: 'past' | 'active' | 'future'; // Visual state for styling
  onStartPractice?: (session: Session) => void;
  onFutureSessionClick?: () => void; // Handler for future session clicks
  userProgress?: UserProgress;
}

const getSessionImage = (illustration: string) => {
  switch (illustration) {
    case "dropping-balloon":
      return droppingBalloonImg;
    case "seven-stations-spine":
      return sevenStationsSpineImg;
    case "the-sense-being-alive":
      return theSenseBeingAliveImg;
    case "mind-body-movement":
      return mindBodyMovementImg;
    case "what-if-all-there-is":
      return whatIfAllThereIsImg;
    case "turning-towards-discomfort":
      return turningTowardsDiscomfortImg;
    case "four-pillars":
      return fourPillarsImg;
    case "great-smile":
      return greatSmileImg;
    case "five-elements":
      return fiveElementsImg;
    case "journaling-flow":
      return journalingFlowImg;
    default:
      return droppingBalloonImg;
  }
};

const getSessionIcon = (week: number, completed: boolean) => {
  if (completed) {
    return <CheckCircle className="h-5 w-5 text-white" />;
  }
  
  if (week <= 3) {
    return <Play className="h-5 w-5 text-white" />;
  }
  
  return <Lock className="h-5 w-5 text-white/70" />;
};

const getSessionColor = (week: number) => {
  const colors = [
    "bg-[hsl(45,100%,60%)]", // Yellow
    "bg-[hsl(218,100%,60%)]", // Blue
    "bg-[hsl(270,60%,70%)]", // Purple
    "bg-[hsl(350,89%,60%)]", // Red
    "bg-[hsl(142,76%,55%)]", // Green
    "bg-[hsl(35,100%,60%)]", // Orange
    "bg-[hsl(165,45%,70%)]", // Mint
    "bg-[hsl(280,70%,65%)]", // Purple variant
  ];
  return colors[(week - 1) % colors.length];
};

const getDuotoneFilter = (week: number) => {
  const filters = [
    "duotone-yellow", // Yellow
    "duotone-blue", // Blue
    "duotone-purple", // Purple
    "duotone-red", // Red
    "duotone-green", // Green
    "duotone-orange", // Orange
    "duotone-mint", // Mint
    "duotone-purple-variant", // Purple variant
  ];
  return filters[(week - 1) % filters.length];
};

export function SessionCard({ session, sessionState, onStartPractice, onFutureSessionClick, userProgress }: SessionCardProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const isCompleted = userProgress?.completed || false;
  const isLocked = session.isLocked && session.week > 3;
  const canPlay = !isLocked && sessionState !== 'future';
  
  useEffect(() => {
    if (!showPlayer) return;
    
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
  }, [showPlayer]);
  
  const handleSessionClick = () => {
    if (sessionState === 'future' && onFutureSessionClick) {
      onFutureSessionClick();
    }
  };
  
  const handleStartPractice = () => {
    if (canPlay) {
      setShowPlayer(true);
      if (onStartPractice) {
        onStartPractice(session);
      }
      // Load the audio when player opens
      setTimeout(() => {
        const audio = audioRef.current;
        if (audio) {
          audio.load();
        }
      }, 100);
    }
  };
  
  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Ensure audio is loaded before playing
        if (audio.readyState < 2) {
          await new Promise((resolve) => {
            audio.addEventListener('loadeddata', resolve, { once: true });
            audio.load();
          });
        }
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
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:shadow-lg rounded-2xl relative",
      sessionState === 'active' && "ring-4 ring-gray-900 ring-offset-4 ring-offset-gray-50 border-2 border-gray-900 shadow-2xl scale-[1.02]",
      sessionState !== 'active' && "border-0",
      (sessionState === 'past' || sessionState === 'future') && "opacity-50",
      isLocked && "opacity-60"
    )}>
      <CardContent className="p-0 text-black relative">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${getSessionImage(session.illustration)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.6,
          }}
        />
        {/* Color Overlay Layer */}
        <div 
          className={cn(
            "absolute inset-0 z-[1]",
            getSessionColor(session.week)
          )}
          style={{ opacity: 0.75 }}
        />
        
        <div className="relative z-10" onClick={sessionState === 'future' ? handleSessionClick : undefined} style={sessionState === 'future' ? { cursor: 'pointer' } : undefined}>
          {/* Content Section */}
          <div className="p-4">
            <div className="mb-3">
              <div className="flex-1">
                <h3 className={cn(
                  "font-bold text-base mb-1 tracking-tight",
                  isLocked ? "text-black/70" : "text-black"
                )}>
                  {session.title}
                </h3>
                <p className="text-sm text-black/90 mb-2">
                  {session.description}
                </p>
                
                {/* Handy Hack & Journaling Dashboard Info */}
                {session.handyHack && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-xs font-semibold text-black/90 whitespace-nowrap">Handy Hack:</span>
                      <span className="text-xs text-black/80">{session.handyHack}</span>
                    </div>
                    {session.journaling && (
                      <div className="flex items-start space-x-2">
                        <span className="text-xs font-semibold text-black/90 whitespace-nowrap">Journaling:</span>
                        <span className="text-xs text-black/80">{session.journaling}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-black/80">
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{session.duration} min</span>
                </span>
                <span className="text-xs font-medium">
                  Week {session.week}
                </span>
                {isCompleted && (
                  <span className="text-xs text-black/90 font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed
                  </span>
                )}
              </div>
              
              {canPlay && !showPlayer && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-black hover:bg-black/10 border border-black/20 font-medium"
                  onClick={handleStartPractice}
                  data-testid="start-session-btn"
                >
                  <Play className="h-4 w-4 mr-1" />
                  {isCompleted ? "Replay" : "Start"}
                </Button>
              )}
              
              {sessionState === 'future' && (
                <div className="text-xs text-black/70 font-medium">
                  Not yet available
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Inline Audio Player */}
        {showPlayer && (
          <div className="relative z-10 border-t border-black/10 bg-white/20 backdrop-blur-sm p-4">
            <audio
              ref={audioRef}
              src={session.audioUrl}
              preload="metadata"
              crossOrigin="anonymous"
            />
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={handlePlayPause}
                size="lg"
                className={cn(
                  "flex-shrink-0",
                  isPlaying 
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg" 
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                )}
                data-testid="audio-play-pause-btn"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </Button>
              
              <div className="flex-1 min-w-0">
                <div className="text-xs text-black/90 mb-1 font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
                <div className="w-full bg-black/20 rounded-full h-2">
                  <div 
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
