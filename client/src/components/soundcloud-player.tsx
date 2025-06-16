import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Volume2 } from "lucide-react";
import type { Session } from "@shared/schema";

interface SoundCloudPlayerProps {
  session: Session;
  onClose: () => void;
}

export function SoundCloudPlayer({ session, onClose }: SoundCloudPlayerProps) {
  // For demo purposes, using a working SoundCloud track
  // In production, replace with actual course meditation tracks
  const embedUrl = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true`;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <Card className="shadow-lg card-elegant">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-foreground text-sm">
              {session.title}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* SoundCloud Player Embed */}
          <div className="w-full rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="150"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={embedUrl}
              title={`${session.title} - Guided Meditation`}
            />
          </div>
          
          <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <Volume2 className="h-3 w-3" />
            <span>Week {session.week} • {session.duration} min guided meditation</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}