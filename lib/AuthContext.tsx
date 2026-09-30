"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "CONSTABLE" | "INSPECTOR" | "SUPERINTENDENT" | "ADMIN";

export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  badgeNumber?: string;
  department?: string;
}

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  userId: string;
  user: MockUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("INSPECTOR");
  const [userId, setUserId] = useState<string>("U10943");
  const [user, setUser] = useState<MockUser | null>({
    id: "U10943",
    firstName: "Er. K. P.",
    lastName: "Bhat",
    email: "swm.engineer@udupicity.gov.in",
    role: "INSPECTOR",
    badgeNumber: "CMC-SWM-4092",
    department: "Solid Waste Management Division - Udupi City Municipal Council"
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("udupi_swms_role") as Role;
      if (savedRole && ["CONSTABLE", "INSPECTOR", "SUPERINTENDENT", "ADMIN"].includes(savedRole)) {
        setRoleState(savedRole);
        if (user) setUser((prev) => prev ? { ...prev, role: savedRole } : null);
      }
    }
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("udupi_swms_role", newRole);
    }
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider value={{ role, setRole, userId, user }}>
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
