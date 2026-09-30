"use client";

import React, { useState } from "react";
import { 
  Network, 
  Building2, 
  Truck, 
  Landmark, 
  FileText, 
  MapPin, 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  X, 
  ArrowRight, 
  ShieldAlert,
  Lightbulb,
  ShieldCheck,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MOCK_NETWORK_GRAPH } from "@/lib/mockData";
import Link from "next/link";

interface GraphNode {
  id: string;
  name: string;
  type: string;
  risk: number;
  role?: string;
  x?: number;
  y?: number;
}

export default function NetworkPage() {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(MOCK_NETWORK_GRAPH.nodes[0] as any);
  const [nodeNotes, setNodeNotes] = useState<Record<string, string>>({
    p1: "Indrali Central Dumpsite - Monitored under SWM 2026 bio-mining taskforce."
  });
  const [currentNote, setCurrentNote] = useState("");

  const nodeCoords: Record<string, { x: number; y: number }> = {
    p1: { x: 380, y: 220 },
    p2: { x: 550, y: 160 },
    p3: { x: 220, y: 320 },
    v1: { x: 120, y: 440 },
    b1: { x: 680, y: 260 },
    b2: { x: 800, y: 380 },
    f1: { x: 420, y: 400 },
    loc1: { x: 260, y: 130 }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "facility": return <Building2 className="h-4 w-4" />;
      case "suspect": return <Building2 className="h-4 w-4" />;
      case "vehicle": return <Truck className="h-4 w-4" />;
      case "bank": return <Landmark className="h-4 w-4" />;
      case "fir": return <FileText className="h-4 w-4" />;
      case "location": return <MapPin className="h-4 w-4" />;
      default: return <Network className="h-4 w-4" />;
    }
  };

  const getNodeColor = (type: string, risk: number) => {
    if (risk >= 90) return "bg-rose-500 border-rose-600 text-white shadow-sm";
    if (type === "facility") return "bg-emerald-600 border-emerald-700 text-white shadow-sm";
    if (type === "bank") return "bg-teal-600 border-teal-700 text-white shadow-sm";
    if (type === "vehicle") return "bg-blue-600 border-blue-700 text-white shadow-sm";
    return "bg-slate-700 border-slate-800 text-white shadow-sm";
  };

  const filteredNodes = MOCK_NETWORK_GRAPH.nodes.filter(node => {
    const matchesFilter = filterType === "ALL" || node.type.toUpperCase() === filterType.toUpperCase();
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddNote = () => {
    if (selectedNode && currentNote.trim()) {
      setNodeNotes(prev => ({ ...prev, [selectedNode.id]: currentNote }));
      setCurrentNote("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-50">
      {/* Top Controls Bar */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Waste Logistics & Facility Supply Network</h1>
            <p className="text-[10px] text-slate-500">Multimodal topology: Bulk Generators ➔ Collection Trucks ➔ DWCCs ➔ Bio-mining Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Nodes */}
          <div className="relative w-52">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Search facility or fleet..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {["ALL", "FACILITY", "VEHICLE", "BANK", "FIR"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  filterType === type 
                    ? "bg-white text-emerald-800 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600 border-slate-200" title="Reset View">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Workspace Area: Graph Canvas + Entity Drawer */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* Interactive Graph Canvas */}
        <div className="flex-1 h-full relative cursor-grab active:cursor-grabbing overflow-auto">
          {/* Subtle Grid Dot Background */}
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              width: "1200px",
              height: "800px"
            }}
          />

          <svg className="absolute inset-0 w-[1200px] h-[800px] pointer-events-none">
            {MOCK_NETWORK_GRAPH.links.map((link, idx) => {
              const srcCoord = nodeCoords[link.source];
              const tgtCoord = nodeCoords[link.target];
              if (!srcCoord || !tgtCoord) return null;

              return (
                <g key={idx}>
                  <line 
                    x1={srcCoord.x} 
                    y1={srcCoord.y} 
                    x2={tgtCoord.x} 
                    y2={tgtCoord.y} 
                    stroke="#cbd5e1" 
                    strokeWidth={link.strength * 2.5}
                    strokeDasharray={link.relationship.includes("Credit") ? "4,4" : undefined}
                  />
                  {/* Midpoint Label */}
                  <text 
                    x={(srcCoord.x + tgtCoord.x) / 2} 
                    y={(srcCoord.y + tgtCoord.y) / 2 - 6} 
                    fill="#64748b" 
                    fontSize="10" 
                    fontWeight="600"
                    textAnchor="middle"
                    className="select-none bg-white"
                  >
                    {link.relationship}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Node Elements */}
          <div className="absolute inset-0 w-[1200px] h-[800px]">
            {filteredNodes.map((node) => {
              const coord = nodeCoords[node.id] || { x: 300, y: 300 };
              const isSelected = selectedNode?.id === node.id;

              return (
                <div 
                  key={node.id}
                  onClick={() => setSelectedNode(node as any)}
                  style={{ left: coord.x, top: coord.y }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform ${
                    isSelected ? "scale-110 z-30" : "hover:scale-105 z-10"
                  }`}
                >
                  <div className={`relative flex items-center justify-center p-3 rounded-full border-2 shadow-md transition-all ${
                    getNodeColor(node.type, node.risk)
                  } ${isSelected ? "ring-4 ring-emerald-500/30" : ""}`}>
                    {getNodeIcon(node.type)}
                  </div>
                  <div className="mt-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-800 shadow-xs whitespace-nowrap">
                    {node.name}
                  </div>
                  {node.role && (
                    <span className="text-[9px] text-slate-500 font-semibold">{node.role}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Entity Inspector Drawer */}
        {selectedNode && (
          <div className="w-80 border-l border-slate-200 bg-white h-full flex flex-col shadow-lg z-20 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${getNodeColor(selectedNode.type, selectedNode.risk)}`}>
                  {getNodeIcon(selectedNode.type)}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 truncate max-w-[180px]">{selectedNode.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-emerald-700">{selectedNode.type}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedNode(null)} className="h-7 w-7 text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Risk / Severity Meter */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-600">Compliance Priority</span>
                  <span className={`font-mono ${selectedNode.risk >= 90 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {selectedNode.risk}/100
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${selectedNode.risk >= 90 ? 'bg-rose-500' : 'bg-emerald-600'}`} 
                    style={{ width: `${selectedNode.risk}%` }} 
                  />
                </div>
              </div>

              {/* Connected Relationships */}
              <div>
                <span className="font-bold text-slate-700 block mb-2">Connected Spatial Links</span>
                <div className="space-y-1.5">
                  {MOCK_NETWORK_GRAPH.links
                    .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
                    .map((l, idx) => {
                      const otherId = l.source === selectedNode.id ? l.target : l.source;
                      const otherNode = MOCK_NETWORK_GRAPH.nodes.find(n => n.id === otherId);
                      return (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-[11px]">{otherNode?.name || otherId}</span>
                            <span className="text-[10px] text-slate-500">{l.relationship}</span>
                          </div>
                          <Badge variant="outline" className="text-[9px] font-bold text-emerald-800 bg-white">
                            {(l.strength * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Node Notes */}
              <div>
                <span className="font-bold text-slate-700 block mb-2">CMC Inspector Notes</span>
                <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/60 text-slate-700 leading-relaxed text-[11px] mb-2 font-medium">
                  {nodeNotes[selectedNode.id] || "No operational notes recorded for this entity."}
                </div>
                <div className="flex gap-1.5">
                  <Input 
                    placeholder="Append inspection log..." 
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    className="h-8 text-xs bg-slate-50 border-slate-200"
                  />
                  <Button onClick={handleAddNote} size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5">
                    Save
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50/50">
              <Link href="/profiles" className="w-full">
                <Button variant="outline" size="sm" className="w-full text-xs font-bold text-slate-700 hover:text-slate-900 border-slate-200">
                  Open Complete Dossier <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
