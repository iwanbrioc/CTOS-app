import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { StatusBar } from "@/components/status-bar";
import { ProgressIndicator } from "@/components/progress-indicator";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MilestoneManager } from "@/components/milestone-achievement";
import { NotificationBanner } from "@/components/notification-banner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Sparkles, BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import type { User, Session, UserProgress, HandyHack, JournalEntry } from "@shared/schema";


export default function Home() {
  const { user: authUser, isLoading: userLoading } = useAuth();
  
  // Fallback to demo user only if auth user is not available
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
  const [showSettings, setShowSettings] = useState(false);
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

  const allSessions = sessions;
  const completedSessions = userProgress.filter(p => p.completed).length;
  const totalSessions = sessions.length;
  const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // Get this week's practice session
  const currentWeek = user?.currentWeek || 1;
  const practiceSession = sessions.find(s => s.week === currentWeek);

  // Get today's journal entry
  const today = new Date().toDateString();
  const todaysJournal = journalEntries.find(entry => 
    new Date(entry.date || '').toDateString() === today
  );

  const getUserProgressForSession = (sessionId: number) => {
    return userProgress.find(p => p.sessionId === sessionId);
  };
  
  const getSessionState = (session: Session): 'past' | 'active' | 'future' => {
    const currentWeek = user?.currentWeek || 1;
    const sessionsPace = user?.sessionsPace || 1;
    const courseFormat = user?.courseFormat || "8-week";
    
    const effectivePace = courseFormat === "4-week" ? sessionsPace * 2 : sessionsPace;
    const availableSessions = currentWeek * effectivePace;
    const sessionIndex = sessions.findIndex(s => s.id === session.id);
    
    if (sessionIndex < availableSessions - effectivePace) {
      return 'past';
    } else if (sessionIndex < availableSessions) {
      return 'active';
    } else {
      return 'future';
    }
  };
  
  const handleFutureSessionClick = () => {
    toast({
      title: "Not yet",
      description: "This session will be available in a future week.",
      duration: 2000,
    });
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

  // Session pace mutation
  const updateSessionsPaceMutation = useMutation({
    mutationFn: async (newPace: number) => {
      return apiRequest("PUT", `/api/users/${user.id}/sessions-pace`, { sessionsPace: newPace });
    },
    onSuccess: async (data, newPace) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Settings updated",
        description: `Session pace set to ${newPace === 1 ? '1 session' : '2 sessions'} per week.`,
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update session pace.",
        variant: "destructive",
        duration: 2000,
      });
    }
  });

  const updateCourseFormatMutation = useMutation({
    mutationFn: async (newFormat: string) => {
      return apiRequest("PUT", `/api/users/${user.id}/course-format`, { courseFormat: newFormat });
    },
    onSuccess: async (data, newFormat) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Settings updated",
        description: `Course format set to ${newFormat} course.`,
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update course format.",
        variant: "destructive",
        duration: 2000,
      });
    }
  });

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
                  {user?.firstName ? `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${user.firstName}` : 'Welcome back!'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                data-testid="button-logout"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-blue-50 border-b px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Course Format</h3>
                <p className="text-xs text-gray-500">Choose course delivery schedule</p>
              </div>
              <Select 
                value={user.courseFormat || "8-week"} 
                onValueChange={(value) => updateCourseFormatMutation.mutate(value)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8-week">8-week course</SelectItem>
                  <SelectItem value="4-week">4-week condensed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="px-4 py-4">
          <ProgressIndicator 
            completedSessions={completedSessions}
            totalSessions={totalSessions}
            progressPercentage={progressPercentage}
          />
        </div>

        {/* Main Content */}
        <div className="pb-20">
          {/* Daily Practice Section */}
          <div className="px-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Today's Practice
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Your mindful moments for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            
            <div className="space-y-3">
              {/* Practice of the Week Card */}
              {practiceSession && (
                <Link href={`/session/${practiceSession.id}`}>
                  <div 
                    className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    data-testid={`card-practice-${practiceSession.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-5 w-5 text-white" />
                          <span className="text-white text-sm font-medium">Week {practiceSession.week}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {practiceSession.title}
                        </h3>
                        <p className="text-blue-100 text-sm mb-3">
                          {practiceSession.description}
                        </p>
                        <div className="flex items-center gap-2 text-white text-sm">
                          <span>{practiceSession.duration} min</span>
                          {getUserProgressForSession(practiceSession.id)?.completed && (
                            <CheckCircle className="h-4 w-4 text-green-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Handy Hack Card */}
              {randomHack && (
                <div 
                  className="bg-gradient-to-br from-pink-300 to-pink-400 rounded-2xl p-6 shadow-md"
                  data-testid={`card-hack-${randomHack.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">✨</span>
                        <span className="text-pink-900 text-sm font-medium">Handy Hack</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {randomHack.title}
                      </h3>
                      <p className="text-gray-700 text-sm mb-4">
                        {randomHack.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button 
                      onClick={() => practiceHackMutation.mutate()}
                      disabled={practiceHackMutation.isPending}
                      className="bg-white text-pink-600 hover:bg-pink-50"
                      data-testid="button-practice-hack"
                    >
                      I Practiced This
                    </Button>
                    <div className="text-right">
                      <div className="text-xs text-gray-700">Today: {hackCounts?.today || 0}x</div>
                      <div className="text-xs text-gray-700">This week: {hackCounts?.thisWeek || 0}x</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Journal Entry Card */}
              <Link href="/journal">
                <div 
                  className="bg-gradient-to-br from-purple-300 to-purple-400 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  data-testid="card-journal"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-5 w-5 text-purple-900" />
                        <span className="text-purple-900 text-sm font-medium">Daily Journal</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {todaysJournal ? 'Continue Journaling' : 'Start Your Journal'}
                      </h3>
                      <p className="text-gray-700 text-sm mb-3">
                        {todaysJournal 
                          ? 'You\'ve started today\'s entry. Keep reflecting!'
                          : 'Capture your thoughts, gratitude, and reflections for today.'
                        }
                      </p>
                      <div className="flex items-center gap-2">
                        {todaysJournal?.morningCompleted && (
                          <span className="text-xs bg-purple-900 text-white px-2 py-1 rounded">
                            Morning ✓
                          </span>
                        )}
                        {todaysJournal?.eveningCompleted && (
                          <span className="text-xs bg-purple-900 text-white px-2 py-1 rounded">
                            Evening ✓
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-gray-900 mt-4" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* All Sessions - Horizontal Scroll */}
          <div className="mb-6">
            <div className="px-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                All Sessions
              </h2>
              <p className="text-sm text-gray-600">
                Explore your complete mindfulness course
              </p>
            </div>
            
            <div className="overflow-x-auto pb-4 px-4">
              <div className="flex gap-4" style={{ width: 'max-content' }}>
                {allSessions.map((session, index) => {
                  const sessionState = getSessionState(session);
                  const progress = getUserProgressForSession(session.id);
                  const isLocked = sessionState === 'future';
                  
                  // Color palette for cards
                  const colors = [
                    'from-blue-400 to-blue-500',
                    'from-teal-400 to-teal-500',
                    'from-orange-400 to-orange-500',
                    'from-pink-400 to-pink-500',
                    'from-yellow-400 to-yellow-500',
                    'from-green-400 to-green-500',
                    'from-indigo-400 to-indigo-500',
                    'from-purple-400 to-purple-500',
                  ];
                  
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <Link 
                      key={session.id} 
                      href={isLocked ? '#' : `/session/${session.id}`}
                      onClick={isLocked ? (e) => { e.preventDefault(); handleFutureSessionClick(); } : undefined}
                    >
                      <div 
                        className={`relative bg-gradient-to-br ${colorClass} rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer`}
                        style={{ width: '280px', minHeight: '200px' }}
                        data-testid={`card-session-${session.id}`}
                      >
                        {isLocked && (
                          <div className="absolute inset-0 bg-gray-900 bg-opacity-40 rounded-2xl flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🔒</div>
                              <p className="text-white font-medium">Locked</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-white text-xs font-medium bg-white bg-opacity-20 px-2 py-1 rounded">
                              Week {session.week}
                            </span>
                            {progress?.completed && (
                              <CheckCircle className="h-5 w-5 text-green-300" />
                            )}
                          </div>
                          
                          <h3 className="text-lg font-bold text-white mb-2">
                            {session.title}
                          </h3>
                          
                          <p className="text-white text-opacity-90 text-sm mb-3 line-clamp-2">
                            {session.description}
                          </p>
                          
                          <div className="flex items-center gap-2 text-white text-sm">
                            <span>{session.duration} min</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
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
