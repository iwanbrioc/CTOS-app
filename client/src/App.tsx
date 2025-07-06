import { Switch, Route } from "wouter";
import Home from "@/pages/home-zen";
import Sessions from "@/pages/sessions";
import Journal from "@/pages/journal";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

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
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden">
      <Router />
    </div>
  );
}

export default App;
