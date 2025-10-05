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
import type { User, Session, UserProgress, JournalEntry, UserHackCompletion, HandyHack } from "@shared/schema";
import eyesOpenIcon from "@assets/A18980D3-31A8-40FC-9C97-3F0E7FE444C2_1759681457952.png";
import eyesClosedIcon from "@assets/8165BDE4-AEE4-46E7-A96B-D3B6B5355DE9_1759686357223.png";
import smallPracticeIcon from "@assets/image_1759695759238.png";

const getSessionIcon = (week: number) => {
  const iconProps = {
    width: "28",
    height: "28",
    viewBox: "0 0 32 32",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: "text-white flex-shrink-0"
  };

  switch (week) {
    case 1: // Dropping the Balloon
      return (
        <svg {...iconProps}>
          <circle cx="16" cy="22" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 14 L 16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M14 7 Q 16 4, 18 7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      );
    case 2: // Seven Stations Spine
      return (
        <svg {...iconProps}>
          <path d="M16 6 L 16 26" stroke="currentColor" strokeWidth="2"/>
          <circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="16" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="16" cy="17" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="16" cy="22" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="16" cy="27" r="2" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      );
    case 3: // Coming to Our Senses
      return (
        <svg {...iconProps}>
          <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
          <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2"/>
          <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="3" x2="16" y2="5" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="27" x2="16" y2="29" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="16" x2="5" y2="16" stroke="currentColor" strokeWidth="2"/>
          <line x1="27" y1="16" x2="29" y2="16" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case 4: // Body Movement Mind
      return (
        <svg {...iconProps}>
          <path d="M8 16 C 8 12, 10 8, 16 8 C 22 8, 24 12, 24 16" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M8 16 C 8 20, 10 24, 16 24 C 22 24, 24 20, 24 16" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
          <circle cx="20" cy="16" r="1.5" fill="currentColor"/>
        </svg>
      );
    case 5: // What If All There Is
      return (
        <svg {...iconProps}>
          <path d="M16 8 C 10 8, 6 12, 6 16 C 6 20, 10 24, 16 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <path d="M16 8 C 22 8, 26 12, 26 16 C 26 20, 22 24, 16 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case 6: // Turning Towards Discomfort
      return (
        <svg {...iconProps}>
          <path d="M16 8 C 10 8, 6 12, 6 18 C 6 24, 16 28, 16 28 C 16 28, 26 24, 26 18 C 26 12, 22 8, 16 8" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M16 14 L 16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="16" cy="21" r="1" fill="currentColor"/>
        </svg>
      );
    case 7: // Four Pillars
      return (
        <svg {...iconProps}>
          <line x1="8" y1="8" x2="8" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="14" y1="8" x2="14" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="18" y1="8" x2="18" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="24" y1="8" x2="24" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="6" y1="24" x2="26" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 8: // Great Smile
      return (
        <svg {...iconProps}>
          <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="13" r="1.5" fill="currentColor"/>
          <circle cx="20" cy="13" r="1.5" fill="currentColor"/>
          <path d="M10 19 Q 16 23, 22 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
      );
    default:
      return null;
  }
};


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
    queryKey: [`/api/users/${user?.id}/progress`],
    enabled: !!user?.id,
  });

  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: [`/api/users/${user?.id}/journal`],
    enabled: !!user?.id,
  });

  const { data: hackCompletions = [] } = useQuery<UserHackCompletion[]>({
    queryKey: [`/api/users/${user?.id}/hack-completions`],
    enabled: !!user?.id,
  });

  const { data: allHacks = [] } = useQuery<HandyHack[]>({
    queryKey: ["/api/handy-hacks"],
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

  const completeHackMutation = useMutation({
    mutationFn: async (hackId: number) => {
      await apiRequest("POST", `/api/users/${user?.id}/hacks/${hackId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "hack-completions"] });
      toast({
        title: "Practice logged!",
        description: "Keep up the great work!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log practice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleHackClick = () => {
    if (practiceSession && practiceSession.handyHack) {
      const currentHack = allHacks.find(hack => hack.title === practiceSession.handyHack);
      if (currentHack) {
        completeHackMutation.mutate(currentHack.id);
      }
    }
  };

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
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-6 shadow-lg rounded-b-3xl">
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
            <Link href="/profile">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20"
                data-testid="button-settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="p-4 space-y-6">
            
            {/* Session Title and Picture Card */}
            {practiceSession && (
              <Link href="/sessions">
                <div 
                  className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 shadow-xl relative overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all"
                  data-testid={`card-session-display-${practiceSession.id}`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      {getSessionIcon(practiceSession.week)}
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
              </Link>
            )}

            {/* Daily Practice Card with Integrated Player */}
            {practiceSession && (
              <div 
                className="bg-gradient-to-br from-green-400 to-teal-500 rounded-3xl shadow-xl overflow-hidden"
                data-testid="card-daily-practice"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <img 
                          src={smallPracticeIcon} 
                          alt="Practice" 
                          className="w-7 h-7 flex-shrink-0"
                        />
                        <span className="text-white text-xs font-bold tracking-wide">DAILY PRACTICE</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Start Today's Practice
                      </h3>
                      <p className="text-white text-opacity-90 text-sm mb-3">
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
                        className="bg-white/20 rounded-full p-4 hover:bg-white/30 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                        data-testid="button-start-practice"
                      >
                        <img 
                          src={eyesOpenIcon} 
                          alt="Start Practice" 
                          className="w-16 h-16"
                        />
                      </button>
                    )}
                    {showPracticePlayer && (
                      <div className="bg-white/20 rounded-full p-4 flex-shrink-0">
                        <img 
                          src={eyesClosedIcon} 
                          alt="Practicing" 
                          className="w-16 h-16"
                          style={{ mixBlendMode: 'multiply' }}
                        />
                      </div>
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
              {practiceSession && (
                <div 
                  className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl p-5 shadow-xl cursor-pointer hover:shadow-2xl transition-all active:scale-95"
                  data-testid={`card-hack-week-${practiceSession.week}`}
                  onClick={handleHackClick}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-white" />
                    <span className="text-white text-xs font-bold">HANDY HACK</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-3 leading-tight">
                    {practiceSession.handyHack}
                  </h3>
                  <div className="min-h-[32px] flex gap-2 flex-wrap items-center bg-white/10 rounded-lg px-3 py-2" data-testid="hack-completion-sticks">
                    {(() => {
                      const currentHack = allHacks.find(hack => practiceSession.handyHack?.includes(hack.title));
                      const currentHackCompletions = currentHack 
                        ? hackCompletions.filter(hc => hc.hackId === currentHack.id)
                        : [];
                      const count = currentHackCompletions.length;
                      const completeGates = Math.floor(count / 5);
                      const remaining = count % 5;
                      
                      if (count === 0) {
                        return <span className="text-white/50 text-xs italic">Tap to log practice</span>;
                      }
                      
                      return (
                        <>
                          {Array.from({ length: completeGates }).map((_, i) => (
                            <svg key={`gate-${i}`} width="24" height="28" viewBox="0 0 24 28" className="flex-shrink-0">
                              <line x1="4" y1="4" x2="4" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                              <line x1="9" y1="4" x2="9" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                              <line x1="14" y1="4" x2="14" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                              <line x1="19" y1="4" x2="19" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                              <line x1="2" y1="22" x2="21" y2="6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                            </svg>
                          ))}
                          {Array.from({ length: remaining }).map((_, i) => (
                            <div 
                              key={`stick-${i}`}
                              className="w-1 h-7 bg-white rounded-sm"
                            />
                          ))}
                        </>
                      );
                    })()}
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
                  <h3 className="text-base font-bold text-white mb-3 leading-tight">
                    {practiceSession?.journaling || 'Daily Journal'}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
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
