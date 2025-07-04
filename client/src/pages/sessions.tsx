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
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      Week {session.week}
                    </Badge>
                    <div className="flex items-center gap-1 text-white/90">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{session.duration} min</span>
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg mb-1">
                    {session.title}
                  </CardTitle>
                  <CardDescription className="text-white/90 text-sm">
                    {session.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle play action here
                    }}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Play
                  </Button>
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
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                          {session.longDescription}
                        </p>
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