"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  AlertTriangle, 
  FileText, 
  Network, 
  Sparkles,
  ShieldCheck,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_PERSONS } from "@/lib/mockData";
import Link from "next/link";

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params?.id as string;

  const person = MOCK_PERSONS.find(p => p.id === profileId) || MOCK_PERSONS[0];

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8 border-slate-200 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">{person.id}</span>
              <Badge variant="outline" className="text-rose-700 border-rose-300 bg-rose-50 font-bold text-[10px]">
                Compliance Risk Score: {person.risk_score}/100
              </Badge>
              <Badge variant="outline" className="text-emerald-800 border-emerald-300 bg-emerald-50 font-bold text-[10px]">
                {person.status}
              </Badge>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">{person.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/network">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50">
              <Network className="h-3.5 w-3.5 text-emerald-600" />
              Supply Chain Links
            </Button>
          </Link>
          <Link href="/chat">
            <Button size="sm" className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              AI Compliance Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">Entity Information & Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 block mb-0.5">Primary Activity</span>
                  <span className="font-bold text-slate-800">{person.primary_crime}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 block mb-0.5">Sector Jurisdiction</span>
                  <span className="font-bold text-slate-800">{person.district}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 block mb-0.5">Known Operational Units</span>
                  <span className="font-bold text-slate-800">{person.associates_count} Units</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 block mb-0.5">Pending Statutory Notices</span>
                  <span className="font-bold text-rose-600">{person.active_warrants} Active Notices</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-slate-700 leading-relaxed font-medium">
                <span className="font-bold text-emerald-900 block mb-1">CMC Health & Environmental Audit:</span>
                Subject to mandatory weekly decentralized weighbridge calibration and segregated wet fraction handovers under Udupi Solid Waste Bylaws 2026.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">Surveillance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Last GPS Check-in:</span>
                <span className="font-bold text-slate-800">{person.last_spotted}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Registration ID:</span>
                <span className="font-mono font-bold text-slate-800">{person.id}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Alias / Trading Name:</span>
                <span className="font-bold text-emerald-800">{person.aliases[0]}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
