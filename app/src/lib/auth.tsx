"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { initializeSupabase } from "./supabaseClient";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Check if there's a stored auth state and password
      const storedAuth = localStorage.getItem("isAuthenticated");
      const storedPassword = localStorage.getItem("authPassword");

      if (storedAuth === "true" && storedPassword) {
        // Verify the stored password still works
        if (initializeSupabase(storedPassword)) {
          setIsAuthenticated(true);
        } else {
          // Invalid stored password, clear storage
          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("authPassword");
        }
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
      if (initializeSupabase(password)) {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("authPassword", password);
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
      localStorage.removeItem("authPassword");
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
