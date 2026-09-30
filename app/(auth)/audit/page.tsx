"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock,
  ChevronRight,
  FileCheck,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_AUDIT_LOGS, MockAuditLog } from "@/lib/mockData";
import { downloadDataAsCsv } from "@/lib/utils";

export default function AuditPage() {
  const [logs] = useState<MockAuditLog[]>(MOCK_AUDIT_LOGS);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<MockAuditLog | null>(MOCK_AUDIT_LOGS[0]);

  const filteredLogs = logs.filter(l => 
    l.user_name.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.resource.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    downloadDataAsCsv(logs, "udupi-swm-audit-governance-ledger");
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Audit & SWM 2026 Regulatory Governance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident weighbridge logs, KSPCB/CPCB compliance telemetry, and municipal officer access compliance logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5 text-slate-400" />
            Export Audit Ledger CSV
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CPCB Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700 font-mono">94.8%</div>
            <p className="text-[11px] text-slate-500 mt-1">Zero pending KSPCB show-cause notices</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamper-Evident Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-teal-700 font-mono">1,482 Logs</div>
            <p className="text-[11px] text-slate-500 mt-1">Cryptographically hashed weighbridge telemetry</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unauthorized Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-600 font-mono">1 Event</div>
            <p className="text-[11px] text-slate-500 mt-1">Blocked export from unauthorized terminal</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Regulatory Governance Audit Trail</CardTitle>
            <CardDescription className="text-xs text-slate-500">Every officer query, weighbridge export, and notice dispatch is immutably logged.</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search officer, action, or resource..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-slate-50 border-slate-200"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Audit ID</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Timestamp</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Officer / Actor</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Action</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Resource Target</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Terminal IP</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-xs font-bold text-emerald-800">{log.id}</TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">{log.timestamp}</TableCell>
                    <TableCell className="text-xs">
                      <div className="font-bold text-slate-800">{log.user_name}</div>
                      <div className="text-[10px] text-slate-400">{log.role}</div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700">{log.action}</TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-[220px] truncate">{log.resource}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-400">{log.ip_address}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold ${
                        log.status === "Success" ? "text-emerald-700 border-emerald-300 bg-emerald-50" : "text-rose-700 border-rose-300 bg-rose-50"
                      }`}>
                        {log.status}
                      </Badge>
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
