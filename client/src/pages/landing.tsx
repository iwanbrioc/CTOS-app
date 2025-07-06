import { Button } from "@/components/ui/button";

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-8">
          <img 
            src="/attached_assets/CTOS Emblem_1751662222205.png" 
            alt="Coming to Our Senses" 
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Coming to Our Senses
          </h1>
          <p className="text-gray-600">
            8-Week Mindfulness Journey
          </p>
        </div>
        
        <div className="space-y-6 mb-8">
          <div className="text-left space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                Transform your relationship with technology and develop deeper awareness
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                8 weeks of guided meditation sessions with authentic teachings
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                Daily journaling with structured morning and evening routines
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                Progress tracking with visual milestones and practice reminders
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => window.location.href = '/api/login'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
        >
          Begin Your Journey
        </Button>
        
        <p className="text-sm text-gray-500 mt-4">
          Sign in with your Replit account to get started
        </p>
      </div>
    </div>
  );
}