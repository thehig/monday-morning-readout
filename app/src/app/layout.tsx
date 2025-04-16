"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { WeekPicker } from "@/components/WeekPicker";
import { getCurrentWeek } from "@/hooks/use-po-feedback";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());

  useEffect(() => {
    document.title = "Monday Morning Readout";
  }, []);

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
    router.push(`?week=${week}`);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">Monday Morning Readout</h1>
          <WeekPicker
            currentWeek={selectedWeek}
            onWeekChange={handleWeekChange}
          />
        </div>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Monday Morning Readout</title>
        <meta
          name="description"
          content="Track and visualize your team's progress"
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <Suspense fallback={<div>Loading...</div>}>
            <LayoutContent>{children}</LayoutContent>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
