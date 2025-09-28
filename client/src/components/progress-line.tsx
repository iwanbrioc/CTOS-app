import { cn } from "@/lib/utils";
import type { Session, UserProgress } from "@shared/schema";

interface ProgressLineProps {
  sessions: Session[];
  userProgress: UserProgress[];
  sessionsPace: number; // 1 or 2 sessions per week
}

export function ProgressLine({ sessions, userProgress, sessionsPace }: ProgressLineProps) {
  const completedSessions = userProgress.filter(p => p.completed);
  const totalCompletedCount = completedSessions.length;
  
  // Calculate progress based on sessions per week pace
  const sessionsPerWeek = sessionsPace;
  const totalSessionsInCurrentPace = sessions.length;
  
  // Calculate how many sessions should be completed for current progress
  const progressPercentage = totalSessionsInCurrentPace > 0 
    ? (totalCompletedCount / totalSessionsInCurrentPace) * 100 
    : 0;
  
  return (
    <div className="relative mx-4 mb-4">
      {/* Progress line container */}
      <div className="absolute left-0 top-0 w-1 bg-gray-200 rounded-full" style={{ height: '100%' }}>
        {/* Animated progress line */}
        <div 
          className="w-full bg-gradient-to-b from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
          style={{ 
            height: `${Math.min(progressPercentage, 100)}%`,
          }}
        />
        
        {/* Progress indicator dot */}
        <div 
          className="absolute -right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-lg transition-all duration-1000 ease-out"
          style={{ 
            top: `${Math.min(progressPercentage, 100)}%`,
            transform: 'translateY(-50%)'
          }}
        >
          {/* Pulse effect when progress updates */}
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
        </div>
      </div>
      
      {/* Progress info */}
      <div className="ml-8 bg-white rounded-lg p-3 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-green-600">
            {totalCompletedCount}/{totalSessionsInCurrentPace} sessions
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Pace: {sessionsPace === 1 ? '1 session/week' : '2 sessions/week'}</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
      </div>
    </div>
  );
}