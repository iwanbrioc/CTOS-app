import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { HandyHack } from "@shared/schema";

interface HandyHacksProps {
  userId: number;
}

export function HandyHacks({ userId }: HandyHacksProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentHack } = useQuery<HandyHack>({
    queryKey: ["/api/handy-hacks/random"],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
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
      <h2 className="text-lg font-semibold text-primary mb-4">Handy Hacks</h2>
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-5 w-5 text-yellow-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-primary mb-2">{currentHack.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {currentHack.description}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100 p-0 h-auto"
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
