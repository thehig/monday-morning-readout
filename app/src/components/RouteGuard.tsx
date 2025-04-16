"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    console.log("RouteGuard: Checking route", {
      isAuthenticated,
      isLoading,
      pathname,
      isCheckingAuth,
    });

    const isLoginPage = pathname === "/login";

    if (!isLoading) {
      if (!isAuthenticated && !isLoginPage) {
        console.log("RouteGuard: Not authenticated, redirecting to login");
        router.push("/login");
      } else if (isAuthenticated && isLoginPage) {
        console.log("RouteGuard: Already authenticated, redirecting to home");
        router.push("/");
      } else {
        console.log("RouteGuard: Route access allowed");
      }
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (error) {
    console.error("RouteGuard: Authentication error:", error);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">
          Authentication error: {error.message}
        </div>
      </div>
    );
  }

  if (isCheckingAuth) {
    console.log("RouteGuard: Showing loading state");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Checking authentication...</div>
      </div>
    );
  }

  return <>{children}</>;
}
