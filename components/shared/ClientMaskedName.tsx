"use client";

import React from "react";
import { useAuth } from "@/lib/AuthContext";

export function maskName(name: string, role?: string): string {
  if (!name) return "";
  if (role === "ADMIN" || role === "SUPERINTENDENT" || role === "INSPECTOR") {
    return name;
  }
  const parts = name.split(" ");
  return parts.map(p => p[0] + "*".repeat(Math.max(1, p.length - 1))).join(" ");
}

export function ClientMaskedName({ name }: { name: string }) {
  const { role } = useAuth();
  return <span>{maskName(name, role)}</span>;
}
