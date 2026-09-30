"use client";

import React, { useState } from "react";
import { 
  Building2, 
  Search, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_PERSONS, MockPerson } from "@/lib/mockData";
import Link from "next/link";

export default function ProfilesPage() {
  const [persons] = useState<MockPerson[]>(MOCK_PERSONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredPersons = persons.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.aliases.some(a => a.toLowerCase().includes(search.toLowerCase())) ||
                          p.primary_crime.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Facilities & Bulk Generator Entity Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registry of bulk waste generators, DWCC concessionaires, biomethanation operators, and compliance risk scores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-emerald-800 border-emerald-300 bg-emerald-50 font-bold px-3 py-1 text-xs">
            {persons.length} Key Operators Monitored
          </Badge>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by facility name, operator, or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-xs bg-slate-50 border-slate-200"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "UNDER SURVEILLANCE", "AT LARGE", "IN CUSTODY"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === s ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPersons.map((p) => (
          <Card key={p.id} className="border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <Badge variant="outline" className={`text-[10px] font-bold ${
                  p.risk_score >= 90 ? "text-rose-700 border-rose-300 bg-rose-50" : "text-amber-700 border-amber-300 bg-amber-50"
                }`}>
                  Risk Score: {p.risk_score}
                </Badge>
              </div>
              <CardTitle className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{p.name}</CardTitle>
              <CardDescription className="text-[11px] text-slate-500 font-medium">
                {p.aliases.join(", ")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Primary Activity:</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{p.primary_crime}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Sector / Ward:</span>
                  <span className="font-bold text-slate-800">{p.district}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Active Violations:</span>
                  <span className="font-mono font-bold text-rose-600">{p.active_warrants} Notices</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{p.last_spotted}</span>
              </div>

              <Link href={`/profiles/${p.id}`} className="block w-full pt-1">
                <Button variant="outline" size="sm" className="w-full text-xs font-bold text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50 gap-1.5 h-8">
                  View Full Profile <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
