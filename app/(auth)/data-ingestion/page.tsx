"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Network, 
  Clock, 
  AlertCircle,
  FileCheck,
  Scale,
  Camera,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

interface UploadStatus {
  stage: 'idle' | 'uploading' | 'ocr' | 'extraction' | 'graph' | 'completed' | 'error';
  progress: number;
  message: string;
}

const INITIAL_INGESTIONS = [
  { id: "ING-1092", filename: "Weighbridge_Manifest_Indrali_0891.pdf", type: "Weighbridge Manifest", entities: 14, graphLinks: 6, time: "25 mins ago", status: "Completed" },
  { id: "ING-1091", filename: "GPS_Compactor_Fleet_Logs.csv", type: "Fleet GPS Telemetry", entities: 38, graphLinks: 22, time: "2 hours ago", status: "Completed" },
  { id: "ING-1090", filename: "Drone_Thermal_Orthomosaic_Pit3.jpg", type: "Drone Aerial Imagery", entities: 4, graphLinks: 3, time: "Yesterday", status: "Completed" },
  { id: "ING-1089", filename: "Tipping_Fee_Ledger_SBI_8492.pdf", type: "Municipal Tipping Ledger", entities: 26, graphLinks: 11, time: "2 days ago", status: "Completed" },
];

export default function DataIngestionPage() {
  const [ingestions, setIngestions] = useState(INITIAL_INGESTIONS);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    stage: 'idle',
    progress: 0,
    message: "Ready to ingest weighbridge slips, IoT telemetry, or inspection records"
  });
  const [formData, setFormData] = useState({
    manifestId: "SWM/UDUPI/2026/0912",
    wardFacility: "Indrali Central Ward 12",
    manifestType: "Weighbridge Tonnage Manifest",
    description: "Institutional bulk food waste slip with automated digital scale validation."
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadStatus({
      stage: 'idle',
      progress: 0,
      message: `Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`
    });
  };

  const handleStartIngestion = () => {
    if (!file) return;

    setUploadStatus({ stage: 'uploading', progress: 25, message: "Uploading manifest to municipal data pipeline..." });
    setTimeout(() => {
      setUploadStatus({ stage: 'ocr', progress: 50, message: "Performing OCR & weighbridge slip digitizing..." });
      setTimeout(() => {
        setUploadStatus({ stage: 'extraction', progress: 75, message: "Extracting Entities (Ward, Truck ID, Gross/Tare Weight, Tonnage)..." });
        setTimeout(() => {
          setUploadStatus({ stage: 'graph', progress: 90, message: "Synchronizing with AstraCity Geospatial Twin Graph..." });
          setTimeout(() => {
            const newRecord = {
              id: `ING-${Math.floor(1000 + Math.random() * 9000)}`,
              filename: file.name,
              type: formData.manifestType,
              entities: 18,
              graphLinks: 8,
              time: "Just now",
              status: "Completed"
            };
            setIngestions(prev => [newRecord, ...prev]);
            setUploadStatus({ stage: 'completed', progress: 100, message: "Ingestion complete! 18 entities and 8 facility links mapped." });
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Field Telemetry & Sensor Ingestion</h1>
          <p className="text-xs text-slate-500 mt-1">
            Ingest weighbridge tickets, IoT bin telemetry, GPS fleet logs, and aerial drone imagery into the Udupi Digital Twin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold gap-1.5 py-1 px-3">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Pipeline Active (SWM 2026)
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ingestion Dropzone & Manifest Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-emerald-600" />
                Upload Field Records or Telemetry Slips
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Supports PDF weighbridge slips, CSV GPS tracks, thermal JPEG drone scans, and KML polygons.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:border-emerald-400 bg-slate-50/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  accept=".pdf,.csv,.jpg,.jpeg,.png,.kml"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="p-3 rounded-full bg-white shadow-xs text-emerald-600 border border-slate-200">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {file ? file.name : "Click to select or drag and drop telemetry records"}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {file ? `${(file.size / 1024).toFixed(1)} KB ready for ingestion` : "PDF, CSV, JPEG up to 50MB"}
                  </p>
                </div>
              </div>

              {/* Progress & Status Indicator */}
              {uploadStatus.stage !== 'idle' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      {uploadStatus.stage === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      )}
                      {uploadStatus.message}
                    </span>
                    <span className="font-mono font-bold text-emerald-700">{uploadStatus.progress}%</span>
                  </div>
                  <Progress value={uploadStatus.progress} className="h-2 bg-slate-200" />
                </div>
              )}

              {/* Metadata Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Manifest / Ticket Number</Label>
                  <Input
                    value={formData.manifestId}
                    onChange={(e) => setFormData({ ...formData, manifestId: e.target.value })}
                    className="text-xs bg-slate-50 border-slate-200 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Ward / Facility Unit</Label>
                  <Input
                    value={formData.wardFacility}
                    onChange={(e) => setFormData({ ...formData, wardFacility: e.target.value })}
                    className="text-xs bg-slate-50 border-slate-200"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Ingestion Description & Vehicle Tags</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="text-xs bg-slate-50 border-slate-200 resize-none h-20"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  onClick={handleStartIngestion}
                  disabled={!file || (uploadStatus.stage !== 'idle' && uploadStatus.stage !== 'completed')}
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5"
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  Start Automated Ingestion Pipeline
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Multi-Stage Extraction Pipeline Visualization */}
        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-600" />
                Pipeline Stages
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                End-to-end multimodal processing pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {[
                { title: "1. Document Sandbox & Ingestion", desc: "Digital verification of weighbridge serials" },
                { title: "2. Optical Tonnage OCR", desc: "Tare weight & net payload extraction" },
                { title: "3. Spatial Geo-Tagging", desc: "Attributing tonnage to 35 ward polygons" },
                { title: "4. Digital Twin Graph Ingestion", desc: "Updating live digital twin nodes & route delays" },
              ].map((stage, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{stage.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Batch Ingestion History */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-900">Recent Telemetry Ingestions</CardTitle>
          <CardDescription className="text-xs text-slate-500">Historical records processed through the automated ingestion pipeline.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Batch ID</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Filename</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Telemetry Type</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Entities Extracted</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Graph Links</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Timestamp</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 uppercase">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingestions.map((b) => (
                  <TableRow key={b.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-xs font-bold text-emerald-800">{b.id}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">{b.filename}</TableCell>
                    <TableCell className="text-xs text-slate-600">{b.type}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-700">{b.entities}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-700">{b.graphLinks}</TableCell>
                    <TableCell className="text-xs text-slate-400">{b.time}</TableCell>
                    <TableCell>
                      <Badge className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border-none">
                        {b.status}
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
