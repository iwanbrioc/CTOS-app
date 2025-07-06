import React from "react";
import { StatusBar } from "@/components/status-bar";
import { BottomNavigation } from "@/components/bottom-navigation";
import { DailyJournal } from "@/components/daily-journal";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const DEMO_USER_ID = 1;

export default function Journal() {
  return (
    <>
      <StatusBar />
      
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-primary">Daily Journal</h1>
            <p className="text-sm text-muted-foreground">Morning routine & evening reflection</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 pb-24">
        <DailyJournal userId={DEMO_USER_ID} />
      </main>

      <BottomNavigation />
    </>
  );
}