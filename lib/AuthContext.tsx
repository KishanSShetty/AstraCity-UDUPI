"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "CONSTABLE" | "INSPECTOR" | "SUPERINTENDENT" | "ADMIN" | "CITIZEN";

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
  isAdmin: boolean;
  isCitizen: boolean;
  loginAsAdmin: () => void;
  loginAsCitizen: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USER: MockUser = {
  id: "U10943",
  firstName: "Er. K. P.",
  lastName: "Bhat",
  email: "swm.engineer@udupicity.gov.in",
  role: "ADMIN",
  badgeNumber: "CMC-SWM-4092",
  department: "Solid Waste Management Division - Udupi City Municipal Council"
};

const CITIZEN_USER: MockUser = {
  id: "C-9042",
  firstName: "Citizen",
  lastName: "Resident",
  email: "resident@udupicity.gov.in",
  role: "CITIZEN",
  badgeNumber: "WARD-04-CITIZEN",
  department: "Udupi Ward 4 (Malpe Coastal Sector)"
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("ADMIN");
  const [userId, setUserId] = useState<string>("U10943");
  const [user, setUser] = useState<MockUser | null>(ADMIN_USER);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("udupi_swms_role") as Role;
      if (savedRole && ["CONSTABLE", "INSPECTOR", "SUPERINTENDENT", "ADMIN", "CITIZEN"].includes(savedRole)) {
        setRoleState(savedRole);
        if (savedRole === "CITIZEN") {
          setUser(CITIZEN_USER);
          setUserId(CITIZEN_USER.id);
        } else {
          setUser({ ...ADMIN_USER, role: savedRole });
          setUserId(ADMIN_USER.id);
        }
      }
    }
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("udupi_swms_role", newRole);
    }
    if (newRole === "CITIZEN") {
      setUser(CITIZEN_USER);
      setUserId(CITIZEN_USER.id);
    } else {
      setUser({ ...ADMIN_USER, role: newRole });
      setUserId(ADMIN_USER.id);
    }
  };

  const loginAsAdmin = () => {
    setRole("ADMIN");
  };

  const loginAsCitizen = () => {
    setRole("CITIZEN");
  };

  const logout = () => {
    setRole("CITIZEN");
  };

  const isAdmin = role === "ADMIN" || role === "SUPERINTENDENT" || role === "INSPECTOR";
  const isCitizen = role === "CITIZEN" || role === "CONSTABLE";

  return (
    <AuthContext.Provider value={{ 
      role, 
      setRole, 
      userId, 
      user, 
      isAdmin, 
      isCitizen, 
      loginAsAdmin, 
      loginAsCitizen, 
      logout 
    }}>
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
