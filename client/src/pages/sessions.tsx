import { useState } from "react";
import { StatusBar } from "@/components/status-bar";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, ChevronDown, ChevronRight, Clock, Quote } from "lucide-react";
import { Link } from "wouter";
import { sessionData } from "@/lib/session-data";
import { motion, AnimatePresence } from "framer-motion";

export default function Sessions() {
  const [expandedSession, setExpandedSession] = useState<number | null>(null);

  const toggleExpanded = (sessionId: number) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  return (
    <>
      <StatusBar />
      
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-primary">Course Sessions</h1>
            <p className="text-sm text-muted-foreground">8-week Coming to Our Senses journey</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 pb-24 space-y-4">
        {sessionData.map((session) => (
          <Card key={session.id} className="overflow-hidden">
            <CardHeader 
              className={`${session.color} text-white cursor-pointer transition-all duration-200 hover:shadow-lg`}
              onClick={() => toggleExpanded(session.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Session Image */}
                  <div className="flex-shrink-0">
                    <img 
                      src={(() => {
                        const imageMap: Record<string, string> = {
                          "dropping-balloon": "/attached_assets/dropping the balloon_1750084108019.png",
                          "seven-stations-spine": "/attached_assets/seven stations of the spine_1750084108018.png",
                          "the-sense-being-alive": "/attached_assets/the sense of being alive_1750084108017.png",
                          "mind-body-movement": "/attached_assets/mind in body, body in movement, movement in mind_1750084108019.png",
                          "what-if-all-there-is": "/attached_assets/iwan00246_an_illustrative_drawing._Two_figures_are_sitting_on_c_52dacb42-5706-464a-8ebe-3bcde4a039ac_1751664237810.png",
                          "turning-towards-discomfort": "/attached_assets/turning towards discomfort_1750084108017.png",
                          "four-pillars": "/attached_assets/the four pillars_1750084108018.png",
                          "great-smile": "/attached_assets/great smile practice_1750084108019.png"
                        };
                        return imageMap[session.illustration] || "/attached_assets/what if all there is is this?_1751649927283.png";
                      })()}
                      alt={session.title}
                      className="w-16 h-16 object-contain rounded-lg bg-white/10 p-2"
                      onError={(e) => {
                        e.currentTarget.src = `/attached_assets/what if all there is is this?_1751649927283.png`;
                      }}
                    />
                  </div>
                  
                  {/* Title and Badge */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        Week {session.week}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg">
                      {session.title}
                    </CardTitle>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {expandedSession === session.id ? (
                    <ChevronDown className="h-5 w-5 text-white" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>
            </CardHeader>

            <AnimatePresence>
              {expandedSession === session.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <CardContent className="p-6 bg-gray-50">
                    {/* Quote Section */}
                    <div className="mb-6 p-4 bg-white rounded-lg border-l-4 border-gray-300">
                      <div className="flex items-start gap-3">
                        <Quote className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <blockquote className="text-gray-700 italic text-lg leading-relaxed mb-2">
                            "{session.quote}"
                          </blockquote>
                          <cite className="text-gray-500 text-sm font-medium">
                            — {session.author}
                          </cite>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Description */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Session Overview
                      </h3>
                      <div className="prose prose-gray max-w-none space-y-4">
                        {Array.isArray(session.longDescription) ? (
                          session.longDescription.map((paragraph, index) => (
                            <p key={index} className="text-gray-700 leading-relaxed">
                              {paragraph}
                            </p>
                          ))
                        ) : (
                          <p className="text-gray-700 leading-relaxed">
                            {session.longDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Audio Player Section */}
                    <div className="mt-6 p-4 bg-white rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Guided Practice</h4>
                        <Badge variant="outline" className="text-xs">
                          {session.duration} minutes
                        </Badge>
                      </div>
                      
                      <audio 
                        controls 
                        className="w-full"
                        preload="metadata"
                      >
                        <source src={session.audioSrc} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}

        {/* Course Completion Message */}
        <Card className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              Complete Your 8-Week Journey
            </h3>
            <p className="text-indigo-700 text-sm">
              Each session builds upon the previous, creating a comprehensive mindfulness practice 
              that integrates creative challenges, guided meditation, and flow journaling.
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </>
  );
}