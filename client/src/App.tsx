import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Welcome } from "@/pages/welcome";
import { Onboarding } from "@/pages/onboarding";
import Home from "@/pages/home";
import Sessions from "@/pages/sessions";
import SessionPage from "@/pages/session";
import Journal from "@/pages/journal";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import { isOnboarded } from "@/lib/user-prefs";

type Stage = "welcome" | "onboarding" | "app";

function App() {
  const [stage, setStage] = useState<Stage>(
    isOnboarded() ? "app" : "welcome"
  );

  // Welcome and Onboarding render full-screen — no constrained white container
  if (stage === "welcome") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Welcome onComplete={() => setStage("onboarding")} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (stage === "onboarding") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Onboarding onComplete={() => setStage("app")} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="max-w-sm mx-auto bg-white dark:bg-gray-950 min-h-screen relative overflow-hidden">
          <Toaster />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/sessions" component={Sessions} />
            <Route path="/session/:id" component={SessionPage} />
            <Route path="/journal" component={Journal} />
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
