import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, CheckCircle, Lock } from "lucide-react";
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
  isCurrentSession: boolean;
  onStartPractice: (session: Session) => void;
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

export function SessionCard({ session, isCurrentSession, onStartPractice, userProgress }: SessionCardProps) {
  const isCompleted = userProgress?.completed || false;
  const isLocked = session.isLocked && session.week > 3;
  const canPlay = !isLocked;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:shadow-lg border-0 rounded-2xl",
      getSessionColor(session.week),
      isCurrentSession && "ring-2 ring-white ring-opacity-50",
      isLocked && "opacity-60"
    )}>
      <CardContent className="p-0 text-white">
        <div className="flex">
          {/* Image Section */}
          <div className="w-20 h-20 flex-shrink-0 relative overflow-hidden">
            <img 
              src={getSessionImage(session.illustration)}
              alt={`${session.title} illustration`}
              className={cn(
                "w-full h-full object-cover",
                getDuotoneFilter(session.week)
              )}
            />
          </div>
          
          {/* Content Section */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className={cn(
                  "font-bold text-base mb-1 tracking-tight",
                  isLocked ? "text-white/70" : "text-white"
                )}>
                  {session.title}
                </h3>
                <p className="text-sm text-white/80 mb-2 line-clamp-2">
                  {session.description}
                </p>
              </div>
              <div className="ml-3 flex-shrink-0">
                {getSessionIcon(session.week, isCompleted)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-white/80">
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{session.duration} min</span>
                </span>
                <span className="text-xs font-medium">
                  Week {session.week}
                </span>
              </div>
              
              {canPlay && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 border border-white/30 font-medium"
                  onClick={() => onStartPractice(session)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  {isCompleted ? "Replay" : "Start"}
                </Button>
              )}
            </div>
            
            {isCompleted && (
              <div className="mt-3 text-center">
                <span className="text-xs text-white/90 font-medium">✓ Completed</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
