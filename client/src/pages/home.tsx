import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { StatusBar } from "@/components/status-bar";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MilestoneManager } from "@/components/milestone-achievement";
import { NotificationBanner } from "@/components/notification-banner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Settings, Play, BookOpen, Sparkles, Pause } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import type { User, Session, UserProgress, HandyHack, JournalEntry } from "@shared/schema";


export default function Home() {
  const { user: authUser, isLoading: userLoading } = useAuth();
  
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
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [showPracticePlayer, setShowPracticePlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/users", user?.id, "progress"],
    enabled: !!user?.id,
  });

  const { data: randomHack } = useQuery<HandyHack>({
    queryKey: ["/api/handy-hacks/random"],
  });

  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/users", user?.id, "journal"],
    enabled: !!user?.id,
  });

  const { data: hackCounts } = useQuery<{ today: number; thisWeek: number }>({
    queryKey: [`/api/users/${user?.id}/hacks/${randomHack?.id}/practice-counts`],
    enabled: !!user?.id && !!randomHack?.id,
  });

  const completedSessions = userProgress.filter(p => p.completed).length;
  const totalSessions = sessions.length;
  const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  const currentWeek = user?.currentWeek || 1;
  const practiceSession = sessions.find(s => s.week === currentWeek);

  const today = new Date().toDateString();
  const todaysJournal = journalEntries.find(entry => 
    new Date(entry.date || '').toDateString() === today
  );

  const getUserProgressForSession = (sessionId: number) => {
    return userProgress.find(p => p.sessionId === sessionId);
  };

  useEffect(() => {
    if (!showPracticePlayer) return;
    
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [showPracticePlayer]);

  const handleStartPractice = () => {
    setShowPracticePlayer(true);
    setTimeout(() => {
      const audio = audioRef.current;
      if (audio) {
        audio.load();
      }
    }, 100);
  };

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        if (audio.readyState < 2) {
          await new Promise((resolve) => {
            audio.addEventListener('loadeddata', resolve, { once: true });
            audio.load();
          });
        }
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const practiceHackMutation = useMutation({
    mutationFn: async () => {
      if (!randomHack) return;
      await apiRequest("POST", `/api/users/${user.id}/hacks/${randomHack.id}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/hacks/${randomHack?.id}/practice-counts`] });
      toast({
        title: "Great!",
        description: "Handy hack practiced. Keep it up!",
        duration: 2000,
      });
    }
  });

  if (sessionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading your mindfulness journey...</p>
        </div>
      </div>
    );
  }

  return (
    <MilestoneManager userId={user?.id}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <StatusBar />
        
        {/* Header - App Title */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/attached_assets/CTOS Emblem_1751662222205.png" 
                alt="CTOS" 
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Coming to Our Senses
                </h1>
                <p className="text-sm text-blue-100">
                  {user?.firstName ? `${user.firstName}'s Journey` : 'Your Mindfulness Journey'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
              className="text-white hover:bg-white hover:bg-opacity-20"
              data-testid="button-logout"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="p-4 space-y-6">
            
            {/* Session Title and Picture Card */}
            {practiceSession && (
              <div 
                className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 shadow-xl relative overflow-hidden"
                data-testid={`card-session-display-${practiceSession.id}`}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-white bg-opacity-30 text-white text-xs font-bold px-3 py-1 rounded-full">
                      WEEK {practiceSession.week}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    {practiceSession.title}
                  </h2>
                  <p className="text-white text-opacity-90 text-base leading-relaxed">
                    {practiceSession.description}
                  </p>
                </div>
                {practiceSession.illustration && (
                  <img 
                    src={practiceSession.illustration} 
                    alt={practiceSession.title}
                    className="absolute bottom-0 right-0 w-32 h-32 object-contain opacity-30"
                  />
                )}
              </div>
            )}

            {/* Daily Practice Card with Integrated Player */}
            {practiceSession && (
              <div 
                className="bg-gradient-to-br from-green-400 to-teal-500 rounded-3xl shadow-xl overflow-hidden"
                data-testid="card-daily-practice"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 32 32" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white flex-shrink-0"
                    >
                      <ellipse cx="16" cy="18" rx="10" ry="12" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 15 C 12 15, 13 14, 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M20 15 C 20 15, 19 14, 18 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M14 21 Q 16 22, 18 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    </svg>
                    <span className="text-white text-xs font-bold">DAILY PRACTICE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Start Today's Practice
                      </h3>
                      <p className="text-white text-opacity-90 text-sm mb-2">
                        {practiceSession.duration} minute meditation
                      </p>
                      {getUserProgressForSession(practiceSession.id)?.completed && (
                        <span className="inline-block bg-white bg-opacity-30 text-white text-xs font-medium px-3 py-1 rounded-full">
                          Completed ✓
                        </span>
                      )}
                    </div>
                    {!showPracticePlayer && (
                      <button
                        onClick={handleStartPractice}
                        className="bg-white rounded-full p-4 shadow-lg hover:scale-105 transition-transform"
                        data-testid="button-start-practice"
                      >
                        <svg 
                          width="32" 
                          height="32" 
                          viewBox="0 0 32 32" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-green-500"
                        >
                          <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
                          <path d="M16 8C16 8 12 10 12 12C12 14 12 18 12 20C12 22 16 24 16 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M16 8C16 8 20 10 20 12C20 14 20 18 20 20C20 22 16 24 16 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="10" y1="14" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="20" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {showPracticePlayer && (
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 border-t border-white/20">
                    <audio
                      ref={audioRef}
                      src={practiceSession.audioUrl}
                      preload="metadata"
                      crossOrigin="anonymous"
                    />
                    
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={handlePlayPause}
                        size="lg"
                        className={`flex-shrink-0 ${
                          isPlaying 
                            ? "bg-white hover:bg-gray-100 text-green-600" 
                            : "bg-white hover:bg-gray-100 text-green-600"
                        }`}
                        data-testid="audio-play-pause-btn"
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6 ml-0.5" />
                        )}
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white mb-1 font-medium">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                        <div className="w-full bg-white/30 rounded-full h-2">
                          <div 
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Half Screen Cards: Handy Hack | Journal */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Handy Hack Card - Half Screen */}
              {randomHack && (
                <div 
                  className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl p-5 shadow-xl"
                  data-testid={`card-hack-${randomHack.id}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-white" />
                    <span className="text-white text-xs font-bold">HANDY HACK</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {randomHack.title}
                  </h3>
                  <p className="text-white text-opacity-90 text-sm mb-4 line-clamp-3">
                    {randomHack.description}
                  </p>
                  <Button 
                    onClick={() => practiceHackMutation.mutate()}
                    disabled={practiceHackMutation.isPending}
                    className="w-full bg-white text-pink-600 hover:bg-pink-50 font-semibold"
                    size="sm"
                    data-testid="button-practice-hack"
                  >
                    Practice
                  </Button>
                  <div className="mt-3 text-center">
                    <span className="text-white text-xs font-medium">
                      Today: {hackCounts?.today || 0}x
                    </span>
                  </div>
                </div>
              )}

              {/* Journal Card - Half Screen */}
              <Link href="/journal">
                <div 
                  className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-3xl p-5 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow h-full"
                  data-testid="card-journal"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5 text-white" />
                    <span className="text-white text-xs font-bold">JOURNAL</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Daily Journal
                  </h3>
                  <p className="text-white text-opacity-90 text-sm mb-4">
                    {todaysJournal ? 'Continue writing' : 'Start journaling'}
                  </p>
                  <div className="flex gap-2">
                    {todaysJournal?.morningCompleted && (
                      <span className="text-xs bg-white bg-opacity-30 text-white px-2 py-1 rounded-full">
                        Morning ✓
                      </span>
                    )}
                    {todaysJournal?.eveningCompleted && (
                      <span className="text-xs bg-white bg-opacity-30 text-white px-2 py-1 rounded-full">
                        Evening ✓
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </div>

        {/* Progress Bar at Bottom - Fixed */}
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Course Progress</span>
            <span className="text-sm font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {completedSessions} of {totalSessions} sessions completed
          </p>
        </div>

        <NotificationBanner 
          show={showNotificationBanner}
          onClose={() => setShowNotificationBanner(false)}
        />

        <BottomNavigation />
      </div>
    </MilestoneManager>
  );
}
