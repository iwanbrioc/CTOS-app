import { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { StatusBar } from "@/components/status-bar";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MilestoneManager } from "@/components/milestone-achievement";
import { NotificationBanner } from "@/components/notification-banner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Settings, Play, BookOpen, Sparkles, Pause, X, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import type { User, Session, UserProgress, JournalEntry, UserHackCompletion, HandyHack } from "@shared/schema";
import eyesOpenIcon from "@assets/A18980D3-31A8-40FC-9C97-3F0E7FE444C2_1759681457952.png";
import eyesClosedIcon from "@assets/8165BDE4-AEE4-46E7-A96B-D3B6B5355DE9_1759686357223.png";
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
    case "dropping-balloon": return droppingBalloonImg;
    case "seven-stations-spine": return sevenStationsSpineImg;
    case "the-sense-being-alive": return theSenseBeingAliveImg;
    case "mind-body-movement": return mindBodyMovementImg;
    case "what-if-all-there-is": return whatIfAllThereIsImg;
    case "turning-towards-discomfort": return turningTowardsDiscomfortImg;
    case "four-pillars": return fourPillarsImg;
    case "great-smile": return greatSmileImg;
    case "five-elements": return fiveElementsImg;
    case "journaling-flow": return journalingFlowImg;
    default: return droppingBalloonImg;
  }
};

const getWeekGradient = (week: number) => {
  const gradients: Record<number, string> = {
    1: "bg-gradient-to-br from-yellow-400 to-orange-500",
    2: "bg-gradient-to-br from-blue-400 to-indigo-600",
    3: "bg-gradient-to-br from-purple-400 to-pink-500",
    4: "bg-gradient-to-br from-red-400 to-rose-600",
    5: "bg-gradient-to-br from-green-400 to-emerald-600",
    6: "bg-gradient-to-br from-orange-400 to-red-500",
    7: "bg-gradient-to-br from-cyan-400 to-blue-600",
    8: "bg-gradient-to-br from-violet-400 to-purple-600",
  };
  return gradients[week] ?? gradients[1];
};

const getPracticeGradient = (week: number) => {
  const gradients: Record<number, string> = {
    1: "bg-gradient-to-br from-amber-400 to-orange-500",
    2: "bg-gradient-to-br from-sky-400 to-blue-500",
    3: "bg-gradient-to-br from-pink-400 to-rose-500",
    4: "bg-gradient-to-br from-rose-400 to-pink-500",
    5: "bg-gradient-to-br from-teal-400 to-cyan-500",
    6: "bg-gradient-to-br from-red-400 to-rose-500",
    7: "bg-gradient-to-br from-cyan-400 to-teal-500",
    8: "bg-gradient-to-br from-indigo-400 to-purple-500",
  };
  return gradients[week] ?? gradients[1];
};

const getHackGradient = (week: number) => {
  const gradients: Record<number, string> = {
    1: "bg-gradient-to-br from-rose-400 to-pink-500",
    2: "bg-gradient-to-br from-indigo-400 to-blue-600",
    3: "bg-gradient-to-br from-violet-400 to-purple-500",
    4: "bg-gradient-to-br from-orange-400 to-red-500",
    5: "bg-gradient-to-br from-emerald-400 to-green-500",
    6: "bg-gradient-to-br from-orange-400 to-amber-600",
    7: "bg-gradient-to-br from-teal-400 to-cyan-600",
    8: "bg-gradient-to-br from-violet-400 to-indigo-600",
  };
  return gradients[week] ?? gradients[1];
};

const getJournalGradient = (week: number) => {
  const gradients: Record<number, string> = {
    1: "bg-gradient-to-br from-yellow-400 to-amber-500",
    2: "bg-gradient-to-br from-blue-400 to-indigo-500",
    3: "bg-gradient-to-br from-purple-400 to-pink-600",
    4: "bg-gradient-to-br from-red-400 to-orange-600",
    5: "bg-gradient-to-br from-green-400 to-teal-600",
    6: "bg-gradient-to-br from-amber-400 to-red-500",
    7: "bg-gradient-to-br from-emerald-400 to-teal-600",
    8: "bg-gradient-to-br from-purple-400 to-violet-600",
  };
  return gradients[week] ?? gradients[1];
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

  // Week navigation
  const [viewedWeek, setViewedWeek] = useState(user?.currentWeek || 1);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Mood check-in
  const [preMood, setPreMood] = useState<number | null>(null);
  const [postMood, setPostMood] = useState<number | null>(null);
  const [showMoodModal, setShowMoodModal] = useState<'pre' | 'post' | null>(null);

  // Celebration screen
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationSession, setCelebrationSession] = useState<Session | null>(null);

  // Calendar
  const [calendarExpanded, setCalendarExpanded] = useState(false);

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

  useEffect(() => {
    setViewedWeek(currentWeek);
  }, [currentWeek]);

  // Streak calculation — consecutive days with at least one completed session
  const streak = useMemo(() => {
    const completedDates = [...new Set(
      userProgress
        .filter(p => p.completed && p.completedAt)
        .map(p => new Date(p.completedAt!).toDateString())
    )].sort();

    if (!completedDates.length) return 0;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const last = completedDates[completedDates.length - 1];
    if (last !== today && last !== yesterday) return 0;

    let count = 0;
    let check = new Date(last === today ? Date.now() : Date.now() - 86400000);
    for (let i = completedDates.length - 1; i >= 0; i--) {
      if (completedDates[i] === check.toDateString()) {
        count++;
        check = new Date(check.getTime() - 86400000);
      } else break;
    }
    return count;
  }, [userProgress]);

  // Calendar dot data for current month
  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    const practicedDays = new Set<number>();
    userProgress
      .filter(p => p.completed && p.completedAt)
      .forEach(p => {
        const d = new Date(p.completedAt!);
        if (d.getFullYear() === year && d.getMonth() === month) {
          practicedDays.add(d.getDate());
        }
      });

    return { daysInMonth, firstDayOfWeek, practicedDays, today: now.getDate(), monthName };
  }, [userProgress]);

  const getUserProgressForSession = (sessionId: number) => {
    return userProgress.find(p => p.sessionId === sessionId);
  };

  useEffect(() => {
    if (!showPracticePlayer) return;
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Trigger post-session mood check
      setShowMoodModal('post');
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

  const isSoundCloudUrl = (url?: string) => !!url && url.includes("soundcloud.com");

  const toSoundCloudEmbed = (url: string) =>
    `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23667eea&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`;

  // Complete session API call
  const completeSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      await apiRequest("POST", `/api/users/${user?.id}/complete/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/progress`] });
    },
  });

  // Start practice: show pre-mood modal first
  const handleStartPractice = () => {
    setPreMood(null);
    setPostMood(null);
    setShowMoodModal('pre');
  };

  const handleClosePractice = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setShowPracticePlayer(false);
  };

  // Called when user manually taps "Done" during practice
  const handleSessionDone = () => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    setIsPlaying(false);
    setShowMoodModal('post');
  };

  const handleMoodSelect = (mood: number) => {
    if (showMoodModal === 'pre') {
      setPreMood(mood);
      setShowMoodModal(null);
      // Now open the player
      setShowPracticePlayer(true);
      if (!isSoundCloudUrl(practiceSession?.audioUrl)) {
        setTimeout(() => { audioRef.current?.load(); }, 100);
      }
    } else if (showMoodModal === 'post') {
      setPostMood(mood);
      setShowMoodModal(null);
      // Complete the session and show celebration
      if (practiceSession) {
        completeSessionMutation.mutate(practiceSession.id);
        setCelebrationSession(practiceSession);
      }
      handleClosePractice();
      setShowCelebration(true);
    }
  };

  const handleSkipMood = () => {
    if (showMoodModal === 'pre') {
      setShowMoodModal(null);
      setShowPracticePlayer(true);
      if (!isSoundCloudUrl(practiceSession?.audioUrl)) {
        setTimeout(() => { audioRef.current?.load(); }, 100);
      }
    } else if (showMoodModal === 'post') {
      setShowMoodModal(null);
      if (practiceSession) {
        completeSessionMutation.mutate(practiceSession.id);
        setCelebrationSession(practiceSession);
      }
      handleClosePractice();
      setShowCelebration(true);
    }
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
      toast({ title: "Practice logged!", description: "Keep up the great work!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to log practice. Please try again.", variant: "destructive" });
    },
  });

  const handleHackClick = () => {
    if (practiceSession?.handyHack) {
      const currentHack = allHacks.find(hack => practiceSession.handyHack?.includes(hack.title));
      if (currentHack) completeHackMutation.mutate(currentHack.id);
    }
  };

  // Swipe gesture handlers
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    setDragOffset(currentTouch - touchStart);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (!touchStart || !touchEnd) { setDragOffset(0); return; }
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && viewedWeek < 8) {
      setSwipeDirection('left');
      setViewedWeek(prev => Math.min(8, prev + 1));
    } else if (distance < -minSwipeDistance && viewedWeek > 1) {
      setSwipeDirection('right');
      setViewedWeek(prev => Math.max(1, prev - 1));
    }
    setDragOffset(0);
  };

  const handleWeekDotClick = (week: number) => {
    setSwipeDirection(week > viewedWeek ? 'left' : 'right');
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

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-5 shadow-lg rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/attached_assets/CTOS Emblem_1751662222205.png"
                alt="CTOS"
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">Coming to Our Senses</h1>
                <p className="text-sm text-blue-100">
                  {user?.firstName ? `${user.firstName}'s Journey` : 'Your Mindfulness Journey'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Streak counter */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className="text-lg leading-none">🔥</span>
                  <span className="text-white font-bold text-lg leading-none">
                    {streak > 0 ? streak : '—'}
                  </span>
                </div>
                <span className="text-white/70 text-xs mt-0.5">
                  {streak === 1 ? 'day' : streak > 1 ? 'days' : 'streak'}
                </span>
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
        </div>

        {/* Week Selector */}
        <div className="bg-white border-b px-4 pt-3 pb-2">
          <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide">
            {Array.from({ length: 8 }).map((_, index) => {
              const week = index + 1;
              const isCurrentWeek = week === currentWeek;
              const isViewedWeek = week === viewedWeek;
              return (
                <button
                  key={week}
                  onClick={() => handleWeekDotClick(week)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
                    isViewedWeek ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  data-testid={`week-indicator-${week}`}
                  aria-label={`Week ${week}${isCurrentWeek ? ' (current)' : ''}`}
                >
                  <span className={`text-xs font-semibold ${
                    isViewedWeek ? 'text-blue-600' : isCurrentWeek ? 'text-blue-400' : 'text-gray-400'
                  }`}>W{week}</span>
                  <div className={`h-1.5 rounded-full transition-all ${
                    isViewedWeek
                      ? 'w-6 bg-gradient-to-r from-blue-500 to-purple-500'
                      : `w-1.5 ${isCurrentWeek ? 'bg-blue-400' : 'bg-gray-300'}`
                  }`} />
                </button>
              );
            })}
          </div>
          {viewedWeek !== currentWeek && (
            <div className="text-center mt-1">
              <button
                onClick={() => setViewedWeek(currentWeek)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                data-testid="return-to-current-week"
              >
                ← Back to Week {currentWeek}
              </button>
            </div>
          )}
        </div>

        {/* Practice Calendar */}
        <div className="bg-white border-b">
          <button
            className="w-full flex items-center justify-between px-4 py-3"
            onClick={() => setCalendarExpanded(v => !v)}
            aria-label="Toggle practice calendar"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">{calendarData.monthName}</span>
              {calendarData.practicedDays.size > 0 && (
                <span className="text-xs text-blue-500 font-medium">
                  {calendarData.practicedDays.size} day{calendarData.practicedDays.size !== 1 ? 's' : ''} practiced
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">{calendarExpanded ? '▲' : '▼'}</span>
          </button>

          <AnimatePresence>
            {calendarExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  {/* Day labels */}
                  <div className="grid grid-cols-7 mb-2">
                    {['S','M','T','W','T','F','S'].map((d, i) => (
                      <div key={i} className="text-center text-xs text-gray-400 font-medium">{d}</div>
                    ))}
                  </div>
                  {/* Day dots */}
                  <div className="grid grid-cols-7 gap-y-1">
                    {Array.from({ length: calendarData.firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const practiced = calendarData.practicedDays.has(day);
                      const isToday = day === calendarData.today;
                      const isPast = day < calendarData.today;
                      return (
                        <div key={day} className="flex items-center justify-center py-0.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                            practiced
                              ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-sm'
                              : isToday
                                ? 'border-2 border-blue-400 text-blue-600'
                                : isPast
                                  ? 'text-gray-300'
                                  : 'text-gray-200'
                          }`}>
                            {day}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content - Scrollable */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto pb-36"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="p-4 space-y-6">

            {/* Session Title Card */}
            <AnimatePresence mode="wait">
              {practiceSession && (
                <motion.div
                  key={`session-${viewedWeek}`}
                  initial={{ x: swipeDirection === 'left' ? 300 : swipeDirection === 'right' ? -300 : 0, opacity: 0 }}
                  animate={{ x: isDragging ? dragOffset : 0, opacity: isDragging ? 1 - Math.abs(dragOffset) / 400 : 1 }}
                  exit={{ x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0, opacity: 0 }}
                  transition={isDragging ? { type: "tween", duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                  className={`${getWeekGradient(viewedWeek)} rounded-3xl p-6 shadow-xl relative overflow-hidden`}
                  data-testid={`card-session-display-${practiceSession.id}`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-white bg-opacity-30 text-white text-xs font-bold px-3 py-1 rounded-full">
                        WEEK {practiceSession.week} OF 8
                      </span>
                      <div className="flex gap-1">
                        {viewedWeek > 1 && (
                          <button
                            onClick={() => { setSwipeDirection('right'); setViewedWeek(v => v - 1); }}
                            className="bg-white/20 hover:bg-white/30 rounded-full p-1 transition-all"
                            aria-label="Previous week"
                          >
                            <ChevronLeft className="h-4 w-4 text-white" />
                          </button>
                        )}
                        {viewedWeek < 8 && (
                          <button
                            onClick={() => { setSwipeDirection('left'); setViewedWeek(v => v + 1); }}
                            className="bg-white/20 hover:bg-white/30 rounded-full p-1 transition-all"
                            aria-label="Next week"
                          >
                            <ChevronRight className="h-4 w-4 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{practiceSession.title}</h2>
                    <p className="text-white/80 text-sm leading-relaxed">{practiceSession.description}</p>
                  </div>
                  {practiceSession.illustration && (
                    <img
                      src={getSessionImage(practiceSession.illustration)}
                      alt={practiceSession.title}
                      className="absolute top-0 right-0 h-full w-auto object-cover opacity-20 mix-blend-multiply"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Daily Practice Card with Integrated Player */}
            <AnimatePresence mode="wait">
              {practiceSession && (
                <motion.div
                  key={`practice-${viewedWeek}`}
                  initial={{ x: swipeDirection === 'left' ? 300 : swipeDirection === 'right' ? -300 : 0, opacity: 0 }}
                  animate={{ x: isDragging ? dragOffset : 0, opacity: isDragging ? 1 - Math.abs(dragOffset) / 400 : 1 }}
                  exit={{ x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0, opacity: 0 }}
                  transition={isDragging ? { type: "tween", duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                  className={`${getPracticeGradient(viewedWeek)} rounded-3xl shadow-xl overflow-hidden`}
                  data-testid="card-daily-practice"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-4">
                          <span className="text-white text-xs font-bold tracking-wide">DAILY PRACTICE</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {practiceSession.practiceName || practiceSession.title}
                        </h3>
                        <p className="text-white text-opacity-90 text-sm mb-3">
                          {practiceSession.duration} minute meditation
                        </p>
                        {getUserProgressForSession(practiceSession.id)?.completed && (
                          <span className="inline-flex items-center gap-1 bg-white bg-opacity-30 text-white text-xs font-medium px-3 py-1 rounded-full">
                            <CheckCircle className="h-3 w-3" /> Completed
                          </span>
                        )}
                      </div>
                      {!showPracticePlayer && (
                        <button
                          onClick={handleStartPractice}
                          className="bg-white/20 rounded-full p-4 hover:bg-white/30 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                          data-testid="button-start-practice"
                        >
                          <img src={eyesOpenIcon} alt="Start Practice" className="w-16 h-16" />
                        </button>
                      )}
                      {showPracticePlayer && (
                        <div className="bg-white/20 rounded-full p-4 flex-shrink-0">
                          <img src={eyesClosedIcon} alt="Practicing" className="w-16 h-16" style={{ mixBlendMode: 'multiply' }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {showPracticePlayer && (
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 border-t border-white/20">
                      {/* Top row: close + done */}
                      <div className="flex justify-between items-center mb-3">
                        <button
                          onClick={handleClosePractice}
                          className="text-white/60 hover:text-white transition-colors text-sm"
                          aria-label="Close player"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleSessionDone}
                          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-all"
                          aria-label="Mark session done"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Done
                        </button>
                      </div>

                      {isSoundCloudUrl(practiceSession.audioUrl) ? (
                        <iframe
                          width="100%"
                          height="80"
                          scrolling="no"
                          frameBorder="no"
                          allow="autoplay"
                          src={toSoundCloudEmbed(practiceSession.audioUrl || "")}
                          title={practiceSession.title}
                          className="rounded-lg"
                        />
                      ) : (
                        <>
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
                              className="flex-shrink-0 bg-white hover:bg-gray-100 text-green-600"
                              data-testid="audio-play-pause-btn"
                            >
                              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
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
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Half-screen cards: Handy Hack | Journal */}
            <div className="grid grid-cols-2 gap-4">

              {/* Handy Hack Card */}
              {practiceSession && (
                <div
                  className={`${getHackGradient(viewedWeek)} rounded-3xl p-5 shadow-xl cursor-pointer hover:shadow-2xl transition-all active:scale-95`}
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

                      if (count === 0) return <span className="text-white/50 text-xs italic">Tap to log practice</span>;

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
                            <div key={`stick-${i}`} className="w-1 h-7 bg-white rounded-sm" />
                          ))}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Journal Card */}
              <Link href="/journal">
                <div
                  className={`${getJournalGradient(viewedWeek)} rounded-3xl p-5 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow h-full`}
                  data-testid="card-journal"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5 text-white" />
                    <span className="text-white text-xs font-bold">JOURNAL</span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    Write in your journal
                  </h3>
                </div>
              </Link>
            </div>

          </div>
        </div>

        {/* Progress Bar - Fixed */}
        <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-sm border-t px-4 py-2 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
              {completedSessions}/{totalSessions} sessions
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-blue-600 whitespace-nowrap">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>

        <NotificationBanner
          show={showNotificationBanner}
          onClose={() => setShowNotificationBanner(false)}
        />

        <BottomNavigation />

        {/* Mood Check-in Modal */}
        <AnimatePresence>
          {showMoodModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="bg-white w-full rounded-t-3xl p-8 pb-10"
              >
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
                <h3 className="text-xl font-bold text-center text-gray-800 mb-1">
                  {showMoodModal === 'pre' ? 'How are you feeling?' : 'How do you feel now?'}
                </h3>
                <p className="text-sm text-gray-400 text-center mb-8">
                  {showMoodModal === 'pre' ? 'Before your practice' : 'After your practice'}
                </p>
                <div className="flex justify-around mb-6">
                  {(['😔', '😕', '😐', '🙂', '😊'] as const).map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => handleMoodSelect(i + 1)}
                      className="text-4xl hover:scale-125 active:scale-90 transition-transform p-2 rounded-xl"
                      aria-label={`Mood ${i + 1}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSkipMood}
                  className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
                >
                  Skip
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Celebration Screen */}
        <AnimatePresence>
          {showCelebration && celebrationSession && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${getPracticeGradient(celebrationSession.week)}`}
            >
              <div className="text-center text-white px-8 max-w-sm w-full">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="text-7xl mb-6"
                >
                  ✨
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-3xl font-bold mb-2"
                >
                  Well done.
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-white/80 text-lg mb-8"
                >
                  {celebrationSession.duration} minutes of presence
                </motion.p>

                {/* Mood shift */}
                {preMood && postMood && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="bg-white/20 rounded-2xl px-8 py-5 mb-5 flex items-center justify-center gap-5"
                  >
                    <span className="text-4xl opacity-80">{(['😔','😕','😐','🙂','😊'])[preMood - 1]}</span>
                    <span className="text-white/50 text-2xl font-light">→</span>
                    <span className="text-4xl">{(['😔','😕','😐','🙂','😊'])[postMood - 1]}</span>
                  </motion.div>
                )}

                {/* Streak */}
                {streak > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="flex items-center justify-center gap-2 mb-8"
                  >
                    <span className="text-2xl">🔥</span>
                    <span className="text-white font-semibold text-lg">
                      {streak} day{streak !== 1 ? 's' : ''} in a row
                    </span>
                  </motion.div>
                )}

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65 }}
                  onClick={() => {
                    setShowCelebration(false);
                    setPreMood(null);
                    setPostMood(null);
                    setCelebrationSession(null);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white font-semibold px-10 py-3 rounded-full transition-all active:scale-95"
                >
                  Back to home
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </MilestoneManager>
  );
}
