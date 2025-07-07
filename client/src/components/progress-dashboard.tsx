import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Trophy, Target, Zap, TrendingUp, Play, Pause, SkipForward } from "lucide-react";

interface ProgressDashboardProps {
  userId: number;
}

const DEMO_USER_ID = 1;

export function ProgressDashboard({ userId }: ProgressDashboardProps) {
  // Fetch advanced progress data
  const { data: advancedProgress, isLoading } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "progress", "advanced"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${DEMO_USER_ID}/progress/advanced`);
      return response.json();
    },
  });

  // Fetch session analytics
  const { data: analytics } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "analytics"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${DEMO_USER_ID}/analytics`);
      return response.json();
    },
  });

  // Fetch user progress
  const { data: userProgress } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "progress"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${DEMO_USER_ID}/progress`);
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

  if (!advancedProgress) {
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

  const totalSessions = advancedProgress.weeklyProgress.reduce((sum: number, week: any) => sum + week.totalSessions, 0);
  const completedSessions = advancedProgress.weeklyProgress.reduce((sum: number, week: any) => sum + week.completedSessions, 0);
  const overallProgress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const weeklyData = advancedProgress.weeklyProgress.map((week: any) => ({
    week: `Week ${week.week}`,
    completed: week.completedSessions,
    total: week.totalSessions,
    percentage: week.totalSessions > 0 ? Math.round((week.completedSessions / week.totalSessions) * 100) : 0,
  }));

  const practiceTimeData = advancedProgress.practicePattern.map((pattern: any) => ({
    hour: pattern.hour,
    sessions: pattern.sessionCount,
    label: `${pattern.hour}:00`,
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

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
            <div className="text-2xl font-bold">{formatTime(advancedProgress.totalListenTime)}</div>
            <p className="text-xs text-muted-foreground">
              Across all sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedSessions} of {totalSessions} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advancedProgress.streakDays}</div>
            <p className="text-xs text-muted-foreground">
              consecutive days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(advancedProgress.averageSessionCompletion)}%</div>
            <p className="text-xs text-muted-foreground">
              session completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Most Played Session */}
      {advancedProgress.mostPlayedSession && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Most Practiced Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <h3 className="font-medium">{advancedProgress.mostPlayedSession.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Week {advancedProgress.mostPlayedSession.week} • {advancedProgress.mostPlayedSession.duration} min
                </p>
              </div>
              <Badge variant="secondary">
                <Trophy className="h-3 w-3 mr-1" />
                Favorite
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics */}
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">Weekly Progress</TabsTrigger>
          <TabsTrigger value="patterns">Practice Patterns</TabsTrigger>
          <TabsTrigger value="detailed">Session Details</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weeklyData.map((week: any) => (
                  <Card key={week.week} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{week.week}</h4>
                      <Badge variant="outline">{week.percentage}%</Badge>
                    </div>
                    <Progress value={week.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {week.completed} of {week.total} sessions
                    </p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Practice Time Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {practiceTimeData.map((pattern: any) => (
                  <div key={pattern.hour} className="text-center p-3 border rounded">
                    <div className="text-lg font-bold">{pattern.sessions}</div>
                    <div className="text-xs text-muted-foreground">{pattern.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProgress && userProgress.length > 0 ? (
              userProgress.map((progress: any) => (
                <Card key={progress.id}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Session {progress.sessionId}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Progress:</span>
                      <span className="text-sm font-medium">{progress.completionPercentage || 0}%</span>
                    </div>
                    <Progress value={progress.completionPercentage || 0} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Play className="h-3 w-3 mr-1" />
                        {progress.playCount || 0} plays
                      </span>
                      <span className="flex items-center">
                        <Pause className="h-3 w-3 mr-1" />
                        {progress.pauseCount || 0} pauses
                      </span>
                      <span className="flex items-center">
                        <SkipForward className="h-3 w-3 mr-1" />
                        {progress.skipCount || 0} skips
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Listen Time: {formatTime(progress.totalListenTime || 0)}
                    </div>
                    {progress.lastPlayedAt && (
                      <div className="text-xs text-muted-foreground">
                        Last played: {new Date(progress.lastPlayedAt).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                Start practicing to see detailed session analytics
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}