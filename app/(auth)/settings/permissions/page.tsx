"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Check, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const PERMISSION_MATRIX = [
  { feature: "View SWM Command Center & Live Telemetry", constable: true, inspector: true, superintendent: true, admin: true },
  { feature: "Access Ward Compliance Case Dossiers", constable: true, inspector: true, superintendent: true, admin: true },
  { feature: "Interactive Waste Supply Chain Topology", constable: false, inspector: true, superintendent: true, admin: true },
  { feature: "AstraCity AI Copilot Inquiries", constable: false, inspector: true, superintendent: true, admin: true },
  { feature: "Municipal Tipping Fee & Cess Ledgers", constable: false, inspector: false, superintendent: true, admin: true },
  { feature: "Trigger SWM 2026 Statutory Notices", constable: false, inspector: false, superintendent: true, admin: true },
  { feature: "Export CPCB / KSPCB Regulatory Reports", constable: false, inspector: false, superintendent: false, admin: true },
  { feature: "Role Assignment & Contractor Provisioning", constable: false, inspector: false, superintendent: false, admin: true },
];

export default function PermissionsPage() {
  const router = useRouter();

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8 border-slate-200 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Udupi CMC Role-Based Permissions Matrix</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational clearance hierarchy across Udupi Solid Waste Management divisions under SWM 2026 rules.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 bg-white shadow-xs">
        <CardContent className="p-0">
          <div className="rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase">Operational Capability</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase text-center">Ward Supervisor</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase text-center">Env. Engineer</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase text-center">Zonal Head</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase text-center">Commissioner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSION_MATRIX.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50">
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {row.feature}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.constable ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.inspector ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.superintendent ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.admin ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
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
