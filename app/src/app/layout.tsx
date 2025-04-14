import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Monday Morning Readout",
  description: "Track and visualize your team's progress",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="h-screen bg-background flex flex-col">
            <header className="border-b">
              <div className="flex h-16 items-center px-4">
                <h1 className="text-2xl font-bold">Monday Morning Readout</h1>
              </div>
            </header>
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
