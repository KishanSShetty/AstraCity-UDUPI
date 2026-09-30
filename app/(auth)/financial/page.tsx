"use client";

import React, { useState } from "react";
import { 
  Landmark, 
  ArrowRightLeft, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  Search, 
  DollarSign, 
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Scale
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_FINANCIAL_TX, MockFinancialTx } from "@/lib/mockData";
import { downloadDataAsCsv } from "@/lib/utils";

export default function FinancialPage() {
  const [transactions] = useState<MockFinancialTx[]>(MOCK_FINANCIAL_TX);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"transactions" | "flow" | "mules">("transactions");

  const filteredTx = transactions.filter(t => 
    t.sender_name.toLowerCase().includes(search.toLowerCase()) ||
    t.receiver_name.toLowerCase().includes(search.toLowerCase()) ||
    t.tx_id.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    downloadDataAsCsv(transactions, "udupi-swm-tipping-ledger");
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Municipal SWM Financials & Tipping Ledgers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track tipping fee disbursements, bulk generator cess collections, EPR plastic credits, and bio-mining contractor escrow audits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5 text-slate-400" />
            Export Tipping Audit CSV
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Tipping Inflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700 font-mono">₹ 2,62,00,000</div>
            <p className="text-[11px] text-slate-500 mt-1">Across 35 Udupi wards</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Facility Escrows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-teal-700 font-mono">18 Ledgers</div>
            <p className="text-[11px] text-slate-500 mt-1">Weighbridge calibrated accounts</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average Settlement Cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 font-mono">4.2 Days</div>
            <p className="text-[11px] text-slate-500 mt-1">Weighbridge slip to payment</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recovery Notices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-600 font-mono">9 Issued</div>
            <p className="text-[11px] text-slate-500 mt-1">Under SWM 2026 CMC Bylaws</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex max-w-md bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'transactions' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Transactions Trail
        </button>
        <button
          onClick={() => setActiveTab("flow")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'flow' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Multi-Hop Flow
        </button>
        <button
          onClick={() => setActiveTab("mules")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'mules' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Flagged Accounts
        </button>
      </div>

      {/* Tab: Transactions Trail */}
      {activeTab === "transactions" && (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">SWM Municipal Ledger Ledger Records</CardTitle>
              <CardDescription className="text-xs text-slate-500">Live transaction stream across waste processing and contractor payments.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search account, vendor, or TX..."
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
                    <TableHead className="text-xs font-bold text-slate-600 uppercase">TX Ref</TableHead>
                    <TableHead className="text-xs font-bold text-slate-600 uppercase">Remitter / Generator</TableHead>
                    <TableHead className="text-xs font-bold text-slate-600 uppercase">Beneficiary / Fund</TableHead>
                    <TableHead className="text-xs font-bold text-slate-600 uppercase">Tipping Amount</TableHead>
                    <TableHead className="text-xs font-bold text-slate-600 uppercase">Timestamp</TableHead>
                    <TableHead className="text-xs font-bold text-slate-600 uppercase">Audit Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTx.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-xs font-bold text-emerald-800">{tx.tx_id}</TableCell>
                      <TableCell className="text-xs">
                        <div className="font-bold text-slate-800">{tx.sender_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{tx.sender_account}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-bold text-slate-800">{tx.receiver_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{tx.receiver_account}</div>
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold text-slate-900">
                        ₹ {tx.amount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{tx.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] font-bold ${
                          tx.flagged ? "text-rose-700 border-rose-300 bg-rose-50" : "text-emerald-700 border-emerald-300 bg-emerald-50"
                        }`}>
                          {tx.flagged ? "Flagged Audit" : "Verified"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Multi-Hop Flow */}
      {activeTab === "flow" && (
        <Card className="border-slate-200 bg-white shadow-xs p-6 text-center space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-2xl mx-auto flex items-center justify-around text-xs">
            <div className="text-center space-y-1">
              <span className="font-bold text-slate-800 block">Bulk Generator Cess</span>
              <span className="text-[10px] text-slate-500">₹ 8,50,000</span>
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-600" />
            <div className="text-center space-y-1">
              <span className="font-bold text-emerald-800 block">CMC Escrow A/C</span>
              <span className="text-[10px] text-slate-500">Weighbridge Clearance</span>
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-600" />
            <div className="text-center space-y-1">
              <span className="font-bold text-slate-800 block">Fleet & Plant Operator</span>
              <span className="text-[10px] text-slate-500">Net Disbursement</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">Multi-tier fund reconciliation automated under Udupi SWM 2026 rules.</p>
        </Card>
      )}

      {/* Tab: Flagged Default Accounts */}
      {activeTab === "mules" && (
        <Card className="border-slate-200 bg-white shadow-xs p-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Accounts with Overdue Tipping Cess or Default</h3>
            <p className="text-xs text-slate-500">Entities with discrepancies between registered waste output and bank remittance.</p>
            <div className="space-y-2 pt-2">
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-rose-900">Malpe Commercial Fish Processors</span>
                  <p className="text-[11px] text-rose-700">Overdue tipping fees of ₹ 8,50,000 flagged during harbor audit.</p>
                </div>
                <Badge className="bg-rose-600 text-white font-bold text-[10px]">Statutory Notice</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
