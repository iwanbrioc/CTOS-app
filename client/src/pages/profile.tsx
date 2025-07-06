import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "@/components/status-bar";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ZenProgressRings } from "@/components/zen-progress-rings";
import { NotificationSettings } from "@/components/notification-settings";
import { NotificationTest } from "@/components/notification-test";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Calendar, Award, Bell, Settings } from "lucide-react";
import { Link } from "wouter";
import type { User as UserType, UserProgress, UserHackCompletion } from "@shared/schema";

const DEMO_USER_ID = 1;

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
                  {user?.username || "Mindful Practitioner"}
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Progress
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
            <ZenProgressRings userId={DEMO_USER_ID} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
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
