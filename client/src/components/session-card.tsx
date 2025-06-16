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
// import whatIfAllThereIsImg from "@assets/what if all there is is this?_1750089457051.png";
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
      return theSenseBeingAliveImg; // Using fallback until file import is resolved
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
    return <CheckCircle className="h-5 w-5 text-success" />;
  }
  
  if (week <= 3) {
    return <Play className="h-5 w-5 text-primary" />;
  }
  
  return <Lock className="h-5 w-5 text-muted-foreground" />;
};

export function SessionCard({ session, isCurrentSession, onStartPractice, userProgress }: SessionCardProps) {
  const isCompleted = userProgress?.completed || false;
  const isLocked = session.isLocked && session.week > 3;
  const canPlay = !isLocked;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 card-elegant hover:shadow-lg",
      isCurrentSession && "ring-2 ring-primary ring-opacity-30",
      isLocked && "opacity-60"
    )}>
      <div className="flex">
        <div className="w-20 h-20 flex-shrink-0 session-illustration flex items-center justify-center">
          <img 
            src={getSessionImage(session.illustration)}
            alt={`${session.title} illustration`}
            className="w-full h-full object-cover"
          />
        </div>
        
        <CardContent className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className={cn(
                "font-bold text-sm mb-1 tracking-tight",
                isLocked ? "text-muted-foreground" : "text-foreground"
              )}>
                Week {session.week}: {session.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2 subtitle">
                {session.description}
              </p>
            </div>
            <div className="ml-2">
              {getSessionIcon(session.week, isCompleted)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{session.duration} min</span>
              </span>
              {isCompleted && (
                <Badge variant="secondary" className="text-xs">
                  Completed
                </Badge>
              )}
              {isCurrentSession && !isCompleted && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  In Progress
                </Badge>
              )}
              {isLocked && (
                <Badge variant="outline" className="text-xs">
                  Unlocks Soon
                </Badge>
              )}
            </div>
            
            {canPlay && (
              <Button
                size="sm"
                variant={isCurrentSession ? "default" : "outline"}
                className="text-xs btn-primary font-medium"
                onClick={() => onStartPractice(session)}
              >
                <Play className="h-3 w-3 mr-1" />
                {isCompleted ? "Replay" : "Start"}
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
