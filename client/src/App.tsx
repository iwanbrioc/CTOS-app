import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MilestoneManager } from "@/components/milestone-achievement";
import { Welcome } from "@/pages/welcome";
import Home from "@/pages/home";
import Sessions from "@/pages/sessions";
import SessionPage from "@/pages/session";
import Journal from "@/pages/journal";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import { isOnboarded } from "@/lib/user-prefs";

function Router() {
  const [onboarded, setOnboarded] = useState(isOnboarded());

  if (!onboarded) {
    return <Welcome onComplete={() => setOnboarded(true)} />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sessions" component={Sessions} />
      <Route path="/session/:id" component={SessionPage} />
      <Route path="/journal" component={Journal} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="max-w-sm mx-auto bg-white dark:bg-gray-950 min-h-screen relative overflow-hidden">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
