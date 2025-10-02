import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AudioPlayer } from "@/components/audio-player";
import { StatusBar } from "@/components/status-bar";
import { BottomNavigation } from "@/components/bottom-navigation";
import type { Session } from "@shared/schema";

export default function SessionPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const sessionId = parseInt(params.id || "0");

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const session = sessions.find(s => s.id === sessionId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session not found</h2>
          <p className="text-gray-600 mb-4">The session you're looking for doesn't exist.</p>
          <button
            onClick={() => setLocation("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StatusBar />
      <div className="pb-20">
        <AudioPlayer 
          session={session} 
          onClose={() => setLocation("/")} 
        />
      </div>
      <BottomNavigation />
    </div>
  );
}
