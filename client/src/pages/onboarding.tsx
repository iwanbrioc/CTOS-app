import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getUserName, markOnboarded } from "@/lib/user-prefs";
import {
  requestNotificationPermission,
  scheduleUserReminders,
} from "@/lib/notification-service";

interface OnboardingProps {
  onComplete: () => void;
}

// ── Slide definitions ────────────────────────────────────────────────────────

type SlideType = "content" | "alerts";

interface ContentSlide {
  type: "content";
  bg: string;
  image: string;
  label: string;
  title: string;
  body: string;
}

interface AlertsSlide {
  type: "alerts";
  bg: string;
}

type Slide = ContentSlide | AlertsSlide;

const slides: Slide[] = [
  {
    type: "content",
    bg: "from-blue-700 via-indigo-600 to-violet-800",
    image: "/attached_assets/CTOS Emblem_1751662222205.png",
    label: "Welcome",
    title: "Coming to Our Senses",
    body: "An 8-week journey into creative mindfulness — at a pace that suits you. Here's a quick look at everything that's here for you.",
  },
  {
    type: "content",
    bg: "from-teal-500 via-cyan-600 to-teal-800",
    image: "/attached_assets/dropping the balloon_1750084108019.png",
    label: "Weekly Practice",
    title: "Guided Meditations",
    body: "Each week brings a new guided practice — from grounding and body awareness to turning towards difficulty, to strengthen the four pillars on which your mental health rests.",
  },
  {
    type: "content",
    bg: "from-violet-500 via-purple-600 to-indigo-800",
    image: "/attached_assets/great smile practice_1750084108019.png",
    label: "Handy Hacks",
    title: "Quick Creative Mindfulness Moments",
    body: "Short, practical techniques you can use any time — on the bus, at your desk, or wherever life takes you.",
  },
  {
    type: "content",
    bg: "from-amber-500 via-orange-500 to-rose-700",
    image: "/attached_assets/journaling for flow_1750084108018.png",
    label: "Journal",
    title: "Morning & Evening Rituals",
    body: "A structured journaling space for gratitude, setting intentions, scripting your day, and reflecting each evening.",
  },
  {
    type: "content",
    bg: "from-emerald-500 via-teal-600 to-green-800",
    image: "/attached_assets/the four pillars_1750084108018.png",
    label: "Your Progress",
    title: "Track Your Journey",
    body: "See your mood shift before and after each practice, earn milestones, and watch your journey unfold over 8 weeks.",
  },
  {
    type: "content",
    bg: "from-rose-400 via-pink-500 to-fuchsia-700",
    image: "/attached_assets/travellinglighter.jpg",
    label: "Community",
    title: "A Travelling Lighter",
    body: "You're not alone. Join a growing community of people exploring creative mindfulness in everyday life.",
  },
  {
    type: "alerts",
    bg: "from-sky-500 via-blue-600 to-indigo-700",
  },
];

// ── Alert slide component ────────────────────────────────────────────────────

const DAYS = [
  { value: 1, short: "Mon" },
  { value: 2, short: "Tue" },
  { value: 3, short: "Wed" },
  { value: 4, short: "Thu" },
  { value: 5, short: "Fri" },
  { value: 6, short: "Sat" },
  { value: 0, short: "Sun" },
];

const TIME_OPTIONS = [
  "06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30",
  "10:00","10:30","11:00","12:00","13:00","14:00","15:00","16:00",
  "17:00","18:00","19:00","20:00","21:00",
];

function AlertsSlideContent() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("09:00");
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [saved, setSaved] = useState(false);

  const toggleDay = (d: number) =>
    setDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort()
    );

  const handleSave = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      await scheduleUserReminders("1", time, days, true);
    }
    setSaved(true);
  };

  const handleToggle = async (val: boolean) => {
    setEnabled(val);
    if (!val) {
      await scheduleUserReminders("1", time, days, false);
      setSaved(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center w-full">
      {/* Icon */}
      <div className="w-20 h-20 mb-6 rounded-full bg-white/20 flex items-center justify-center">
        {enabled ? (
          <Bell className="w-10 h-10 text-white" />
        ) : (
          <BellOff className="w-10 h-10 text-white/60" />
        )}
      </div>

      <span className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-3">
        Practice Reminders
      </span>
      <h2 className="text-2xl font-bold text-white mb-2">
        Set Your Alerts
      </h2>
      <p className="text-white/75 text-sm mb-6 max-w-xs">
        A gentle nudge at the right time helps build a lasting creative mindfulness practice.
      </p>

      {/* Toggle */}
      <div className="flex items-center gap-3 bg-white/15 rounded-2xl px-5 py-3 mb-5 w-full max-w-xs">
        <span className="text-white text-sm font-medium flex-1 text-left">
          Remind me to practice
        </span>
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-white/40"
        />
      </div>

      {enabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs space-y-4"
        >
          {/* Time picker */}
          <div className="bg-white/15 rounded-2xl px-4 py-3">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2 text-left">
              Time
            </p>
            <select
              value={time}
              onChange={e => { setTime(e.target.value); setSaved(false); }}
              className="w-full bg-transparent text-white text-base font-medium outline-none appearance-none text-center"
            >
              {TIME_OPTIONS.map(t => (
                <option key={t} value={t} className="text-gray-900">{t}</option>
              ))}
            </select>
          </div>

          {/* Day chips */}
          <div className="bg-white/15 rounded-2xl px-4 py-3">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-3 text-left">
              Days
            </p>
            <div className="flex justify-between gap-1">
              {DAYS.map(d => (
                <button
                  key={d.value}
                  onClick={() => { toggleDay(d.value); setSaved(false); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    days.includes(d.value)
                      ? "bg-white text-blue-700"
                      : "bg-white/20 text-white/70"
                  }`}
                >
                  {d.short}
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          {!saved ? (
            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-white/25 hover:bg-white/35 text-white text-sm font-semibold transition-all border border-white/30"
            >
              Save reminders
            </button>
          ) : (
            <p className="text-white/80 text-sm font-medium py-2">
              ✓ Reminders set for {time}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ── Main onboarding component ────────────────────────────────────────────────

export function Onboarding({ onComplete }: OnboardingProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const name = getUserName();

  const go = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  const handleNext = () => {
    if (index < slides.length - 1) {
      go(index + 1);
    } else {
      markOnboarded();
      onComplete();
    }
  };

  const slide = slides[index];
  const isLast = index === slides.length - 1;
  const bg = slide.bg;

  return (
    <div className={`min-h-screen w-full flex flex-col bg-gradient-to-br ${bg} transition-all duration-700 relative overflow-hidden`}>

      {/* Full-bleed illustration — fades between slides independently */}
      <AnimatePresence mode="wait">
        {slide.type === "content" && (
          <motion.img
            key={`bg-${index}`}
            src={(slide as ContentSlide).image}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute top-0 right-0 h-full w-auto object-cover mix-blend-multiply pointer-events-none"
            style={{ opacity: 0.22 }}
          />
        )}
      </AnimatePresence>

      {/* Bottom gradient — keeps text readable over the image */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

      {/* Skip */}
      <div className="relative flex justify-end px-6 pt-6 z-10">
        <button
          onClick={() => { markOnboarded(); onComplete(); }}
          className="text-white/60 text-sm hover:text-white transition-colors"
        >
          Skip intro
        </button>
      </div>

      {/* Slide content */}
      <div className="relative flex-1 flex flex-col items-end justify-end px-8 pb-4 z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex flex-col items-start text-left w-full"
          >
            {slide.type === "alerts" ? (
              <div className="w-full flex flex-col items-center text-center">
                <AlertsSlideContent />
              </div>
            ) : (
              <>
                <span className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-3 drop-shadow-sm">
                  {index === 0 && name ? `Hello, ${name}` : slide.label}
                </span>
                <h2 className="text-3xl font-bold text-white mb-3 leading-tight drop-shadow-md">
                  {slide.title}
                </h2>
                <p className="text-white/85 text-base leading-relaxed max-w-xs drop-shadow-sm">
                  {slide.body}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="relative px-8 pb-10 pt-4 space-y-5 shrink-0 z-10">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`rounded-full transition-all duration-300 ${
                i === index ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Next / Begin */}
        <Button
          onClick={handleNext}
          className="w-full h-12 text-base font-semibold bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
        >
          {isLast ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Begin my journey
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
