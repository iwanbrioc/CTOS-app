import React, { useState, useEffect } from "react";
import { Trophy, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Milestone, UserMilestone } from "@shared/schema";

interface MilestoneAchievementProps {
  milestone: Milestone;
  onClose: () => void;
}

export function MilestoneAchievement({ milestone, onClose }: MilestoneAchievementProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card 
        className={`max-w-sm w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ 
          background: `linear-gradient(135deg, ${milestone.color}20, white)`,
          borderColor: milestone.color 
        }}
      >
        <CardContent className="p-6 text-center space-y-4">
          {/* Close button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="absolute top-2 right-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Animation elements */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <Sparkles className="h-8 w-8 text-yellow-400 mx-auto" />
            </div>
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto relative z-10" />
          </div>

          {/* Achievement content */}
          <div className="space-y-3">
            <Badge 
              variant="secondary" 
              className="text-lg px-4 py-2"
              style={{ backgroundColor: `${milestone.color}20`, color: milestone.color }}
            >
              Achievement Unlocked!
            </Badge>

            <div className="space-y-2">
              <div className="text-4xl">{milestone.badge}</div>
              <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
              <p className="text-gray-600">{milestone.description}</p>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleClose}
                className="w-full"
                style={{ backgroundColor: milestone.color }}
              >
                Continue Journey
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MilestoneManagerProps {
  userId: number;
  children: React.ReactNode;
}

export function MilestoneManager({ userId, children }: MilestoneManagerProps) {
  const [achievedMilestones, setAchievedMilestones] = useState<Milestone[]>([]);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);

  // Function to check for new milestones
  const checkMilestones = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/milestones/check`, {
        method: 'POST',
      });
      const newMilestones = await response.json();
      
      if (newMilestones.length > 0) {
        // Get milestone details for each new achievement
        const milestonesResponse = await fetch('/api/milestones');
        const allMilestones = await milestonesResponse.json();
        
        const newAchievedMilestones = newMilestones.map((um: UserMilestone) => 
          allMilestones.find((m: Milestone) => m.id === um.milestoneId)
        ).filter(Boolean);
        
        setAchievedMilestones(newAchievedMilestones);
        if (newAchievedMilestones.length > 0) {
          setCurrentMilestone(newAchievedMilestones[0]);
        }
      }
    } catch (error) {
      console.error('Failed to check milestones:', error);
    }
  };

  // Expose the check function to be called after session completion
  useEffect(() => {
    (window as any).checkMilestones = checkMilestones;
  }, [userId]);

  const handleMilestoneClose = () => {
    const remaining = achievedMilestones.slice(1);
    setAchievedMilestones(remaining);
    setCurrentMilestone(remaining.length > 0 ? remaining[0] : null);
  };

  return (
    <>
      {children}
      {currentMilestone && (
        <MilestoneAchievement 
          milestone={currentMilestone} 
          onClose={handleMilestoneClose}
        />
      )}
    </>
  );
}