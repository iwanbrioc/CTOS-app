import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { Milestone, UserMilestone, UserProgress } from "@shared/schema";

interface ZenProgressRingsProps {
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
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ 
            duration: 1.5, 
            ease: "easeInOut",
            delay: 0.2 
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function ZenProgressRings({ userId }: ZenProgressRingsProps) {
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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-28 h-28 bg-gray-100 rounded-full animate-pulse"></div>
            ))}
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

  const rings = [
    {
      title: "Journey",
      subtitle: `${completedSessions}/${totalSessions} sessions`,
      progress: sessionsProgress,
      color: "#3b82f6", // Blue
      size: 140,
      strokeWidth: 10
    },
    {
      title: "Focus",
      subtitle: `${Math.round(totalPracticeTime / 60)}min practiced`,
      progress: timeProgress,
      color: "#10b981", // Green
      size: 120,
      strokeWidth: 8
    },
    {
      title: "Flow",
      subtitle: "Weekly momentum",
      progress: weeklyGoalProgress,
      color: "#8b5cf6", // Purple
      size: 100,
      strokeWidth: 6
    }
  ];

  return (
    <div className="py-8 bg-gradient-to-b from-background to-muted/20">
      <div className="text-center mb-8">
        <h2 className="text-xl font-light text-foreground mb-2">Your Practice</h2>
        <p className="text-sm text-muted-foreground font-light">Mindful progress through presence</p>
      </div>

      {/* Main Progress Rings */}
      <div className="flex justify-center items-center space-x-8 mb-8">
        {rings.map((ring, index) => (
          <motion.div
            key={ring.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="text-center"
          >
            <ProgressRing
              progress={ring.progress}
              size={ring.size}
              strokeWidth={ring.strokeWidth}
              color={ring.color}
              backgroundColor="#f1f5f9"
            >
              <div className="text-center">
                <div className="text-lg font-light text-foreground">
                  {Math.round(ring.progress)}%
                </div>
              </div>
            </ProgressRing>
            <div className="mt-3">
              <h3 className="text-sm font-medium text-foreground">{ring.title}</h3>
              <p className="text-xs text-muted-foreground font-light mt-1">{ring.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overall Achievement Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center"
      >
        <div className="text-center">
          <ProgressRing
            progress={overallProgress}
            size={180}
            strokeWidth={12}
            color="#f59e0b"
            backgroundColor="#fef3c7"
          >
            <div className="text-center">
              <div className="text-2xl font-light text-foreground mb-1">
                {Math.round(overallProgress)}%
              </div>
              <div className="text-xs text-muted-foreground font-light">
                Complete
              </div>
            </div>
          </ProgressRing>
          <div className="mt-4">
            <h3 className="text-base font-medium text-foreground">Overall Progress</h3>
            <p className="text-sm text-muted-foreground font-light mt-1">
              {achievedMilestones.length} of {milestones.length} milestones achieved
            </p>
          </div>
        </div>
      </motion.div>

      {/* Zen Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center mt-8 px-6"
      >
        <p className="text-sm text-muted-foreground italic font-light max-w-md mx-auto">
          "The present moment is the only moment available to us, and it is the door to all moments."
        </p>
        <p className="text-xs text-muted-foreground/70 mt-2">— Thích Nhất Hạnh</p>
      </motion.div>

      {/* Achievement Badges */}
      {achievedMilestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-8 px-6"
        >
          <h3 className="text-center text-sm font-medium text-foreground mb-4">Recent Achievements</h3>
          <div className="flex justify-center flex-wrap gap-2 max-w-md mx-auto">
            {achievedMilestones.slice(-3).map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 + index * 0.1 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 px-3 py-1.5 rounded-full"
              >
                <span className="text-xs font-medium text-yellow-800">{milestone.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}