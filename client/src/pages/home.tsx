import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { StatusBar } from "@/components/status-bar";
import { ProgressIndicator } from "@/components/progress-indicator";
import { BottomNavigation } from "@/components/bottom-navigation";
import { SessionCard } from "@/components/session-card";
import { MilestoneManager } from "@/components/milestone-achievement";
import { NotificationBanner } from "@/components/notification-banner";
import { useQuery } from "@tanstack/react-query";
import { TestSimplePlayer } from "@/components/test-simple-player";

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  currentWeek: number;
}

interface Session {
  id: number;
  week: number;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  illustration: string;
  isLocked: boolean;
}

interface UserProgress {
  id: number;
  userId: string;
  sessionId: number;
  completed: boolean;
  completedAt?: string;
  audioProgress: number;
  totalListenTime: number;
  streakDays: number;
}

export default function Home() {
  // Temporarily using demo user for preview
  const user = { id: "1", firstName: "Demo", currentWeek: 1 } as User;
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [audioPlayerType, setAudioPlayerType] = useState<'html5' | null>(null);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/users", user?.id, "progress"],
    enabled: !!user?.id,
  });

  const currentWeekSessions = sessions.filter(session => session.week <= (user?.currentWeek || 1));
  const completedSessions = userProgress.filter(p => p.completed).length;
  const totalSessions = Math.min(sessions.length, (user?.currentWeek || 1) * 1); // Approximate sessions per week
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-4 py-4">
          <ProgressIndicator 
            completedSessions={completedSessions}
            totalSessions={totalSessions}
            progressPercentage={progressPercentage}
          />
        </div>

        {/* Current Week Sessions */}
        <div className="px-4 space-y-4 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Week {user?.currentWeek || 1} Sessions
            </h2>
          </div>
          
          {currentWeekSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isCurrentSession={session.week === (user?.currentWeek || 1)}
              onStartPractice={handleStartPractice}
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