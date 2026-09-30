"use client";

import React, { useState } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Key, 
  Check, 
  Save, 
  Moon, 
  Sun, 
  Monitor,
  Lock,
  Building2,
  ShieldCheck
} from "lucide-react";
import { useAuth, Role } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "notifications" | "security">("profile");
  const { role, setRole, user, userId } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "Er. K. P. Bhat",
    badge: "CMC-SWM-4092",
    email: "swm.engineer@udupicity.gov.in",
    division: "Solid Waste Management Division - Udupi City Municipal Council"
  });

  const [notifySettings, setNotifySettings] = useState({
    criticalAlerts: true,
    poiSightings: true,
    weeklyReport: false,
    soundEffects: true
  });

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">System & Municipal Officer Settings</h1>
        <p className="text-xs text-slate-500">
          Configure officer workstation preferences, role permissions simulation under SWM 2026, and sensor notification triggers.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === "profile" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <User className="w-4 h-4" />
              Officer Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === "security" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Shield className="w-4 h-4" />
              Role & Permissions
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === "appearance" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Palette className="w-4 h-4" />
              Appearance & White Theme
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === "notifications" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Bell className="w-4 h-4" />
              Telemetry Triggers
            </button>
          </nav>
        </aside>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Municipal Officer Credentials</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Officer identity details associated with Udupi CMC digital twin records.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Full Name</label>
                    <Input 
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
                      className="text-xs bg-slate-50 border-slate-200" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Officer CMC ID</label>
                    <Input value={profileForm.badge} disabled className="text-xs font-mono bg-slate-100 border-slate-200 text-slate-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Official Municipal Email</label>
                  <Input 
                    value={profileForm.email} 
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} 
                    className="text-xs bg-slate-50 border-slate-200" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Division & Department</label>
                  <Input 
                    value={profileForm.division} 
                    onChange={(e) => setProfileForm({ ...profileForm, division: e.target.value })} 
                    className="text-xs bg-slate-50 border-slate-200" 
                  />
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-emerald-700 font-bold">{savedSuccess ? "Saved successfully!" : ""}</span>
                <Button onClick={handleSave} size="sm" className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs">
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Security & Role Simulator Tab */}
          {activeTab === "security" && (
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Role-Based SWM Access Simulation
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Switch your simulated role to test and inspect frontend permission barriers (Ward Supervisor vs Environmental Engineer vs Commissioner).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">Current Active Role</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {([
                      { role: "CONSTABLE", title: "Ward Supervisor", desc: "Field View Only" },
                      { role: "INSPECTOR", title: "Env. Engineer", desc: "Standard Operations" },
                      { role: "SUPERINTENDENT", title: "Zonal Head", desc: "District Clearance" },
                      { role: "ADMIN", title: "Commissioner", desc: "Full Governance" }
                    ] as const).map((r) => (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => setRole(r.role as Role)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          role === r.role ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs" : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="font-bold text-xs">{r.title}</span>
                        <span className="text-[10px] text-slate-500 mt-1">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="font-bold text-slate-800 block">Active Security Session</span>
                  <p className="text-slate-500">Officer Token: UDUPI-CMC-SEC-2026</p>
                  <p className="text-slate-500">Current UI clearance level: <span className="font-bold text-emerald-700">{role}</span></p>
                </div>

                <div className="pt-2">
                  <Link href="/settings/permissions">
                    <Button variant="outline" size="sm" className="text-xs font-bold text-slate-700 hover:text-slate-900 border-slate-200 gap-1.5">
                      <Lock className="h-3.5 w-3.5" />
                      View Full Permissions Matrix
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Theme & White Aesthetic System</CardTitle>
                <CardDescription className="text-xs text-slate-500">White theme active with crisp emerald and slate accents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-900 block">Clean White Municipal Theme</span>
                    <span className="text-[11px] text-emerald-700">Optimized for day-shift workstation monitors and field tablets</span>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Active</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">Telemetry Notification Triggers</CardTitle>
                <CardDescription className="text-xs text-slate-500">Configure audible and popup telemetry triggers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-800">Critical Methane Sensor Spike Notifications</span>
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-800">Weighbridge Delivery Tonnage Alerts</span>
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
