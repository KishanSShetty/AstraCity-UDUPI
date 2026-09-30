"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Building2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_CASES, MockCase } from "@/lib/mockData";
import Link from "next/link";

export default function CasesPage() {
  const [cases] = useState<MockCase[]>(MOCK_CASES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.case_no.toLowerCase().includes(search.toLowerCase()) || 
                          c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.summary.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 font-bold">Active</Badge>;
      case "UNDER INVESTIGATION":
        return <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 font-bold">Under Audit</Badge>;
      case "CHARGE-SHEETED":
        return <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50 font-bold">Penalized</Badge>;
      case "CLOSED":
        return <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 font-bold">Resolved</Badge>;
      default:
        return <Badge variant="secondary" className="font-bold">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">SWM Compliance & Investigation Dossiers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track active solid waste non-compliance investigations, multi-ward dumping dossiers, statutory notices, and linked ticket portfolios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-emerald-800 border-emerald-300 bg-emerald-50 font-bold text-xs py-1 px-3">
            {cases.length} Registered Case Dossiers
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search case no, title, or ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-slate-50 border-slate-200"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["ALL", "ACTIVE", "UNDER INVESTIGATION", "CHARGE-SHEETED"].map((s) => (
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

      {/* Cases Table */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardContent className="p-0">
          <div className="rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Case Dossier No</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Title & Category</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Ward / Sector</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Lead Officer</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Priority</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Status</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((c) => (
                  <TableRow key={c.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-xs font-bold text-emerald-800">
                      {c.case_no}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-bold text-slate-900">{c.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{c.primary_crime_type}</div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700">
                      {c.primary_district}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {c.lead_investigator}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold ${
                        c.priority === "Critical" ? "text-rose-700 border-rose-300 bg-rose-50" :
                        c.priority === "High" ? "text-amber-700 border-amber-300 bg-amber-50" :
                        "text-emerald-700 border-emerald-300 bg-emerald-50"
                      }`}>
                        {c.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(c.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/cases/${c.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 gap-1">
                          View Dossier <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
