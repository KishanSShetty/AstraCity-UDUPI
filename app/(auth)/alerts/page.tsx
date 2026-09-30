"use client";

import React, { useState, useEffect } from "react";
import { 
  BellRing, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  Check, 
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_ALERTS, MockAlert } from "@/lib/mockData";
import Link from "next/link";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<MockAlert[]>(MOCK_ALERTS);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/dwcc-status")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.alerts && data.alerts.length > 0) {
          const liveAlerts: MockAlert[] = data.alerts.map((a: any, i: number) => ({
            id: `LIVE-DWCC-${i + 1}`,
            title: `DWCC Capacity Threshold Exceeded (${a.dwcc_id})`,
            category: "Spike Anomaly",
            severity: a.level === "critical" ? "CRITICAL" : a.level === "red" ? "HIGH" : "ELEVATED",
            location: a.message.split(' — ')[0] || "Udupi CMC Facility",
            timestamp: "Just Now",
            description: a.message,
            confidence: 0.96,
            recommended_action: "Reroute incoming auto-tippers to Karvalu Central SWM plant.",
            status: "Active"
          }));
          setAlerts(prev => [...liveAlerts, ...prev.filter(p => !p.id.startsWith("LIVE-DWCC-"))]);
        }
      })
      .catch(err => console.error("Error fetching live DWCC alerts:", err));
  }, []);

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "Acknowledged" } : a));
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === "ALL") return true;
    return a.severity.toUpperCase() === activeFilter.toUpperCase();
  });

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Early Warnings & SWM Telemetry Signals</h1>
          <p className="text-xs text-slate-500 mt-1">
            Machine learning predictive alert engine synthesizing landfill methane flares, coastal dumping, bin overflows, and contractor delays.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-rose-700 border-rose-300 bg-rose-50 font-bold px-3 py-1 text-xs">
            {alerts.filter(a => a.severity === "CRITICAL").length} Critical Signals Active
          </Badge>
        </div>
      </div>

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Udupi CMC Threat Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-600 flex items-center gap-2 font-mono">
              <Activity className="h-5 w-5 text-amber-600 animate-pulse" />
              ELEVATED
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Elevated risk of coastal fish-waste and dumpsite flares</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Peak Subsurface Methane</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-600 font-mono">480 ppm</div>
            <p className="text-[11px] text-slate-500 mt-1">Recorded along Indrali North Face Pit 3</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mitigation Response SLA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700 font-mono">24.5 Mins</div>
            <p className="text-[11px] text-slate-500 mt-1">Average time from sensor spike to squad dispatch</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl max-w-sm border border-slate-200">
        {["ALL", "CRITICAL", "HIGH", "ELEVATED"].map((sev) => (
          <button
            key={sev}
            onClick={() => setActiveFilter(sev)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              activeFilter === sev ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Alert Feed */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className="border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-colors">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] font-bold ${
                      alert.severity === "CRITICAL" ? "text-rose-700 border-rose-300 bg-rose-50" :
                      alert.severity === "HIGH" ? "text-amber-700 border-amber-300 bg-amber-50" :
                      "text-emerald-700 border-emerald-300 bg-emerald-50"
                    }`}>
                      {alert.severity}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {alert.category}
                    </Badge>
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {alert.timestamp}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      {alert.confidence}% ML Confidence
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {alert.location}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <span className="font-bold text-slate-800 block mb-0.5">Recommended Officer Action:</span>
                    <p className="text-slate-600">{alert.recommended_action}</p>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 shrink-0">
                  <Button
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={alert.status === "Acknowledged"}
                    size="sm"
                    className={`text-xs font-bold ${
                      alert.status === "Acknowledged" 
                        ? "bg-slate-100 text-slate-400" 
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    }`}
                  >
                    {alert.status === "Acknowledged" ? (
                      <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Acknowledged</span>
                    ) : (
                      "Acknowledge Signal"
                    )}
                  </Button>
                  <Link href="/cases">
                    <Button variant="outline" size="sm" className="text-xs font-bold text-slate-700 hover:text-slate-900 border-slate-200">
                      Create SWM Case
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
