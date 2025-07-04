import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MilestoneManager } from "@/components/milestone-achievement";
import Home from "@/pages/home";
import Sessions from "@/pages/sessions";
import Journal from "@/pages/journal";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

const DEMO_USER_ID = 1;

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sessions" component={Sessions} />
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
        <MilestoneManager userId={DEMO_USER_ID}>
          <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden">
            <Toaster />
            <Router />
          </div>
        </MilestoneManager>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
