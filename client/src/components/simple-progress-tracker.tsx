import { } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Trophy, Target, Zap } from "lucide-react";

interface SimpleProgressTrackerProps {
  userId: number;
}

const DEMO_USER_ID = 1;

export function SimpleProgressTracker({ userId }: SimpleProgressTrackerProps) {
  // Fetch basic progress data
  const { data: userProgress, isLoading } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "progress"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${DEMO_USER_ID}/progress`);
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!userProgress || userProgress.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Start practicing to see your progress analytics</p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const completedSessions = userProgress.filter((p: any) => p.completed).length;
  const totalListenTime = userProgress.reduce((sum: number, p: any) => sum + (p.totalListenTime || 0), 0);
  const averageCompletion = userProgress.length > 0 
    ? Math.round(userProgress.reduce((sum: number, p: any) => sum + (p.completionPercentage || 0), 0) / userProgress.length)
    : 0;
  const maxStreak = Math.max(...userProgress.map((p: any) => p.streakDays || 0));

  return (
    <div className="p-4 space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Practice Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalListenTime)}</div>
            <p className="text-xs text-muted-foreground">
              Across all sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions}</div>
            <p className="text-xs text-muted-foreground">
              of {userProgress.length} started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maxStreak}</div>
            <p className="text-xs text-muted-foreground">
              consecutive days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCompletion}%</div>
            <p className="text-xs text-muted-foreground">
              session completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Session Details */}
      <Card>
        <CardHeader>
          <CardTitle>Session Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userProgress.map((progress: any) => (
              <div key={progress.id} className="border rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Session {progress.sessionId}</h4>
                  <Badge variant={progress.completed ? "default" : "outline"}>
                    {progress.completed ? "Completed" : "In Progress"}
                  </Badge>
                </div>
                <Progress value={progress.completionPercentage || 0} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Listen Time: {formatTime(progress.totalListenTime || 0)}</span>
                  <span>{progress.completionPercentage || 0}% Complete</span>
                </div>
                {progress.playCount && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Played {progress.playCount} times
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}