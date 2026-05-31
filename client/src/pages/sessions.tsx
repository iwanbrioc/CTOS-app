import { useState } from "react";
import { StatusBar } from "@/components/status-bar";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronDown, ChevronRight, Quote, Headphones } from "lucide-react";
import { Link } from "wouter";
import { sessionData } from "@/lib/session-data";
import { motion, AnimatePresence } from "framer-motion";

const isSoundCloudUrl = (url: string) => url.includes("soundcloud.com");

const toSoundCloudEmbed = (url: string) =>
  `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23667eea&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`;

export default function Sessions() {
  const [expandedSession, setExpandedSession] = useState<number | null>(null);

  const toggleExpanded = (sessionId: number) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  return (
    <>
      <StatusBar />
      
      {/* Header */}
      <header className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Course Sessions</h1>
            <p className="text-xs text-gray-500">8-week Coming to Our Senses • tap to expand</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 pb-24 space-y-3">
        {sessionData.map((session) => (
          <Card key={session.id} className="overflow-hidden">
            <CardHeader
              className={`${session.color} text-white cursor-pointer transition-all duration-200 active:opacity-90 p-4`}
              onClick={() => toggleExpanded(session.id)}
            >
              <div className="flex items-center gap-3">
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
                        "four-pillars": "/attached_assets/journaling for flow_1751664270006.png",
                        "journaling-flow": "/attached_assets/journaling for flow_1751664270006.png",
                        "great-smile": "/attached_assets/iwan00246_an_illustrative_drawing_of_a_figure_standing_infront__14bcc794-4d7f-4138-90e3-b0216262e521_1751664292207.png"
                      };
                      return imageMap[session.illustration] || "/attached_assets/what if all there is is this?_1751649927283.png";
                    })()}
                    alt={session.title}
                    className="w-14 h-14 object-contain rounded-xl bg-white/15 p-1.5"
                    onError={(e) => {
                      e.currentTarget.src = `/attached_assets/what if all there is is this?_1751649927283.png`;
                    }}
                  />
                </div>

                {/* Title, Badge, and Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs px-2 py-0">
                      Week {session.week}
                    </Badge>
                    <span className="text-white/60 text-xs">{session.duration} min</span>
                  </div>
                  <CardTitle className="text-white text-base leading-tight">
                    {session.title}
                  </CardTitle>
                  {expandedSession !== session.id && (
                    <p className="text-white/70 text-xs mt-1 truncate">
                      {session.description}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 ml-1">
                  {expandedSession === session.id ? (
                    <ChevronDown className="h-5 w-5 text-white/80" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-white/80" />
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
                  <CardContent className="p-4 bg-gray-50">
                    {/* Quote Section */}
                    <div className="mb-5 p-4 bg-white rounded-xl border-l-4 border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Quote className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
                        <div>
                          <blockquote className="text-gray-700 italic text-sm leading-relaxed mb-2">
                            "{session.quote}"
                          </blockquote>
                          <cite className="text-gray-400 text-xs font-medium not-italic">
                            — {session.author}
                          </cite>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Description */}
                    <div className="space-y-3 mb-5">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                        Session Overview
                      </h3>
                      <div className="space-y-3">
                        {Array.isArray(session.longDescription) ? (
                          session.longDescription.map((paragraph, index) => (
                            <p key={index} className="text-gray-700 text-sm leading-relaxed">
                              {paragraph}
                            </p>
                          ))
                        ) : (
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {session.longDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Audio Player Section */}
                    <div className="mt-6 p-4 bg-white rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Headphones className="h-4 w-4 text-gray-500" />
                          <h4 className="font-medium text-gray-900">Guided Practice</h4>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {session.duration} min
                        </Badge>
                      </div>

                      {isSoundCloudUrl(session.audioSrc) ? (
                        <iframe
                          width="100%"
                          height="100"
                          scrolling="no"
                          frameBorder="no"
                          allow="autoplay"
                          src={toSoundCloudEmbed(session.audioSrc)}
                          title={session.title}
                          className="rounded-lg"
                        />
                      ) : (
                        <audio
                          controls
                          className="w-full"
                          preload="metadata"
                          style={{ height: 40 }}
                        >
                          <source src={session.audioSrc} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      )}
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