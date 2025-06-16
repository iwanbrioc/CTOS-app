import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "@/components/status-bar";
import { ProgressIndicator } from "@/components/progress-indicator";
import { SessionCard } from "@/components/session-card";
import { HandyHacks } from "@/components/handy-hacks";
import { AudioPlayer } from "@/components/audio-player";
import { BottomNavigation } from "@/components/bottom-navigation";
import { NotificationBanner } from "@/components/notification-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, User } from "lucide-react";
import { useState } from "react";
import type { Session, UserProgress } from "@shared/schema";

// Mock user ID for demo - in production this would come from auth
const DEMO_USER_ID = 1;

export default function Home() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentAudioSession, setCurrentAudioSession] = useState<Session | null>(null);

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/users", DEMO_USER_ID, "progress"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID],
  });

  const completedSessions = userProgress.filter(p => p.completed).length;
  const totalSessions = sessions.length;
  const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  const currentWeek = user?.currentWeek || 1;
  const currentSession = sessions.find(s => s.week === currentWeek);

  const handleStartPractice = (session: Session) => {
    setCurrentAudioSession(session);
  };

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <StatusBar />
      
      {/* App Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-primary">Coming to Our Senses</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Week {currentWeek} of {totalSessions}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="relative rounded-full"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full p-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </Button>
          </div>
        </div>
      </header>

      <ProgressIndicator 
        completedSessions={completedSessions}
        totalSessions={totalSessions}
        progressPercentage={progressPercentage}
      />

      {/* Main Content */}
      <main className="px-6 py-6 pb-24 space-y-6">
        
        {/* Today's Practice */}
        {currentSession && (
          <section>
            <h2 className="text-lg font-semibold text-primary mb-4">Today's Practice</h2>
            <SessionCard
              session={currentSession}
              isCurrentSession={true}
              onStartPractice={handleStartPractice}
              userProgress={userProgress.find(p => p.sessionId === currentSession.id)}
            />
          </section>
        )}

        {/* 8-Week Journey */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-4">8-Week Journey</h2>
          <div className="space-y-4">
            {sessions.map((session) => {
              const progress = userProgress.find(p => p.sessionId === session.id);
              return (
                <SessionCard
                  key={session.id}
                  session={session}
                  isCurrentSession={session.week === currentWeek}
                  onStartPractice={handleStartPractice}
                  userProgress={progress}
                />
              );
            })}
          </div>
        </section>

        <HandyHacks userId={DEMO_USER_ID} />

        {/* Flow Journal Preview */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-4">Flow Journal</h2>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-primary">Today's Reflection</h3>
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Capture your mindful moments and insights from today's practice.
              </p>
              <Button variant="outline" className="w-full">
                Open Journal
              </Button>
            </CardContent>
          </Card>
        </section>

      </main>

      {currentAudioSession && (
        <AudioPlayer
          session={currentAudioSession}
          onClose={() => setCurrentAudioSession(null)}
        />
      )}

      <NotificationBanner 
        show={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <BottomNavigation />
    </>
  );
}
