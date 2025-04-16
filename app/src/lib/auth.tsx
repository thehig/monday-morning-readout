"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

if (!process.env.NEXT_PUBLIC_AUTH_PASSWORD?.trim()) {
  throw new Error(
    "NEXT_PUBLIC_AUTH_PASSWORD environment variable is not set or is empty"
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Check if there's a stored auth state
      const storedAuth = localStorage.getItem("isAuthenticated");
      if (storedAuth === "true") {
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to check authentication")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (password: string) => {
    try {
      if (password === process.env.NEXT_PUBLIC_AUTH_PASSWORD?.trim()) {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to login"));
      return false;
    }
  };

  const logout = () => {
    try {
      setIsAuthenticated(false);
      localStorage.removeItem("isAuthenticated");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to logout"));
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, error, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
