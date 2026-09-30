"use client";

import React, { useState } from "react";
import { Activity, AlertTriangle, FileText, CheckCircle, Truck, ArrowRight, Radio, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface SWMEvent {
  id: string;
  type: "TICKET_CREATED" | "ALERT_TRIGGERED" | "TRUCK_ARRIVED" | "CASE_RESOLVED";
  location: string;
  message: string;
  time: string;
}

const SAMPLE_EVENTS: SWMEvent[] = [
  {
    id: "evt_1",
    type: "ALERT_TRIGGERED",
    location: "Indrali Remediation Pit 3",
    message: "Subsurface methane flare probe exceeded 450 ppm threshold.",
    time: "2 mins ago"
  },
  {
    id: "evt_2",
    type: "TRUCK_ARRIVED",
    location: "Indrali Central Weighbridge",
    message: "Compactor KA-20-EA-4102 logged 6.4 tonnes wet fraction.",
    time: "12 mins ago"
  },
  {
    id: "evt_3",
    type: "TICKET_CREATED",
    location: "Manipal Syndicate Circle",
    message: "Citizen complaint #8422: Secondary communal bin overflow.",
    time: "28 mins ago"
  },
  {
    id: "evt_4",
    type: "CASE_RESOLVED",
    location: "Gundibail Biomethanation Unit",
    message: "Digester impeller cleared; organic biogas generation restored.",
    time: "1 hour ago"
  }
];

export function LiveEventFeed() {
  const [events] = useState<SWMEvent[]>(SAMPLE_EVENTS);
  const [isLive, setIsLive] = useState(true);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "TICKET_CREATED": return <FileText className="w-4 h-4 text-blue-500" />;
      case "ALERT_TRIGGERED": return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case "TRUCK_ARRIVED": return <Truck className="w-4 h-4 text-emerald-600" />;
      case "CASE_RESOLVED": return <CheckCircle className="w-4 h-4 text-teal-600" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Live Municipal Event Feed</h3>
          </div>
          <button 
            type="button"
            onClick={() => setIsLive(!isLive)}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800"
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
            {isLive ? "ONLINE" : "PAUSED"}
          </button>
        </div>

        <div className="mt-3.5 space-y-2.5">
          {events.map((evt) => (
            <div key={evt.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/80">
              <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 shrink-0">
                {getEventIcon(evt.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="font-bold text-slate-800 truncate">{evt.location}</span>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">{evt.time}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{evt.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 mt-3">
        <Link href="/alerts" className="w-full">
          <Button variant="outline" className="w-full text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50 gap-1.5 h-9">
            View All Telemetry Alerts
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
