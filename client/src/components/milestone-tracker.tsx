import { useQuery } from "@tanstack/react-query";
import { Trophy, Target, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Milestone, UserMilestone, UserProgress } from "@shared/schema";

interface MilestoneTrackerProps {
  userId: number;
}

export function MilestoneTracker({ userId }: MilestoneTrackerProps) {
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
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const achievedMilestones = userMilestones.map(um => 
    milestones.find(m => m.id === um.milestoneId)
  ).filter(Boolean) as Milestone[];

  const unachievedMilestones = milestones.filter(m => 
    !userMilestones.some(um => um.milestoneId === m.id)
  );

  const getProgressForMilestone = (milestone: Milestone): number => {
    switch (milestone.type) {
      case 'sessions':
        return userProgress.filter(p => p.completed).length;
      case 'time':
        return userProgress.reduce((total, p) => total + (p.totalListenTime || 0), 0);
      case 'streak':
        return userProgress.length > 0 ? Math.max(...userProgress.map(p => p.streakDays || 0)) : 0;
      case 'weekly':
        const completedWeeks = new Set(userProgress.filter(p => p.completed).map(p => {
          // Note: In a real app, we'd fetch session data to get the week
          // For now, we'll estimate based on session ID
          return Math.ceil(p.sessionId / 7);
        }));
        return completedWeeks.size;
      default:
        return 0;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'sessions':
        return <Target className="h-4 w-4" />;
      case 'time':
        return <Clock className="h-4 w-4" />;
      case 'weekly':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const formatTarget = (type: string, target: number): string => {
    switch (type) {
      case 'sessions':
        return `${target} session${target > 1 ? 's' : ''}`;
      case 'time':
        return `${Math.floor(target / 60)} minute${Math.floor(target / 60) > 1 ? 's' : ''}`;
      case 'weekly':
        return `${target} week${target > 1 ? 's' : ''}`;
      default:
        return target.toString();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Journey</h2>
        <p className="text-gray-600 mt-2">
          {achievedMilestones.length} of {milestones.length} milestones achieved
        </p>
      </div>

      {/* Achieved Milestones */}
      {achievedMilestones.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </h3>
          <div className="grid gap-3">
            {achievedMilestones.map((milestone) => (
              <Card key={milestone.id} className="border-l-4 bg-gradient-to-r from-green-50 to-white" 
                    style={{ borderLeftColor: milestone.color }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{milestone.badge}</span>
                      <div>
                        <CardTitle className="text-lg">{milestone.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {milestone.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Achieved
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Unachieved Milestones */}
      {unachievedMilestones.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Next Goals
          </h3>
          <div className="grid gap-3">
            {unachievedMilestones.map((milestone) => {
              const currentProgress = getProgressForMilestone(milestone);
              const progressPercentage = Math.min((currentProgress / milestone.target) * 100, 100);
              
              return (
                <Card key={milestone.id} className="border-l-4" 
                      style={{ borderLeftColor: milestone.color }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl opacity-60">{milestone.badge}</span>
                        <div>
                          <CardTitle className="text-lg">{milestone.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {milestone.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getIcon(milestone.type)}
                        <span className="text-sm text-gray-500">
                          {currentProgress} / {formatTarget(milestone.type, milestone.target)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{Math.round(progressPercentage)}% complete</span>
                        <span>{milestone.target - currentProgress} more to go</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Overall Progress Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-900 mb-2">
              {Math.round((achievedMilestones.length / milestones.length) * 100)}%
            </div>
            <div className="text-purple-700 font-medium">Overall Progress</div>
            <div className="text-sm text-purple-600 mt-1">
              Keep going! You're making great progress on your mindfulness journey.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}