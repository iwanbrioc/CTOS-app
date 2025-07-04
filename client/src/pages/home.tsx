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
import { Link } from "wouter";
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
              className="w-16 h-16 object-contain"
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
            <Link href="/profile">
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full p-2 hover:bg-muted"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </Link>
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
        
        {/* Today's Practice with Gamified Tracker */}
        {currentSession && (
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-primary mb-2">Today's Practice</h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                {/* Practice Goal Tracker - Skittles Style */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Practice Goal</span>
                    <span className="text-xs text-gray-500">5 sessions this week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((skittle) => {
                      const isCompleted = completedSessions >= skittle;
                      return (
                        <div
                          key={skittle}
                          className={`relative transition-all duration-300 ${
                            isCompleted 
                              ? 'transform rotate-12 scale-90 opacity-40' 
                              : 'transform rotate-0 scale-100 opacity-100'
                          }`}
                        >
                          <div className={`w-8 h-12 rounded-full shadow-md transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-gray-300 border-2 border-gray-400' 
                              : 'bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-blue-700'
                          }`}>
                            <div className={`w-full h-2 rounded-full mt-1 ${
                              isCompleted ? 'bg-gray-400' : 'bg-blue-300'
                            }`}></div>
                          </div>
                          {isCompleted && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    {completedSessions}/5 practices completed
                    {completedSessions === 5 && (
                      <span className="ml-2 text-green-600 font-medium">🎉 Goal achieved!</span>
                    )}
                  </div>
                </div>

                {/* Current Session Card */}
                <SessionCard
                  session={currentSession}
                  isCurrentSession={true}
                  onStartPractice={handleStartPractice}
                  userProgress={userProgress.find(p => p.sessionId === currentSession.id)}
                />
              </div>
            </div>
          </section>
        )}

        {/* 8-Week Journey */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-4">Your 8-Week Journey</h2>
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((session) => {
              const progress = userProgress.find(p => p.sessionId === session.id);
              const isCurrentSessionCard = session.week === currentWeek;
              
              // Skip showing current session again if it's already shown above
              if (isCurrentSessionCard && currentSession) {
                return null;
              }
              
              return (
                <SessionCard
                  key={session.id}
                  session={session}
                  isCurrentSession={false}
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
