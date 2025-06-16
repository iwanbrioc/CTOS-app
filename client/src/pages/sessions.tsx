import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "@/components/status-bar";
import { SessionCard } from "@/components/session-card";
import { AudioUpload } from "@/components/audio-upload";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import type { Session, UserProgress } from "@shared/schema";

const DEMO_USER_ID = 1;

export default function Sessions() {
  const [currentAudioSession, setCurrentAudioSession] = useState<Session | null>(null);

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/users", DEMO_USER_ID, "progress"],
  });

  const handleStartPractice = (session: Session) => {
    setCurrentAudioSession(session);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            <h1 className="text-xl font-semibold text-primary">All Sessions</h1>
            <p className="text-sm text-muted-foreground">8-Week Mindfulness Journey</p>
          </div>
        </div>
      </header>

      {/* Sessions List */}
      <main className="px-6 py-6 pb-24 space-y-4">
        {sessions.map((session) => {
          const progress = userProgress.find(p => p.sessionId === session.id);
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
      </main>

      {currentAudioSession && (
        <AudioUpload
          session={currentAudioSession}
          onClose={() => setCurrentAudioSession(null)}
        />
      )}

      <BottomNavigation />
    </>
  );
}
