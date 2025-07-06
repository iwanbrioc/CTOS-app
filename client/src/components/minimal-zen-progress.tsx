export function MinimalZenProgress() {
  return (
    <div className="py-8 bg-gradient-to-b from-background to-muted/20 rounded-xl">
      <div className="text-center mb-6">
        <h2 className="text-lg font-light text-foreground mb-2">Your Practice</h2>
        <p className="text-sm text-muted-foreground">Mindful progress through presence</p>
      </div>
      
      <div className="flex justify-center space-x-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <span className="text-lg font-light text-blue-600">0</span>
          </div>
          <p className="text-xs text-muted-foreground">Sessions</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <span className="text-lg font-light text-green-600">0%</span>
          </div>
          <p className="text-xs text-muted-foreground">Progress</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <span className="text-lg font-light text-purple-600">1</span>
          </div>
          <p className="text-xs text-muted-foreground">Week</p>
        </div>
      </div>
      
      <div className="text-center mt-6 px-6">
        <p className="text-sm text-muted-foreground italic font-light">
          "The present moment is the only moment available to us"
        </p>
      </div>
    </div>
  );
}