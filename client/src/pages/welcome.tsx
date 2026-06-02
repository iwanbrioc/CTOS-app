import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setUserName, markOnboarded } from "@/lib/user-prefs";

interface WelcomeProps {
  onComplete: () => void;
}

export function Welcome({ onComplete }: WelcomeProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleBegin = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name to continue");
      return;
    }
    setUserName(trimmed);
    markOnboarded();
    onComplete();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-white">
      {/* Logo */}
      <img
        src="/attached_assets/CTOS Emblem_1751662222205.png"
        alt="Coming to Our Senses"
        className="w-20 h-20 mb-8"
      />

      <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">
        Welcome
      </h1>
      <p className="text-gray-500 text-center mb-10 leading-relaxed">
        What would you like to be called?
      </p>

      <div className="w-full max-w-xs space-y-4">
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => { setName(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleBegin()}
          className="text-center text-lg h-12"
          autoFocus
          autoCapitalize="words"
          autoComplete="given-name"
        />

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <Button
          onClick={handleBegin}
          disabled={!name.trim()}
          className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
        >
          Begin my journey
        </Button>
      </div>

      <p className="text-xs text-gray-400 mt-8 text-center max-w-xs">
        Your name is stored only on this device and is never shared.
      </p>
    </div>
  );
}
