import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "@/components/status-bar";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, Heart, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { JournalEntry } from "@shared/schema";

const DEMO_USER_ID = 1;

export default function Journal() {
  const [feeling, setFeeling] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [reflection, setReflection] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/users", DEMO_USER_ID, "journal"],
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: { feeling: string; gratitude: string; reflection: string }) => {
      const response = await apiRequest("POST", `/api/users/${DEMO_USER_ID}/journal`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "journal"] });
      setFeeling("");
      setGratitude("");
      setReflection("");
      toast({
        title: "Entry Saved",
        description: "Your reflection has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!feeling.trim() && !gratitude.trim() && !reflection.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please write something before saving.",
        variant: "destructive",
      });
      return;
    }

    createEntryMutation.mutate({
      feeling: feeling.trim(),
      gratitude: gratitude.trim(),
      reflection: reflection.trim(),
    });
  };

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
            <h1 className="text-xl font-semibold text-primary">Flow Journal</h1>
            <p className="text-sm text-muted-foreground">Mindful Reflection</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 pb-24 space-y-6">
        
        {/* Today's Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Today's Reflection</span>
              <span className="text-sm text-muted-foreground ml-auto">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="feeling" className="flex items-center space-x-2 mb-2">
                <Heart className="h-4 w-4 text-accent" />
                <span>How am I feeling right now?</span>
              </Label>
              <Textarea
                id="feeling"
                placeholder="Express your current emotional state..."
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            
            <div>
              <Label htmlFor="gratitude" className="flex items-center space-x-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span>What am I grateful for today?</span>
              </Label>
              <Textarea
                id="gratitude"
                placeholder="Three things that brought you joy..."
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            
            <div>
              <Label htmlFor="reflection" className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Mindful moments & insights</span>
              </Label>
              <Textarea
                id="reflection"
                placeholder="What did you notice during your practice today?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleSave}
              disabled={createEntryMutation.isPending}
            >
              {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </CardContent>
        </Card>

        {/* Previous Entries */}
        <div>
          <h2 className="text-lg font-semibold text-primary mb-4">Previous Entries</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No journal entries yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start your mindful journaling journey today!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {entries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-primary">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      
                      {entry.feeling && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-1">Feeling</p>
                          <p className="text-sm">{entry.feeling}</p>
                        </div>
                      )}
                      
                      {entry.gratitude && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-1">Gratitude</p>
                          <p className="text-sm">{entry.gratitude}</p>
                        </div>
                      )}
                      
                      {entry.reflection && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Reflection</p>
                          <p className="text-sm">{entry.reflection}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </>
  );
}
