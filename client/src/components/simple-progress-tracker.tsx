import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Trophy, Target, Zap, Frown, Meh, Smile, TrendingUp } from "lucide-react";

interface SimpleProgressTrackerProps {
  userId: string;
}

const DEMO_USER_ID = "1";

// Map 1-5 mood value to an icon component + label
function MoodIcon({ value, size = "w-6 h-6" }: { value: number; size?: string }) {
  if (value <= 2) return <Frown className={`${size} text-blue-400`} strokeWidth={1.5} />;
  if (value === 3) return <Meh className={`${size} text-gray-400`} strokeWidth={1.5} />;
  return <Smile className={`${size} text-emerald-400`} strokeWidth={1.5} />;
}

function moodLabel(value: number): string {
  const labels = ["", "Very Low", "Low", "Neutral", "Good", "Great"];
  return labels[Math.round(value)] ?? "—";
}

function MoodBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} className="h-2 flex-1" />
      <span className="text-xs text-muted-foreground w-8 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

export function SimpleProgressTracker({ userId }: SimpleProgressTrackerProps) {
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

  // Mood analytics — only sessions with both pre and post mood
  const moodPairs = userProgress.filter((p: any) => p.preMood != null && p.postMood != null);
  const avgPreMood = moodPairs.length > 0
    ? moodPairs.reduce((sum: number, p: any) => sum + p.preMood, 0) / moodPairs.length
    : null;
  const avgPostMood = moodPairs.length > 0
    ? moodPairs.reduce((sum: number, p: any) => sum + p.postMood, 0) / moodPairs.length
    : null;
  const moodShift = avgPreMood != null && avgPostMood != null ? avgPostMood - avgPreMood : null;

  return (
    <div className="p-4 space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalListenTime)}</div>
            <p className="text-xs text-muted-foreground">Across all sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions}</div>
            <p className="text-xs text-muted-foreground">of {userProgress.length} started</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maxStreak}</div>
            <p className="text-xs text-muted-foreground">consecutive days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCompletion}%</div>
            <p className="text-xs text-muted-foreground">session completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Mood Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Mood Shift
          </CardTitle>
        </CardHeader>
        <CardContent>
          {moodPairs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Complete a session with a mood check-in to see your shift
            </p>
          ) : (
            <div className="space-y-5">
              {/* Overall averages */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MoodIcon value={avgPreMood!} size="w-4 h-4" />
                      Before practice
                    </span>
                    <span className="font-medium">{moodLabel(avgPreMood!)}</span>
                  </div>
                  <MoodBar value={avgPreMood!} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MoodIcon value={avgPostMood!} size="w-4 h-4" />
                      After practice
                    </span>
                    <span className="font-medium">{moodLabel(avgPostMood!)}</span>
                  </div>
                  <MoodBar value={avgPostMood!} />
                </div>
              </div>

              {/* Net shift badge */}
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                <span className="text-sm font-medium">Average mood shift</span>
                <Badge
                  variant={moodShift! >= 0 ? "default" : "destructive"}
                  className={moodShift! >= 0 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : ""}
                >
                  {moodShift! >= 0 ? "+" : ""}{moodShift!.toFixed(1)} pts
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Based on {moodPairs.length} session{moodPairs.length !== 1 ? "s" : ""} with mood check-ins
              </p>

              {/* Per-session mood detail */}
              {moodPairs.length > 1 && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Session breakdown</p>
                  {moodPairs.map((p: any) => {
                    const shift = p.postMood - p.preMood;
                    return (
                      <div key={p.id} className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground w-20 shrink-0">Session {p.sessionId}</span>
                        <div className="flex items-center gap-1">
                          <MoodIcon value={p.preMood} size="w-4 h-4" />
                          <span className="text-xs text-muted-foreground">→</span>
                          <MoodIcon value={p.postMood} size="w-4 h-4" />
                        </div>
                        <Badge
                          variant="outline"
                          className={`ml-auto text-xs ${shift > 0 ? "text-emerald-600 border-emerald-200" : shift < 0 ? "text-rose-500 border-rose-200" : "text-gray-500"}`}
                        >
                          {shift > 0 ? "+" : ""}{shift}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
                {progress.playCount > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Played {progress.playCount} times
                  </div>
                )}
                {progress.preMood != null && progress.postMood != null && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <MoodIcon value={progress.preMood} size="w-3.5 h-3.5" />
                    <span>→</span>
                    <MoodIcon value={progress.postMood} size="w-3.5 h-3.5" />
                    <span className={progress.postMood >= progress.preMood ? "text-emerald-600" : "text-rose-500"}>
                      {progress.postMood >= progress.preMood ? "+" : ""}{progress.postMood - progress.preMood} mood
                    </span>
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
