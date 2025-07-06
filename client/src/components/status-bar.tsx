import React from "react";

export function StatusBar() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: false 
  });

  return (
    <div className="flex justify-between items-center px-6 py-2 text-sm font-medium bg-white status-bar">
      <span>{timeString}</span>
      <div className="flex items-center space-x-1 text-xs">
        <div className="flex space-x-1">
          <div className="w-1 h-3 bg-primary rounded-full"></div>
          <div className="w-1 h-3 bg-primary rounded-full"></div>
          <div className="w-1 h-3 bg-primary rounded-full"></div>
          <div className="w-1 h-3 bg-muted rounded-full"></div>
        </div>
        <div className="w-4 h-4 border border-primary rounded-sm flex items-center justify-center">
          <div className="w-2 h-2 bg-success rounded-full"></div>
        </div>
        <div className="w-6 h-3 border border-primary rounded-sm">
          <div className="w-4 h-1 bg-primary rounded-full mt-1 ml-0.5"></div>
        </div>
      </div>
    </div>
  );
}
