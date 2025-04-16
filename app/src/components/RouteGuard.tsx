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
    const isLoginPage = pathname === "/login";

    if (!isLoading) {
      if (!isAuthenticated && !isLoginPage) {
        router.push("/login");
      } else if (isAuthenticated && isLoginPage) {
        router.push("/");
      }
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">
          Authentication error: {error.message}
        </div>
      </div>
    );
  }

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Checking authentication...</div>
      </div>
    );
  }

  return <>{children}</>;
}
