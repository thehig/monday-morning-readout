"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isLoginPage = pathname === "/login";

    if (!isAuthenticated && !isLoginPage) {
      router.push("/login");
    }

    if (isAuthenticated && isLoginPage) {
      router.push("/");
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
}
