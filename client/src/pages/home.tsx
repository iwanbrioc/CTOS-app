import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { StatusBar } from "@/components/status-bar";
import { ProgressIndicator } from "@/components/progress-indicator";
import { BottomNavigation } from "@/components/bottom-navigation";
import { SessionCard } from "@/components/session-card";
import { MilestoneManager } from "@/components/milestone-achievement";
import { NotificationBanner } from "@/components/notification-banner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TestSimplePlayer } from "@/components/test-simple-player";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Session, UserProgress } from "@shared/schema";


export default function Home() {
  const { user: authUser, isLoading: userLoading } = useAuth();
  
  // Fallback to demo user only if auth user is not available
  const user: User = authUser as User || { 
    id: "1", 
    firstName: "Demo", 
    currentWeek: 1, 
    sessionsPace: 1, 
    courseFormat: "8-week",
    email: "demo@example.com", 
    lastName: "User", 
    profileImageUrl: null, 
    joinedAt: new Date(), 
    updatedAt: new Date(), 
    notificationsEnabled: true, 
    reminderTime: "09:00", 
    reminderDays: [1,2,3,4,5], 
    timezone: "UTC" 
  };
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [audioPlayerType, setAudioPlayerType] = useState<'html5' | null>(null);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/users", user?.id, "progress"],
    enabled: !!user?.id,
  });

  const allSessions = sessions; // Show all sessions instead of filtering by week
  const completedSessions = userProgress.filter(p => p.completed).length;
  const totalSessions = sessions.length; // Total number of sessions
  const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  const handleStartPractice = (session: Session) => {
    setSelectedSession(session);
    // Always use the simple HTML5 audio player for all sessions
    setAudioPlayerType('html5');
  };

  const handleClosePlayer = () => {
    setSelectedSession(null);
    setAudioPlayerType(null);
  };

  const getUserProgressForSession = (sessionId: number) => {
    return userProgress.find(p => p.sessionId === sessionId);
  };
  
  const getSessionState = (session: Session): 'past' | 'active' | 'future' => {
    const currentWeek = user?.currentWeek || 1;
    const sessionsPace = user?.sessionsPace || 1;
    const courseFormat = user?.courseFormat || "8-week";
    
    // Adjust pace based on course format
    // For 4-week condensed course, double the effective pace
    const effectivePace = courseFormat === "4-week" ? sessionsPace * 2 : sessionsPace;
    
    // Calculate how many sessions should be unlocked based on current week and effective pace
    const availableSessions = currentWeek * effectivePace;
    const sessionIndex = sessions.findIndex(s => s.id === session.id);
    
    if (sessionIndex < availableSessions - effectivePace) {
      return 'past';
    } else if (sessionIndex < availableSessions) {
      return 'active';
    } else {
      return 'future';
    }
  };
  
  const handleFutureSessionClick = () => {
    toast({
      title: "Not yet",
      description: "This session will be available in a future week.",
      duration: 2000,
    });
  };
  
  // Session pace mutation
  const updateSessionsPaceMutation = useMutation({
    mutationFn: async (newPace: number) => {
      return apiRequest("PUT", `/api/users/${user.id}/sessions-pace`, { sessionsPace: newPace });
    },
    onSuccess: async (data, newPace) => {
      // Invalidate and refetch the user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Settings updated",
        description: `Session pace set to ${newPace === 1 ? '1 session' : '2 sessions'} per week.`,
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update session pace.",
        variant: "destructive",
        duration: 2000,
      });
    }
  });

  // Course format mutation
  const updateCourseFormatMutation = useMutation({
    mutationFn: async (newFormat: string) => {
      return apiRequest("PUT", `/api/users/${user.id}/course-format`, { courseFormat: newFormat });
    },
    onSuccess: async (data, newFormat) => {
      // Invalidate and refetch the user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Settings updated",
        description: `Course format set to ${newFormat} course.`,
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update course format.",
        variant: "destructive",
        duration: 2000,
      });
    }
  });

  if (sessionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your mindfulness journey...</p>
        </div>
      </div>
    );
  }

  return (
    <MilestoneManager userId={user?.id}>
      <div className="min-h-screen bg-gray-50">
        <StatusBar />
        
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/attached_assets/CTOS Emblem_1751662222205.png" 
                alt="CTOS" 
                className="w-8 h-8"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Coming to Our Senses
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {user?.firstName || 'Practitioner'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-blue-50 border-b px-4 py-4 space-y-4">
            {/* Course Format Setting */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Course Format</h3>
                <p className="text-xs text-gray-500">Choose course delivery schedule</p>
              </div>
              <Select 
                value={user.courseFormat || "8-week"} 
                onValueChange={(value) => updateCourseFormatMutation.mutate(value)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8-week">8-week course</SelectItem>
                  <SelectItem value="4-week">4-week condensed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="px-4 py-4">
          <ProgressIndicator 
            completedSessions={completedSessions}
            totalSessions={totalSessions}
            progressPercentage={progressPercentage}
          />
        </div>

        {/* All Sessions */}
        <div className="px-4 space-y-4 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              All Sessions
            </h2>
          </div>
          
          {allSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              sessionState={getSessionState(session)}
              onStartPractice={handleStartPractice}
              onFutureSessionClick={handleFutureSessionClick}
              userProgress={getUserProgressForSession(session.id)}
            />
          ))}
        </div>

        {/* Audio Player */}
        {selectedSession && audioPlayerType === 'html5' && (
          <TestSimplePlayer session={selectedSession} onClose={handleClosePlayer} />
        )}

        {/* Notification Banner */}
        <NotificationBanner 
          show={showNotificationBanner}
          onClose={() => setShowNotificationBanner(false)}
        />

        <BottomNavigation />
      </div>
    </MilestoneManager>
  );
}