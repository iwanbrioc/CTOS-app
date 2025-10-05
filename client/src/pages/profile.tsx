import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StatusBar } from "@/components/status-bar";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MilestoneTracker } from "@/components/milestone-tracker";
import { NotificationSettings } from "@/components/notification-settings";
import { NotificationTest } from "@/components/notification-test";
import { SimpleProgressTracker } from "@/components/simple-progress-tracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Calendar, Award, Bell, Settings, Calendar as CalendarIcon } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType, UserProgress, UserHackCompletion } from "@shared/schema";

const DEMO_USER_ID = "1";

export default function Profile() {
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/users", DEMO_USER_ID],
  });

  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/users", DEMO_USER_ID, "progress"],
  });

  const { data: hackCompletions = [] } = useQuery<UserHackCompletion[]>({
    queryKey: ["/api/users", DEMO_USER_ID, "hack-completions"],
  });

  const completedSessions = userProgress.filter(p => p.completed).length;
  const totalMinutesPracticed = userProgress.reduce((total, p) => {
    // Estimate based on completion - in real app would track actual time
    return total + (p.completed ? 15 : 0); // Average session length
  }, 0);

  const joinedDaysAgo = user?.joinedAt 
    ? Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const { toast } = useToast();
  const [courseFormat, setCourseFormat] = useState<string>(user?.courseFormat || "8-week");

  const updateCourseFormatMutation = useMutation({
    mutationFn: async (format: string) => {
      await apiRequest("PUT", `/api/users/${DEMO_USER_ID}/course-format`, { courseFormat: format });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID] });
      toast({
        title: "Course Format Updated",
        description: "Your course format has been changed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update course format.",
        variant: "destructive",
      });
    },
  });

  const handleCourseFormatChange = (value: string) => {
    setCourseFormat(value);
    updateCourseFormatMutation.mutate(value);
  };

  return (
    <>
      <StatusBar />
      
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-primary">Profile</h1>
            <p className="text-sm text-muted-foreground">Your mindfulness journey</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 pb-24">
        
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-primary">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Mindful Practitioner"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {user?.email || "user@example.com"}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Joined {joinedDaysAgo} days ago
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Journey
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <SimpleProgressTracker userId={DEMO_USER_ID} />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6 mt-6">
            {/* Progress Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-success" />
                  <span>Your Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{completedSessions}</div>
                    <div className="text-sm text-muted-foreground">Sessions Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{totalMinutesPracticed}</div>
                    <div className="text-sm text-muted-foreground">Minutes Practiced</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">Week {user?.currentWeek || 1}</div>
                  <div className="text-sm text-muted-foreground">Current Progress</div>
                </div>
                
                <div className="flex justify-center space-x-2 mt-4">
                  <Badge variant="secondary">
                    {hackCompletions.length} Handy Hacks Completed
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6 mt-6">
            {/* Milestone Tracker */}
            <MilestoneTracker userId={DEMO_USER_ID} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Course Format Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Course Format
                </CardTitle>
                <CardDescription>
                  Choose between an 8-week or 4-week course format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={courseFormat} onValueChange={handleCourseFormatChange}>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="8-week" id="8-week" />
                    <div className="flex-1">
                      <Label htmlFor="8-week" className="font-semibold cursor-pointer">
                        8-Week Course (Recommended)
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Complete one session per week for a gentle, thorough exploration
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="4-week" id="4-week" />
                    <div className="flex-1">
                      <Label htmlFor="4-week" className="font-semibold cursor-pointer">
                        4-Week Intensive Course
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Complete two sessions per week for a more focused experience
                      </p>
                    </div>
                  </div>
                </RadioGroup>
                {user?.courseFormat && (
                  <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    Current format: <span className="font-semibold">{user.courseFormat}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <NotificationSettings userId={DEMO_USER_ID} />
            
            {/* Notification Test Center */}
            <NotificationTest />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </>
  );
}
