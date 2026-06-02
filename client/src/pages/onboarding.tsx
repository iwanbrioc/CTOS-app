import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserName, markOnboarded } from "@/lib/user-prefs";

interface OnboardingProps {
  onComplete: () => void;
}

interface Slide {
  bg: string;           // Tailwind gradient
  image: string;        // asset path
  label: string;        // small eyebrow label
  title: string;
  body: string;
}

const slides: Slide[] = [
  {
    bg: "from-blue-600 to-indigo-700",
    image: "/attached_assets/CTOS Emblem_1751662222205.png",
    label: "Welcome",
    title: "Coming to Our Senses",
    body: "An 8-week journey into mindfulness — at a pace that suits you. Here's a quick look at everything that's here for you.",
  },
  {
    bg: "from-teal-500 to-cyan-700",
    image: "/attached_assets/dropping the balloon_1750084108019.png",
    label: "Weekly Practice",
    title: "Guided Meditations",
    body: "Each week brings a new guided practice — from grounding and body awareness to moving meditation and turning towards difficulty.",
  },
  {
    bg: "from-violet-500 to-purple-700",
    image: "/attached_assets/what if all there is is this?_1750084108016.png",
    label: "Handy Hacks",
    title: "Quick Mindfulness Moments",
    body: "Short, practical techniques you can use any time — on the bus, at your desk, or wherever life takes you.",
  },
  {
    bg: "from-amber-500 to-orange-600",
    image: "/attached_assets/journaling for flow_1750084108018.png",
    label: "Journal",
    title: "Morning & Evening Rituals",
    body: "A structured journaling space for gratitude, setting intentions, scripting your day, and reflecting each evening.",
  },
  {
    bg: "from-emerald-500 to-green-700",
    image: "/attached_assets/the four pillars_1750084108018.png",
    label: "Your Progress",
    title: "Track Your Journey",
    body: "See your mood shift before and after each practice, earn milestones, and watch your journey unfold over 8 weeks.",
  },
  {
    bg: "from-rose-400 to-pink-600",
    image: "/attached_assets/travellinglighter.jpg",
    label: "Community",
    title: "A Travelling Lighter",
    body: "You're not alone. Join a growing community of people exploring mindfulness in everyday life.",
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
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

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br ${slide.bg} transition-all duration-500`}>

      {/* Skip */}
      <div className="flex justify-end px-6 pt-6">
        <button
          onClick={() => { markOnboarded(); onComplete(); }}
          className="text-white/60 text-sm hover:text-white transition-colors"
        >
          Skip intro
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex flex-col items-center text-center"
          >
            {/* Illustration */}
            <div className="w-52 h-52 mb-8 flex items-center justify-center">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>

            {/* Label */}
            <span className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-3">
              {index === 0 && name ? `Hello, ${name}` : slide.label}
            </span>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
              {slide.title}
            </h2>

            {/* Body */}
            <p className="text-white/80 text-base leading-relaxed max-w-xs">
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="px-8 pb-10 space-y-6">

        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`rounded-full transition-all duration-300 ${
                i === index
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Next / Get started */}
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
