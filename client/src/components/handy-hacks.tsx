import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { HandyHack, User } from "@shared/schema";

interface HandyHacksProps {
  userId: number;
}

export function HandyHacks({ userId }: HandyHacksProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
  });

  const { data: allHacks } = useQuery<HandyHack[]>({
    queryKey: ["/api/handy-hacks"],
  });

  // Get the current week's hack based on user progress
  const currentWeek = user?.currentWeek || 1;
  const currentHack = allHacks?.find(hack => {
    const weekMapping: Record<string, number> = {
      "week-1": 1,
      "week-2": 2, 
      "week-3": 3,
      "week-4": 4,
      "week-5": 5,
      "week-6": 6,
      "week-7": 7,
      "week-8": 8,
    };
    return weekMapping[hack.category] === currentWeek;
  });

  const completeHackMutation = useMutation({
    mutationFn: async (hackId: number) => {
      await apiRequest("POST", `/api/users/${userId}/hacks/${hackId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "hack-completions"] });
      toast({
        title: "Great job!",
        description: "Handy hack completed. Keep up the mindful practice!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark hack as complete. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMarkComplete = () => {
    if (currentHack) {
      completeHackMutation.mutate(currentHack.id);
    }
  };

  if (!currentHack) {
    return null;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-4">Handy Hacks</h2>
      <Card className="card-elegant bg-gradient-to-br from-secondary to-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">{currentHack.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 subtitle">
                {currentHack.description}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-muted p-0 h-auto font-medium"
                onClick={handleMarkComplete}
                disabled={completeHackMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {completeHackMutation.isPending ? "Marking..." : "Mark as Done"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
