import React, { createContext, useContext, useState, useEffect } from "react";
import * as authService from "@/services/auth";
import * as driverService from "@/services/driver";
import type { Driver, DutyStatus } from "@/types/driver";

interface AuthContextType {
  driver: Driver | null;
  token: string | null;
  isLoading: boolean;
  login: (emailOrPhone: string) => Promise<void>;
  logout: () => Promise<void>;
  updateStatus: (status: DutyStatus | 'online' | 'offline' | 'on_break') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  driver: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  updateStatus: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const session = await authService.restoreSession();
        if (session.token) {
          setToken(session.token);
          if (session.driver) {
            setDriver(session.driver);
          } else {
            const fetched = await authService.fetchCurrentDriver();
            setDriver(fetched);
          }
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (identifier: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ employeeIdOrPhone: identifier, password: "password123" });
      if (res.token) {
        setToken(res.token);
        const profile = await authService.fetchCurrentDriver();
        setDriver(profile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setToken(null);
      setDriver(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus: DutyStatus | 'online' | 'offline' | 'on_break') => {
    if (!driver) return;
    try {
      await driverService.setDutyStatus(newStatus);
      setDriver((prev) => (prev ? { ...prev, dutyStatus: newStatus as DutyStatus } : null));
    } catch (err: any) {
      alert(err.message || "Failed to update driver status.");
    }
  };

  return (
    <AuthContext.Provider value={{ driver, token, isLoading, login, logout, updateStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
