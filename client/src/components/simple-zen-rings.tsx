import { useQuery } from "@tanstack/react-query";
import type { Milestone, UserMilestone, UserProgress } from "@shared/schema";

interface SimpleZenRingsProps {
  userId: number;
}

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  color = "#10b981", 
  backgroundColor = "#f3f4f6",
  children 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{ 
            transition: 'stroke-dashoffset 1.5s ease-in-out'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function SimpleZenRings({ userId }: SimpleZenRingsProps) {
  const { data: milestones = [], isLoading: milestonesLoading } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
  });

  const { data: userMilestones = [], isLoading: userMilestonesLoading } = useQuery<UserMilestone[]>({
    queryKey: ["/api/users", userId, "milestones"],
  });

  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/users", userId, "progress"],
  });

  if (milestonesLoading || userMilestonesLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="space-y-6">
          <div className="flex justify-center space-x-8">
            <div className="w-28 h-28 bg-gray-100 rounded-full animate-pulse"></div>
            <div className="w-24 h-24 bg-gray-100 rounded-full animate-pulse"></div>
            <div className="w-20 h-20 bg-gray-100 rounded-full animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-100 rounded w-48 mx-auto animate-pulse"></div>
        </div>
      </div>
    );
  }

  const achievedMilestones = userMilestones.map(um => 
    milestones.find(m => m.id === um.milestoneId)
  ).filter(Boolean) as Milestone[];

  // Calculate different types of progress
  const completedSessions = userProgress.filter(p => p.completed).length;
  const totalSessions = 8; // 8-week course
  const sessionsProgress = Math.min((completedSessions / totalSessions) * 100, 100);

  const totalPracticeTime = userProgress.reduce((acc, p) => acc + (p.timeSpent || 0), 0);
  const timeProgress = Math.min((totalPracticeTime / (30 * 60)) * 100, 100); // 30 minutes target

  const weeklyGoalProgress = Math.min((completedSessions / 5) * 100, 100); // 5 sessions per week goal

  const overallProgress = achievedMilestones.length > 0 ? 
    (achievedMilestones.length / milestones.length) * 100 : 
    sessionsProgress;

  return (
    <div className="py-8 bg-gradient-to-b from-background to-muted/20">
      <div className="text-center mb-8">
        <h2 className="text-xl font-light text-foreground mb-2">Your Practice</h2>
        <p className="text-sm text-muted-foreground font-light">Mindful progress through presence</p>
      </div>

      {/* Three Progress Rings */}
      <div className="flex justify-center items-center space-x-6 mb-8">
        <div className="text-center">
          <ProgressRing
            progress={sessionsProgress}
            size={100}
            strokeWidth={6}
            color="#3b82f6"
            backgroundColor="#f1f5f9"
          >
            <div className="text-center">
              <div className="text-sm font-light text-foreground">
                {Math.round(sessionsProgress)}%
              </div>
            </div>
          </ProgressRing>
          <div className="mt-2">
            <h3 className="text-xs font-medium text-foreground">Journey</h3>
            <p className="text-xs text-muted-foreground font-light">{completedSessions}/{totalSessions} sessions</p>
          </div>
        </div>

        <div className="text-center">
          <ProgressRing
            progress={timeProgress}
            size={80}
            strokeWidth={5}
            color="#10b981"
            backgroundColor="#f1f5f9"
          >
            <div className="text-center">
              <div className="text-sm font-light text-foreground">
                {Math.round(timeProgress)}%
              </div>
            </div>
          </ProgressRing>
          <div className="mt-2">
            <h3 className="text-xs font-medium text-foreground">Focus</h3>
            <p className="text-xs text-muted-foreground font-light">{Math.round(totalPracticeTime / 60)}min</p>
          </div>
        </div>

        <div className="text-center">
          <ProgressRing
            progress={weeklyGoalProgress}
            size={60}
            strokeWidth={4}
            color="#8b5cf6"
            backgroundColor="#f1f5f9"
          >
            <div className="text-center">
              <div className="text-xs font-light text-foreground">
                {Math.round(weeklyGoalProgress)}%
              </div>
            </div>
          </ProgressRing>
          <div className="mt-2">
            <h3 className="text-xs font-medium text-foreground">Flow</h3>
            <p className="text-xs text-muted-foreground font-light">Weekly</p>
          </div>
        </div>
      </div>

      {/* Overall Achievement Ring */}
      <div className="flex justify-center">
        <div className="text-center">
          <ProgressRing
            progress={overallProgress}
            size={140}
            strokeWidth={8}
            color="#f59e0b"
            backgroundColor="#fef3c7"
          >
            <div className="text-center">
              <div className="text-lg font-light text-foreground mb-1">
                {Math.round(overallProgress)}%
              </div>
              <div className="text-xs text-muted-foreground font-light">
                Complete
              </div>
            </div>
          </ProgressRing>
          <div className="mt-3">
            <h3 className="text-sm font-medium text-foreground">Overall Progress</h3>
            <p className="text-xs text-muted-foreground font-light mt-1">
              {achievedMilestones.length} of {milestones.length} milestones achieved
            </p>
          </div>
        </div>
      </div>

      {/* Zen Quote */}
      <div className="text-center mt-6 px-6">
        <p className="text-sm text-muted-foreground italic font-light max-w-md mx-auto">
          "The present moment is the only moment available to us"
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">— Thích Nhất Hạnh</p>
      </div>

      {/* Achievement Badges */}
      {achievedMilestones.length > 0 && (
        <div className="mt-6 px-6">
          <h3 className="text-center text-sm font-medium text-foreground mb-3">Recent Achievements</h3>
          <div className="flex justify-center flex-wrap gap-2 max-w-md mx-auto">
            {achievedMilestones.slice(-3).map((milestone) => (
              <div
                key={milestone.id}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 px-3 py-1.5 rounded-full"
              >
                <span className="text-xs font-medium text-yellow-800">{milestone.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}