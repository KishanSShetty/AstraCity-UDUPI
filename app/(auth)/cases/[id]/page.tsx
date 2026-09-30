"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  MapPin, 
  Download, 
  Network,
  ShieldCheck,
  Building2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_CASES } from "@/lib/mockData";
import Link from "next/link";

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.id as string;
  
  const caseData = MOCK_CASES.find(c => c.id === caseId) || MOCK_CASES[0];

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8 border-slate-200 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-800">{caseData.case_no}</span>
              <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300 bg-amber-50 font-bold">
                {caseData.status}
              </Badge>
              <Badge variant="outline" className="text-[10px] text-rose-700 border-rose-300 bg-rose-50 font-bold">
                {caseData.priority} Priority
              </Badge>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">{caseData.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5 text-slate-400" />
            Export SWM Dossier
          </Button>
          <Link href="/network">
            <Button size="sm" className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
              <Network className="h-3.5 w-3.5" />
              View on Supply Graph
            </Button>
          </Link>
        </div>
      </div>

      {/* Case Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">Executive Operations Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs leading-relaxed text-slate-700">
              <p>{caseData.summary}</p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-800 block">SWM 2026 Enforcement Mandate:</span>
                <p className="text-slate-600">
                  Daily logs must be preserved for CPCB compliance reporting. Weighbridge discrepancies and illegal dumping evidence subject to Section 15 environmental penal sanctions.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">Linked Incident Tickets ({caseData.fir_count})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {caseData.firs.map((firId, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      <span className="font-mono font-bold text-slate-800">{firId}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold text-emerald-800 bg-white">Verified Evidence</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">Dossier Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Lead Investigator:</span>
                <span className="font-bold text-slate-800">{caseData.lead_investigator}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Ward / Sector:</span>
                <span className="font-bold text-slate-800">{caseData.primary_district}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Latest Inspection:</span>
                <span className="font-bold text-slate-800">{caseData.latest_date}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-emerald-800">{caseData.primary_crime_type}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
