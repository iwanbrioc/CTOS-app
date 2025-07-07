import { } from "react";
import { Button } from "@/components/ui/button";
import { Home, GraduationCap, Book, User } from "lucide-react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/sessions", icon: GraduationCap, label: "Sessions" },
    { path: "/journal", icon: Book, label: "Journal" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-6 py-2">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center py-2 h-auto space-y-1",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
      <div className="w-32 h-1 bg-foreground rounded-full mx-auto mt-2 mb-1"></div>
    </nav>
  );
}
