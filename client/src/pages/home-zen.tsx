// Pure zen progress tracking component with no external dependencies
function ZenProgressRings() {
  return (
    <div className="py-8 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl mb-6">
      <div className="text-center mb-6">
        <h2 className="text-lg font-light text-gray-700 mb-2">Your Practice</h2>
        <p className="text-sm text-gray-500">Mindful progress through presence</p>
      </div>
      
      <div className="flex justify-center space-x-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <span className="text-lg font-light text-blue-600">0</span>
          </div>
          <p className="text-xs text-gray-500">Sessions</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <span className="text-lg font-light text-green-600">0%</span>
          </div>
          <p className="text-xs text-gray-500">Progress</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <span className="text-lg font-light text-purple-600">1</span>
          </div>
          <p className="text-xs text-gray-500">Week</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {/* Status Bar */}
      <div className="bg-black text-white text-xs p-2 flex justify-between">
        <span>9:41</span>
        <span>100%</span>
      </div>
      
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">
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
          <h2 className="text-lg font-medium text-gray-600 mb-2">
            Welcome back.
          </h2>
          <p className="text-sm text-gray-500">
            Continue your mindfulness journey.
          </p>
        </div>
        
        {/* Zen Progress Achievement Tracking */}
        <ZenProgressRings />

        {/* Today's Practice */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 mb-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Today's Practice</h3>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-blue-700">Dropping the Balloon</h4>
            <p className="text-sm text-gray-500 mt-1">10 minutes • Week 1</p>
            <div className="mt-3">
              <audio 
                controls 
                className="w-full"
                src="/attached_assets/Grounding 10min_1751647354223.mp3"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Quick Access</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
              <div className="text-green-600 font-medium">Sessions</div>
              <div className="text-xs text-gray-500">View all</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
              <div className="text-purple-600 font-medium">Journal</div>
              <div className="text-xs text-gray-500">Daily reflection</div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <div className="flex flex-col items-center py-2 text-blue-600">
            <span className="text-xs">Home</span>
          </div>
          <div className="flex flex-col items-center py-2 text-gray-400">
            <span className="text-xs">Sessions</span>
          </div>
          <div className="flex flex-col items-center py-2 text-gray-400">
            <span className="text-xs">Journal</span>
          </div>
          <div className="flex flex-col items-center py-2 text-gray-400">
            <span className="text-xs">Profile</span>
          </div>
        </div>
      </nav>
    </div>
  );
}