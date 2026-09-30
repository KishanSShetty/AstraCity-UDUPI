"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, UploadCloud, AlertCircle, CheckCircle2, Leaf, FileText, Megaphone, Trophy, Clock, Image as ImageIcon } from 'lucide-react';
import { useComplaintStore } from '@/lib/store';

export default function CitizenPortal() {
  const [activeTab, setActiveTab] = useState<'report' | 'complaints' | 'guidelines'>('report');
  const [reportState, setReportState] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

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
        type: 'Citizen Report',
        photoUrl: photoPreview
      });
      setReportState('success');
      setTimeout(() => {
        setReportState('idle');
        setPhotoPreview(null);
        setLocation('');
        setDescription('');
        setActiveTab('complaints');
      }, 2500);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] border border-emerald-500/20">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-4 tracking-tight">
            Udupi Citizen Portal
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Join the Swachagraha movement. Report issues, track complaints, and help us build a cleaner, greener Udupi.
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
            { id: 'report', label: 'Report Issue', icon: AlertCircle },
            { id: 'complaints', label: 'My Complaints', icon: Clock },
            { id: 'guidelines', label: 'Circulars & Programs', icon: Megaphone }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105' 
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
                  <h2 className="text-2xl font-black text-white mb-2">File a Cleanliness Report</h2>
                  <p className="text-slate-400">Found an illegal dump or overflowing bin? Let the CMC know immediately.</p>
                </div>

                <form onSubmit={submitReport} className="space-y-6">
                  
                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Photo Evidence <span className="text-red-400">*</span></label>
                    <label className={`block w-full border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-colors ${
                      photoPreview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50'
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
                          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-emerald-400 shadow-inner">
                            <UploadCloud className="w-8 h-8" />
                          </div>
                          <span className="font-bold text-slate-300">Click to upload photo</span>
                          <span className="text-sm mt-1">JPG, PNG up to 10MB</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Location / Ward <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        type="text" 
                        required
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g., Near Syndicate Circle, Manipal"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Description (Optional)</label>
                    <textarea 
                      rows={3}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe the type of waste or severity..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none resize-none font-medium"
                    ></textarea>
                  </div>

                  {/* Submit */}
                  <button 
                    type="submit" 
                    disabled={reportState !== 'idle' || !photoPreview || !location}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-lg py-4 rounded-xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden relative"
                  >
                    {reportState === 'idle' && (
                      <><UploadCloud className="w-5 h-5" /> Submit Report</>
                    )}
                    {reportState === 'uploading' && (
                      <><span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span> Processing Geolocation...</>
                    )}
                    {reportState === 'success' && (
                      <><CheckCircle2 className="w-6 h-6" /> Successfully Reported!</>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* MY COMPLAINTS TAB */}
            {activeTab === 'complaints' && (
              <motion.div
                key="complaints"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto space-y-4"
              >
                {complaints.length === 0 ? (
                   <div className="text-slate-400 text-center py-8">No complaints filed yet.</div>
                ) : (
                  complaints.map((complaint, i) => (
                    <div key={complaint.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-800/80 transition-colors">
                      <div className="flex items-start gap-4">
                        {complaint.photoUrl ? (
                           <div className="w-12 h-12 rounded-xl border border-slate-800 shrink-0 overflow-hidden">
                             <img src={complaint.photoUrl} alt="Report" className="w-full h-full object-cover" />
                           </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-200 text-lg">{complaint.type}</h3>
                          <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md">#{complaint.id}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {complaint.location}</span>
                          <span className="flex items-center gap-1" suppressHydrationWarning><Clock className="w-4 h-4" /> {new Date(complaint.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-4 py-2 rounded-full font-bold text-sm border shadow-sm ${
                      complaint.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      complaint.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {complaint.status}
                    </div>
                  </div>
                  ))
                )}
              </motion.div>
            )}

            {/* GUIDELINES & AWARENESS TAB */}
            {activeTab === 'guidelines' && (
              <motion.div
                key="guidelines"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Segregation Guide */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><FileText className="w-6 h-6" /></div>
                    <h2 className="text-xl font-bold text-white">Segregation Circular</h2>
                  </div>
                  <p className="text-slate-400 mb-6 font-medium leading-relaxed">
                    By order of the Udupi CMC Commissioner, all households must segregate waste into three distinct categories before handover to collection vehicles.
                  </p>
                  
                  <div className="space-y-4 mt-auto">
                    <div className="flex items-center gap-4 p-4 bg-slate-950/50 border border-green-500/20 rounded-2xl">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-2xl">🍏</div>
                      <div>
                        <h4 className="font-bold text-green-400 text-lg">Wet Waste (Green Bin)</h4>
                        <p className="text-sm text-slate-500 font-medium">Food scraps, peels, organic matter. Goes to Biomethanation.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-950/50 border border-blue-500/20 rounded-2xl">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-2xl">📦</div>
                      <div>
                        <h4 className="font-bold text-blue-400 text-lg">Dry Waste (Blue Bin)</h4>
                        <p className="text-sm text-slate-500 font-medium">Plastics, paper, metal, glass. Processed at localized DWCCs.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-950/50 border border-red-500/20 rounded-2xl">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-2xl">🔋</div>
                      <div>
                        <h4 className="font-bold text-red-400 text-lg">Hazardous/Sanitary (Red)</h4>
                        <p className="text-sm text-slate-500 font-medium">Batteries, medical waste, diapers. Wrapped separately.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Swachagraha Leaderboard */}
                <div className="bg-gradient-to-br from-slate-900/60 to-emerald-900/20 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 md:p-8 flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Trophy className="w-48 h-48 text-emerald-400" />
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><Trophy className="w-6 h-6" /></div>
                    <h2 className="text-xl font-bold text-white">Swachagraha Warriors</h2>
                  </div>
                  
                  <p className="text-emerald-100/80 mb-6 font-medium leading-relaxed relative z-10">
                    Citizens actively participating in the SWM program earn points for 100% source segregation and reporting dumps.
                  </p>

                  <div className="bg-slate-950/60 rounded-2xl border border-emerald-500/10 overflow-hidden relative z-10">
                    {[
                      { rank: 1, name: 'Ankita P.', ward: 'Manipal', pts: 1250 },
                      { rank: 2, name: 'Rohan Shetty', ward: 'Malpe', pts: 1120 },
                      { rank: 3, name: 'Dr. Ramesh K.', ward: 'Kadiyali', pts: 985 },
                      { rank: 4, name: 'Priya Nayak', ward: 'Ambalpadi', pts: 840 },
                    ].map((user, i) => (
                      <div key={i} className={`flex items-center justify-between p-4 ${i !== 3 ? 'border-b border-emerald-500/10' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                            i === 0 ? 'bg-amber-400 text-amber-900' : 
                            i === 1 ? 'bg-slate-300 text-slate-800' : 
                            i === 2 ? 'bg-amber-700 text-amber-100' : 
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {user.rank}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200">{user.name}</div>
                            <div className="text-xs text-slate-500">{user.ward}</div>
                          </div>
                        </div>
                        <div className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg">
                          {user.pts} pts
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="mt-6 w-full py-4 rounded-xl border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/10 transition-colors relative z-10">
                    View Full Leaderboard
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
