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
import smallPracticeIcon from "@assets/image_1759766192326.png";
import sevenStationsSpineImg from "@assets/seven stations of the spine_1750084108018.png";
import journalingFlowImg from "@assets/journaling for flow_1750084108018.png";
import mindBodyMovementImg from "@assets/mind in body, body in movement, movement in mind_1750084108019.png";
import droppingBalloonImg from "@assets/dropping the balloon_1750084108019.png";
import greatSmileImg from "@assets/great smile practice_1750084108019.png";
import fiveElementsImg from "@assets/five elements_1750084108020.png";
import theSenseBeingAliveImg from "@assets/the sense of being alive_1750084108017.png";
import whatIfAllThereIsImg from "@assets/what-if-all-there-is-new.png";
import turningTowardsDiscomfortImg from "@assets/turning towards discomfort_1750084108017.png";
import fourPillarsImg from "@assets/the four pillars_1750084108018.png";

const getSessionImage = (illustration: string) => {
  switch (illustration) {
    case "dropping-balloon":
      return droppingBalloonImg;
    case "seven-stations-spine":
      return sevenStationsSpineImg;
    case "the-sense-being-alive":
      return theSenseBeingAliveImg;
    case "mind-body-movement":
      return mindBodyMovementImg;
    case "what-if-all-there-is":
      return whatIfAllThereIsImg;
    case "turning-towards-discomfort":
      return turningTowardsDiscomfortImg;
    case "four-pillars":
      return fourPillarsImg;
    case "great-smile":
      return greatSmileImg;
    case "five-elements":
      return fiveElementsImg;
    case "journaling-flow":
      return journalingFlowImg;
    default:
      return droppingBalloonImg;
  }
};

const getWeekGradient = (week: number) => {
  switch (week) {
    case 1:
      return "bg-gradient-to-br from-yellow-400 to-orange-500";
    case 2:
      return "bg-gradient-to-br from-blue-400 to-indigo-600";
    case 3:
      return "bg-gradient-to-br from-purple-400 to-pink-500";
    case 4:
      return "bg-gradient-to-br from-red-400 to-rose-600";
    case 5:
      return "bg-gradient-to-br from-green-400 to-emerald-600";
    case 6:
      return "bg-gradient-to-br from-orange-400 to-red-500";
    case 7:
      return "bg-gradient-to-br from-cyan-400 to-blue-600";
    case 8:
      return "bg-gradient-to-br from-violet-400 to-purple-600";
    default:
      return "bg-gradient-to-br from-yellow-400 to-orange-500";
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
  
  // Swipe navigation state
  const [viewedWeek, setViewedWeek] = useState(user?.currentWeek || 1);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

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
  const practiceSession = sessions.find(s => s.week === viewedWeek);
  
  // Sync viewedWeek with currentWeek when user changes
  useEffect(() => {
    setViewedWeek(currentWeek);
  }, [currentWeek]);

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
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/hack-completions`] });
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
      const currentHack = allHacks.find(hack => practiceSession.handyHack?.includes(hack.title));
      if (currentHack) {
        completeHackMutation.mutate(currentHack.id);
      }
    }
  };

  // Swipe gesture handlers
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && viewedWeek < 8) {
      // Swipe left: go to next week
      setViewedWeek(prev => Math.min(8, prev + 1));
    }
    
    if (isRightSwipe && viewedWeek > 1) {
      // Swipe right: go to previous week
      setViewedWeek(prev => Math.max(1, prev - 1));
    }
  };

  const handleWeekDotClick = (week: number) => {
    setViewedWeek(week);
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
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-6 shadow-lg rounded-3xl">
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

        {/* Week Indicator Dots */}
        <div className="bg-white border-b py-3 px-4">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: 8 }).map((_, index) => {
              const week = index + 1;
              const isCurrentWeek = week === currentWeek;
              const isViewedWeek = week === viewedWeek;
              
              return (
                <button
                  key={week}
                  onClick={() => handleWeekDotClick(week)}
                  className={`transition-all ${
                    isViewedWeek 
                      ? 'w-8 h-2 rounded-full' 
                      : 'w-2 h-2 rounded-full'
                  } ${
                    isCurrentWeek 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                      : isViewedWeek
                      ? 'bg-gray-700'
                      : 'bg-gray-300'
                  }`}
                  data-testid={`week-indicator-${week}`}
                  aria-label={`Week ${week}${isCurrentWeek ? ' (current)' : ''}`}
                />
              );
            })}
          </div>
          {viewedWeek !== currentWeek && (
            <div className="text-center mt-2">
              <button
                onClick={() => setViewedWeek(currentWeek)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                data-testid="return-to-current-week"
              >
                ← Return to Week {currentWeek}
              </button>
            </div>
          )}
        </div>

        {/* Main Content - Scrollable */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto pb-32"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="p-4 space-y-6">
            
            {/* Session Title and Picture Card */}
            {practiceSession && (
              <div 
                className={`${getWeekGradient(viewedWeek)} rounded-3xl p-6 shadow-xl relative overflow-hidden`}
                data-testid={`card-session-display-${practiceSession.id}`}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
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
                    src={getSessionImage(practiceSession.illustration)} 
                    alt={practiceSession.title}
                    className="absolute top-0 right-0 h-full w-auto object-cover opacity-20 mix-blend-multiply"
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
                  <div className="min-h-[32px] flex gap-2 flex-wrap items-center bg-white/10 rounded-lg px-3 py-2" data-testid="journal-completion-ticks">
                    {(() => {
                      const count = journalEntries.length;
                      const completeGates = Math.floor(count / 5);
                      const remaining = count % 5;
                      
                      if (count === 0) {
                        return <span className="text-white/50 text-xs italic">Start your journal</span>;
                      }
                      
                      return (
                        <>
                          {Array.from({ length: completeGates }).map((_, i) => (
                            <svg key={`gate-${i}`} width="24" height="28" viewBox="0 0 24 28" className="flex-shrink-0">
                              <path d="M4 14 L8 18 L18 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                              <path d="M4 14 L8 18 L18 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(0, -8)"/>
                              <path d="M4 14 L8 18 L18 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(0, 8)"/>
                              <line x1="2" y1="22" x2="21" y2="6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                            </svg>
                          ))}
                          {Array.from({ length: remaining }).map((_, i) => (
                            <svg key={`tick-${i}`} width="18" height="18" viewBox="0 0 18 18" className="flex-shrink-0">
                              <path d="M3 9 L7 13 L15 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                          ))}
                        </>
                      );
                    })()}
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
