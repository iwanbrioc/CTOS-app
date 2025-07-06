import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ProgressIndicatorProps {
  completedSessions: number;
  totalSessions: number;
  progressPercentage: number;
}

export function ProgressIndicator({ completedSessions, totalSessions, progressPercentage }: ProgressIndicatorProps) {
  return (
    <div className="px-6 py-4 bg-primary/10 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Course Progress</h3>
        <span className="text-sm font-medium text-foreground">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-3 mb-2">
        <div 
          className="bg-primary h-3 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {completedSessions} of {totalSessions} sessions completed
      </p>
    </div>
  );
}
