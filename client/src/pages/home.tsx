export default function Home() {
  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {/* Simple Status Bar */}
      <div className="bg-black text-white text-xs p-2 flex justify-between">
        <span>9:41</span>
        <span>100%</span>
      </div>
      
      {/* Header */}
      <header className="px-6 py-4 bg-background border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              <div>Coming to</div>
              <div>Our Senses</div>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-20">
        {/* Welcome Message */}
        <div className="text-center py-4">
          <h2 className="text-lg font-medium text-muted-foreground mb-2">
            Welcome back.
          </h2>
          <p className="text-sm text-muted-foreground">
            Continue your mindfulness journey.
          </p>
        </div>
        
        {/* Zen Progress Achievement Tracking */}
        <div className="py-8 bg-gradient-to-b from-background to-muted/20 rounded-xl mb-6">
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

        {/* Today's Practice */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 mb-6">
          <h3 className="text-lg font-semibold text-primary mb-2">Today's Practice</h3>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-primary">Dropping the Balloon</h4>
            <p className="text-sm text-muted-foreground mt-1">10 minutes</p>
            <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
              Start Practice
            </button>
          </div>
        </div>

        {/* Quick Access */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Quick Access</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-green-600 font-medium">Sessions</div>
              <div className="text-xs text-muted-foreground">View all</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-purple-600 font-medium">Journal</div>
              <div className="text-xs text-muted-foreground">Daily reflection</div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-border">
        <div className="flex justify-around py-2">
          <div className="flex flex-col items-center py-2 text-primary">
            <span className="text-xs">Home</span>
          </div>
          <div className="flex flex-col items-center py-2 text-muted-foreground">
            <span className="text-xs">Sessions</span>
          </div>
          <div className="flex flex-col items-center py-2 text-muted-foreground">
            <span className="text-xs">Journal</span>
          </div>
          <div className="flex flex-col items-center py-2 text-muted-foreground">
            <span className="text-xs">Profile</span>
          </div>
        </div>
      </nav>
    </div>
  );
}