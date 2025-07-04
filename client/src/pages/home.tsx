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
import { Bell, User as UserIcon, Play } from "lucide-react";
import { useState, useEffect } from "react";
import type { Session, UserProgress, User } from "@shared/schema";
import { useNotifications } from "@/hooks/use-notifications";
import ctosEmblemImg from "@assets/CTOS-Emblem_1750088130527.jpg";

// Mock user ID for demo - in production this would come from auth
const DEMO_USER_ID = 1;

export default function Home() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentAudioSession, setCurrentAudioSession] = useState<Session | null>(null);
  const notifications = useNotifications();

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/users", DEMO_USER_ID, "progress"],
  });

  const { data: user } = useQuery<User>({
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
      <header className="px-6 py-4 bg-background border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              <div>Coming to</div>
              <div>Our Senses</div>
            </h1>
            <img 
              src="/attached_assets/CTOS Emblem_1751662222205.png" 
              alt="Coming to Our Senses Emblem"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="relative rounded-full hover:bg-muted p-2"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></span>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full p-2 hover:bg-muted">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
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
        
        {/* Welcome Message */}
        <div className="text-center py-4">
          <h2 className="text-lg font-medium text-muted-foreground mb-2">
            Welcome back.
          </h2>
          <p className="text-sm text-muted-foreground">
            Continue your mindfulness journey.
          </p>
        </div>
        
        {/* Today's Practice */}
        {currentSession && (
          <section>
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
          <div className="grid grid-cols-1 gap-4">
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
