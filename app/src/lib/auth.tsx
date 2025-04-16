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
    console.log("AuthProvider: Starting authentication check");
    try {
      // Check if there's a stored auth state and password
      const storedAuth = localStorage.getItem("isAuthenticated");
      const storedPassword = localStorage.getItem("authPassword");
      console.log("AuthProvider: Found stored auth:", {
        storedAuth,
        hasStoredPassword: !!storedPassword,
      });

      if (storedAuth === "true" && storedPassword) {
        console.log(
          "AuthProvider: Attempting to initialize Supabase with stored password"
        );
        // Verify the stored password still works
        if (initializeSupabase(storedPassword)) {
          console.log("AuthProvider: Successfully initialized Supabase");
          setIsAuthenticated(true);
        } else {
          console.log(
            "AuthProvider: Failed to initialize Supabase with stored password"
          );
          // Invalid stored password, clear storage
          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("authPassword");
        }
      } else {
        console.log("AuthProvider: No stored credentials found");
      }
    } catch (err) {
      console.error("AuthProvider: Error during authentication check:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to check authentication")
      );
    } finally {
      console.log("AuthProvider: Finished authentication check");
      setIsLoading(false);
    }
  }, []);

  const login = (password: string) => {
    console.log("AuthProvider: Attempting login");
    try {
      if (initializeSupabase(password)) {
        console.log("AuthProvider: Login successful");
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("authPassword", password);
        setError(null);
        return true;
      }
      console.log("AuthProvider: Login failed - invalid password");
      return false;
    } catch (err) {
      console.error("AuthProvider: Login error:", err);
      setError(err instanceof Error ? err : new Error("Failed to login"));
      return false;
    }
  };

  const logout = () => {
    console.log("AuthProvider: Logging out");
    try {
      setIsAuthenticated(false);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("authPassword");
      setError(null);
    } catch (err) {
      console.error("AuthProvider: Logout error:", err);
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
