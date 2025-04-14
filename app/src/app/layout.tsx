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
          <div className="min-h-screen bg-background">
            <header className="border-b">
              <div className="container flex h-16 items-center px-4">
                <h1 className="text-2xl font-bold">Monday Morning Readout</h1>
              </div>
            </header>
            <main className="container mx-auto p-4">{children}</main>
            <footer className="border-t">
              <div className="container flex h-16 items-center px-4 text-sm text-muted-foreground">
                Built with ❤️ in Berlin
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
