"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, UploadCloud, AlertCircle, CheckCircle2, ClipboardList, Database, Briefcase, X } from 'lucide-react';
import { useComplaintStore } from '@/lib/store';

export default function FieldIngestion() {
  const [activeTab, setActiveTab] = useState<'report' | 'logs'>('report');
  const [reportState, setReportState] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('Illegal Dump');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  const { complaints, addComplaint } = useComplaintStore();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPhotoPreview(url);
    }
  };

  const submitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoPreview || !location) return;
    
    setReportState('uploading');
    setTimeout(() => {
      addComplaint({
        location,
        description,
        type: `[FIELD AGENT] ${issueType}`,
        photoUrl: photoPreview
      });
      setReportState('success');
      setTimeout(() => {
        setReportState('idle');
        setPhotoPreview(null);
        setLocation('');
        setDescription('');
        setActiveTab('logs');
      }, 2500);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-teal-500/10 text-teal-400 rounded-2xl mb-4 shadow-[0_0_30px_rgba(20,184,166,0.15)] border border-teal-500/20">
            <Database className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300 mb-4 tracking-tight">
            Municipal Field Ingestion
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Official data collection portal for field agents. Log site issues, illegal dumps, and infrastructure status directly to the SWM Digital Twin.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10"
        >
          {[
            { id: 'report', label: 'Log Field Data', icon: AlertCircle },
            { id: 'logs', label: 'Manage Complaints & Logs', icon: ClipboardList }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-teal-500 text-slate-950 shadow-[0_0_20px_rgba(20,184,166,0.3)] scale-105' 
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </motion.div>

        {/* Tab Content area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* REPORT TAB */}
            {activeTab === 'report' && (
              <motion.div
                key="report"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-10 max-w-2xl mx-auto"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-white mb-2">Create Field Log</h2>
                  <p className="text-slate-400">Capture visual evidence and metadata for the Digital Twin analysis.</p>
                </div>

                <form onSubmit={submitReport} className="space-y-6">
                  
                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Site Photo Evidence <span className="text-red-400">*</span></label>
                    <label className={`block w-full border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-colors ${
                      photoPreview ? 'border-teal-500/50 bg-teal-500/5' : 'border-slate-700 hover:border-teal-500/50 hover:bg-slate-800/50'
                    }`}>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      {photoPreview ? (
                        <div className="relative aspect-video w-full">
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm"><Camera className="w-5 h-5"/> Change Photo</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-teal-400 shadow-inner">
                            <UploadCloud className="w-8 h-8" />
                          </div>
                          <span className="font-bold text-slate-300">Click to upload photo</span>
                          <span className="text-sm mt-1">Geotagged JPG/PNG</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Issue Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Log Category</label>
                    <select
                      value={issueType}
                      onChange={e => setIssueType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none font-medium appearance-none"
                    >
                      <option>Illegal Dump</option>
                      <option>Overflowing Public Bin</option>
                      <option>DWCC Facility Issue</option>
                      <option>Vehicle Breakdown</option>
                      <option>Route Obstruction</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Location / Zone ID <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        type="text" 
                        required
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g., Zone A2 / Main Road"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Technical Notes</label>
                    <textarea 
                      rows={3}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Estimated volume, access issues, required equipment..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none resize-none font-medium"
                    ></textarea>
                  </div>

                  {/* Submit */}
                  <button 
                    type="submit" 
                    disabled={reportState !== 'idle' || !photoPreview || !location}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-black text-lg py-4 rounded-xl shadow-[0_10px_30px_rgba(20,184,166,0.3)] hover:shadow-[0_10px_40px_rgba(20,184,166,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden relative"
                  >
                    {reportState === 'idle' && (
                      <><UploadCloud className="w-5 h-5" /> Push to Digital Twin</>
                    )}
                    {reportState === 'uploading' && (
                      <><span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span> Syncing...</>
                    )}
                    {reportState === 'success' && (
                      <><CheckCircle2 className="w-6 h-6" /> Data Ingested Successfully</>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* LOGS TAB */}
            {activeTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto space-y-4"
              >
                {complaints.length === 0 ? (
                   <div className="text-slate-400 text-center py-8">No complaints found.</div>
                ) : (
                  complaints.map((complaint) => (
                    <div 
                      key={complaint.id} 
                      onClick={() => setSelectedComplaint(complaint)}
                      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-800/80 hover:border-slate-600 transition-all cursor-pointer shadow-lg hover:shadow-xl group"
                    >
                      <div className="flex items-start gap-4 pointer-events-none">
                        {complaint.photoUrl ? (
                           <div className="w-16 h-16 rounded-xl border border-slate-800 shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                             <img src={complaint.photoUrl} alt="Report" className="w-full h-full object-cover" />
                           </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0 group-hover:scale-105 transition-transform duration-300">
                            <Briefcase className="w-8 h-8" />
                          </div>
                        )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-200 text-lg">{complaint.type}</h3>
                          <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md">#{complaint.id}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {complaint.location}</span>
                          <span className="flex items-center gap-1" suppressHydrationWarning><ClipboardList className="w-4 h-4" /> {new Date(complaint.date).toLocaleDateString()}</span>
                        </div>
                        {complaint.description && (
                          <div className="mt-2 text-sm text-slate-300 bg-slate-950/50 p-2 rounded-lg border border-slate-800 truncate max-w-sm">
                            "{complaint.description}"
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end">
                      <div className={`px-4 py-2 rounded-full font-bold text-sm border shadow-sm ${
                        complaint.status === 'Resolved' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 
                        complaint.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        Status: {complaint.status}
                      </div>
                      
                      {/* Municipal Action Buttons (stopPropagation so click doesn't trigger modal) */}
                      <div className="flex gap-1 mt-1">
                        {complaint.status !== 'Pending' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); useComplaintStore.getState().updateStatus(complaint.id, 'Pending'); }}
                            className="text-[10px] px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors uppercase font-bold tracking-wider"
                          >
                            Mark Pending
                          </button>
                        )}
                        {complaint.status !== 'In Progress' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); useComplaintStore.getState().updateStatus(complaint.id, 'In Progress'); }}
                            className="text-[10px] px-2 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 transition-colors uppercase font-bold tracking-wider"
                          >
                            Mark Progress
                          </button>
                        )}
                        {complaint.status !== 'Resolved' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); useComplaintStore.getState().updateStatus(complaint.id, 'Resolved'); }}
                            className="text-[10px] px-2 py-1 rounded-md bg-teal-500/20 hover:bg-teal-500/40 text-teal-300 transition-colors uppercase font-bold tracking-wider"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Complaint Details Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedComplaint(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Photo Area */}
              {selectedComplaint.photoUrl ? (
                <div className="w-full h-64 sm:h-80 relative bg-slate-950 border-b border-slate-800">
                  <img src={selectedComplaint.photoUrl} alt="Complaint Evidence" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                </div>
              ) : (
                <div className="w-full h-40 bg-slate-950 border-b border-slate-800 flex flex-col items-center justify-center text-slate-600">
                  <Briefcase className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm font-medium">No visual evidence provided</span>
                </div>
              )}

              {/* Content Area */}
              <div className="p-6 sm:p-8 overflow-y-auto">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    Ticket #{selectedComplaint.id}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                    selectedComplaint.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    selectedComplaint.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {selectedComplaint.status}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">{selectedComplaint.type}</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Location / Zone</div>
                      <div className="text-slate-200 font-medium">{selectedComplaint.location}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ClipboardList className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Date Reported</div>
                      <div className="text-slate-200 font-medium" suppressHydrationWarning>{new Date(selectedComplaint.date).toLocaleString()}</div>
                    </div>
                  </div>
                  {selectedComplaint.description && (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Technical Notes / Description</div>
                        <div className="text-slate-300 font-medium bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 leading-relaxed">
                          {selectedComplaint.description}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Update Status</h4>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      disabled={selectedComplaint.status === 'Pending'}
                      onClick={() => useComplaintStore.getState().updateStatus(selectedComplaint.id, 'Pending')}
                      className="flex-1 py-3 px-4 rounded-xl font-bold transition-all bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
                    >
                      Mark as Pending
                    </button>
                    <button 
                      disabled={selectedComplaint.status === 'In Progress'}
                      onClick={() => useComplaintStore.getState().updateStatus(selectedComplaint.id, 'In Progress')}
                      className="flex-1 py-3 px-4 rounded-xl font-bold transition-all bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/20"
                    >
                      Mark In Progress
                    </button>
                    <button 
                      disabled={selectedComplaint.status === 'Resolved'}
                      onClick={() => useComplaintStore.getState().updateStatus(selectedComplaint.id, 'Resolved')}
                      className="flex-1 py-3 px-4 rounded-xl font-bold transition-all bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-teal-500/20"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

