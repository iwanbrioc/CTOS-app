import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Volume2 } from "lucide-react";
import type { Session } from "@shared/schema";

interface SoundCloudPlayerProps {
  session: Session;
  onClose: () => void;
}

export function SoundCloudPlayer({ session, onClose }: SoundCloudPlayerProps) {
  // Using working SoundCloud meditation tracks
  const meditationTracks: Record<number, string> = {
    1: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&color=%23003366&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false",
    2: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&color=%23003366&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false",
    3: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&color=%23003366&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false",
    4: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&color=%23003366&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false",
    5: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&color=%23003366&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false",
    6: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&color=%23003366&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false",
    7: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&color=%23003366&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false",
    8: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&color=%23003366&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false"
  };
  
  const embedUrl = meditationTracks[session.week] || meditationTracks[1];

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