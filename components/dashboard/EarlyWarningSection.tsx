"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EarlyWarningSection() {
  const alerts = [
    {
      id: "ew-1",
      title: "Subsurface Methane Flare Risk (480 ppm)",
      location: "Indrali Landfill Remediation Pit 3",
      confidence: "96.8% AI Confidence",
      impact: "CRITICAL HAZARD",
      suggestion: "Activate bio-cover sprinkler dampers and deploy mobile methane suppression squad."
    },
    {
      id: "ew-2",
      title: "Commercial Fishery Slurry Inflow Spurt",
      location: "Malpe Port Beach Intertidal Sector",
      confidence: "92.4% AI Confidence",
      impact: "HIGH SEVERITY",
      suggestion: "Dispatch harbor patrol intercept team and issue coastal dumping summons to Unit 4."
    }
  ];

  return (
    <Card className="border-amber-200 bg-amber-50/40 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-sm font-bold text-slate-900">
              SWM 2026 Early Warning Telemetry
            </CardTitle>
          </div>
          <Link href="/alerts">
            <Button variant="ghost" size="sm" className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:bg-amber-100/50">
              View All Signals <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <CardDescription className="text-xs text-slate-600">
          Machine learning sensor models identifying emergent methane leaks, dump overflow, and unauthorized discharges.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Badge variant="outline" className={`text-[10px] font-bold ${alert.impact.includes('CRITICAL') ? 'text-rose-700 border-rose-300 bg-rose-50' : 'text-amber-700 border-amber-300 bg-amber-50'}`}>
                  {alert.impact}
                </Badge>
                <span className="text-[11px] font-semibold text-slate-500">{alert.confidence}</span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 mb-1">{alert.title}</h4>
              <p className="text-[11px] text-slate-500 mb-2 font-medium">{alert.location}</p>
              <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/80 font-medium">
                {alert.suggestion}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
