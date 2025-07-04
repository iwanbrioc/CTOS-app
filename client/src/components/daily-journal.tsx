import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Sun, 
  Moon, 
  Heart, 
  Target, 
  Zap, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  CheckCircle,
  Clock
} from "lucide-react";
import type { JournalEntry, InsertJournalEntry } from "@shared/schema";

interface DailyJournalProps {
  userId: number;
}

export function DailyJournal({ userId }: DailyJournalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Today's journal entry state
  const [todayEntry, setTodayEntry] = useState<Partial<InsertJournalEntry>>({});
  const [isRecording, setIsRecording] = useState<{ morning: boolean; evening: boolean }>({
    morning: false,
    evening: false
  });
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  // Get today's date for filtering
  const today = new Date().toDateString();
  
  const { data: journalEntries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/users", userId, "journal"],
  });

  // Find today's entry
  const todaysEntry = journalEntries.find(entry => 
    new Date(entry.date || '').toDateString() === today
  );

  // Initialize form with today's entry if it exists
  useEffect(() => {
    if (todaysEntry) {
      setTodayEntry({
        gratitude1: todaysEntry.gratitude1 || '',
        gratitude2: todaysEntry.gratitude2 || '',
        gratitude3: todaysEntry.gratitude3 || '',
        highValuePriority1: todaysEntry.highValuePriority1 || '',
        highValuePriority2: todaysEntry.highValuePriority2 || '',
        highValuePriority3: todaysEntry.highValuePriority3 || '',
        highFlowPriority1: todaysEntry.highFlowPriority1 || '',
        highFlowPriority2: todaysEntry.highFlowPriority2 || '',
        highFlowPriority3: todaysEntry.highFlowPriority3 || '',
        scriptingText: todaysEntry.scriptingText || '',
        reflectionText: todaysEntry.reflectionText || '',
        morningCompleted: todaysEntry.morningCompleted || false,
        eveningCompleted: todaysEntry.eveningCompleted || false,
      });
    }
  }, [todaysEntry]);

  const saveMutation = useMutation({
    mutationFn: async (entryData: Partial<InsertJournalEntry>) => {
      if (todaysEntry?.id) {
        // Update existing entry
        await apiRequest("PUT", `/api/users/${userId}/journal/${todaysEntry.id}`, entryData);
      } else {
        // Create new entry
        await apiRequest("POST", `/api/users/${userId}/journal`, entryData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "journal"] });
      toast({
        title: "Journal Saved",
        description: "Your entry has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save journal entry.",
        variant: "destructive",
      });
    },
  });

  const updateField = (field: keyof InsertJournalEntry, value: string | boolean) => {
    setTodayEntry(prev => ({ ...prev, [field]: value }));
  };

  const saveMorningRoutine = async () => {
    await saveMutation.mutateAsync({
      ...todayEntry,
      morningCompleted: true,
    });
  };

  const saveEveningRoutine = async () => {
    await saveMutation.mutateAsync({
      ...todayEntry,
      eveningCompleted: true,
    });
  };

  const startVoiceRecording = async (type: 'morning' | 'evening') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        
        if (type === 'morning') {
          updateField('scriptingVoiceNote', audioUrl);
        } else {
          updateField('reflectionVoiceNote', audioUrl);
        }
        
        setIsRecording(prev => ({ ...prev, [type]: false }));
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(prev => ({ ...prev, [type]: true }));
      
      toast({
        title: "Recording Started",
        description: `Recording your ${type} voice note...`,
      });
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Daily Journal</h2>
        <p className="text-gray-600 mt-1">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <Tabs defaultValue="morning" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="morning" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Morning Routine
            {todayEntry.morningCompleted && <CheckCircle className="h-3 w-3 text-green-600" />}
          </TabsTrigger>
          <TabsTrigger value="evening" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Evening Reflection
            {todayEntry.eveningCompleted && <CheckCircle className="h-3 w-3 text-green-600" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="morning" className="space-y-6 mt-6">
          {/* Gratitude Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                3 Things I'm Grateful For
              </CardTitle>
              <CardDescription>
                Start your day with appreciation and positive energy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((num) => (
                <div key={num}>
                  <Label htmlFor={`gratitude${num}`}>Gratitude {num}</Label>
                  <Input
                    id={`gratitude${num}`}
                    placeholder={`What are you grateful for today? (${num}/3)`}
                    value={todayEntry[`gratitude${num}` as keyof InsertJournalEntry] as string || ''}
                    onChange={(e) => updateField(`gratitude${num}` as keyof InsertJournalEntry, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* High Value Priorities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                3 High Value Priorities
              </CardTitle>
              <CardDescription>
                Important tasks that move you closer to your goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((num) => (
                <div key={num}>
                  <Label htmlFor={`highValue${num}`}>Priority {num}</Label>
                  <Input
                    id={`highValue${num}`}
                    placeholder={`High value task that matters most (${num}/3)`}
                    value={todayEntry[`highValuePriority${num}` as keyof InsertJournalEntry] as string || ''}
                    onChange={(e) => updateField(`highValuePriority${num}` as keyof InsertJournalEntry, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* High Flow Priorities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                3 High Flow Priorities
              </CardTitle>
              <CardDescription>
                Activities that energize you and bring joy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((num) => (
                <div key={num}>
                  <Label htmlFor={`highFlow${num}`}>Flow Priority {num}</Label>
                  <Input
                    id={`highFlow${num}`}
                    placeholder={`Activity that brings you energy (${num}/3)`}
                    value={todayEntry[`highFlowPriority${num}` as keyof InsertJournalEntry] as string || ''}
                    onChange={(e) => updateField(`highFlowPriority${num}` as keyof InsertJournalEntry, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Script the Day */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-purple-500" />
                Script Your Day
              </CardTitle>
              <CardDescription>
                Record or write how you want your day to unfold
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => isRecording.morning ? stopVoiceRecording() : startVoiceRecording('morning')}
                  variant={isRecording.morning ? "destructive" : "outline"}
                  size="sm"
                >
                  {isRecording.morning ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                  {isRecording.morning ? "Stop Recording" : "Record Voice Note"}
                </Button>
                {todayEntry.scriptingVoiceNote && (
                  <Badge variant="secondary">Voice note recorded</Badge>
                )}
              </div>
              
              <div>
                <Label htmlFor="scriptingText">Or write your day script</Label>
                <Textarea
                  id="scriptingText"
                  placeholder="Describe how you want your day to go... What will make it meaningful and successful?"
                  value={todayEntry.scriptingText as string || ''}
                  onChange={(e) => updateField('scriptingText', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={saveMorningRoutine}
            disabled={saveMutation.isPending}
            className="w-full"
            size="lg"
          >
            {todayEntry.morningCompleted ? "Update Morning Routine" : "Complete Morning Routine"}
          </Button>
        </TabsContent>

        <TabsContent value="evening" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-indigo-500" />
                Daily Reflection
              </CardTitle>
              <CardDescription>
                Reflect on your day with awareness and compassion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => isRecording.evening ? stopVoiceRecording() : startVoiceRecording('evening')}
                  variant={isRecording.evening ? "destructive" : "outline"}
                  size="sm"
                >
                  {isRecording.evening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                  {isRecording.evening ? "Stop Recording" : "Record Reflection"}
                </Button>
                {todayEntry.reflectionVoiceNote && (
                  <Badge variant="secondary">Reflection recorded</Badge>
                )}
              </div>
              
              <div>
                <Label htmlFor="reflectionText">Or write your reflection</Label>
                <Textarea
                  id="reflectionText"
                  placeholder="How did your day unfold? What did you learn? What are you grateful for? What would you do differently?"
                  value={todayEntry.reflectionText as string || ''}
                  onChange={(e) => updateField('reflectionText', e.target.value)}
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={saveEveningRoutine}
            disabled={saveMutation.isPending}
            className="w-full"
            size="lg"
          >
            {todayEntry.eveningCompleted ? "Update Evening Reflection" : "Complete Evening Reflection"}
          </Button>
        </TabsContent>
      </Tabs>

      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <span className="text-sm">Morning</span>
                {todayEntry.morningCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span className="text-sm">Evening</span>
                {todayEntry.eveningCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Complete both routines to maximize your mindfulness practice
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}