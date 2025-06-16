import { Card, CardContent } from "@/components/ui/card";

interface ProgressIndicatorProps {
  completedSessions: number;
  totalSessions: number;
  progressPercentage: number;
}

export function ProgressIndicator({ completedSessions, totalSessions, progressPercentage }: ProgressIndicatorProps) {
  return (
    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-primary">Course Progress</h3>
        <span className="text-sm text-muted-foreground">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      <div className="w-full bg-white rounded-full h-2 mb-2">
        <div 
          className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {completedSessions} of {totalSessions} sessions completed
      </p>
    </div>
  );
}
