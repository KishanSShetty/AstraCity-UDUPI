"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, UploadCloud, AlertCircle, CheckCircle2, Leaf, FileText, Megaphone, Trophy, Clock, Image as ImageIcon, Map, PhoneCall, Mail, Building2, Facebook, Twitter, Instagram } from 'lucide-react';
import { useComplaintStore } from '@/lib/store';

export default function CitizenPortal() {
  const [activeTab, setActiveTab] = useState<string>('report');
  const [reportState, setReportState] = useState<string>('idle');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const { complaints, addComplaint } = useComplaintStore();
  const citizenComplaints = complaints.filter((c: any) => !c.type.startsWith('[FIELD AGENT]'));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPhotoPreview(url);
    }
  };

  const submitReport = (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans pb-24">
      
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-500/15 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-500/15 rounded-full blur-[140px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 md:pt-20">
        
        {/* Dynamic Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative"
        >
          {/* Decorative Floating Elements */}
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute hidden md:block top-10 left-10 p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
            <Trophy className="w-8 h-8 text-amber-400 mb-2" />
            <div className="text-2xl font-black text-white">#1</div>
            <div className="text-xs text-slate-400 font-bold uppercase">Cleanest City Goal</div>
          </motion.div>

          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute hidden md:block top-10 right-10 p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
            <Leaf className="w-8 h-8 text-emerald-400 mb-2" />
            <div className="text-2xl font-black text-white">100%</div>
            <div className="text-xs text-slate-400 font-bold uppercase">Source Segregation</div>
          </motion.div>

          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 rounded-3xl mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)] border border-emerald-500/30">
            <Map className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 mb-6 tracking-tight">
            Namma Udupi Portal
          </h1>
          <p className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
            Empowering citizens to build a cleaner, greener city. Report issues, track your impact, and join the Swachagraha movement today.
          </p>
        </motion.div>

        {/* Premium Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12"
        >
          {[
            { id: 'report', label: 'File Report', icon: AlertCircle, color: 'emerald' },
            { id: 'complaints', label: 'Track Status', icon: Clock, color: 'blue' },
            { id: 'guidelines', label: 'Awareness', icon: Megaphone, color: 'purple' },
            { id: 'contact', label: 'Contact CMC', icon: PhoneCall, color: 'amber' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                  isActive 
                    ? `bg-${tab.color}-500 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-105` 
                    : 'bg-slate-900/80 backdrop-blur-md text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-slate-700/50'
                }`}
                style={isActive && tab.color === 'emerald' ? { backgroundColor: '#10b981', boxShadow: '0 0 30px rgba(16,185,129,0.4)' } : 
                       isActive && tab.color === 'blue' ? { backgroundColor: '#3b82f6', boxShadow: '0 0 30px rgba(59,130,246,0.4)' } :
                       isActive && tab.color === 'purple' ? { backgroundColor: '#a855f7', boxShadow: '0 0 30px rgba(168,85,247,0.4)' } :
                       isActive && tab.color === 'amber' ? { backgroundColor: '#f59e0b', boxShadow: '0 0 30px rgba(245,158,11,0.4)' } : {}}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm md:text-base">{tab.label}</span>
              </button>
            )
          })}
        </motion.div>

        {/* Tab Content area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* 1. REPORT TAB */}
            {activeTab === 'report' && (
              <motion.div
                key="report"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                className="bg-slate-900/70 backdrop-blur-3xl border border-slate-800/80 rounded-[2rem] shadow-2xl p-8 md:p-12 max-w-3xl mx-auto relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10"></div>
                
                <div className="mb-10 text-center">
                  <h2 className="text-3xl font-black text-white mb-3 tracking-tight">File a Cleanliness Report</h2>
                  <p className="text-slate-400 text-lg">Found an illegal dump or overflowing bin? Let the Udupi CMC know immediately.</p>
                </div>

                <form onSubmit={submitReport} className="space-y-8 relative z-10">
                  
                  {/* Photo Upload */}
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-slate-400 ml-1">Photo Evidence <span className="text-red-400">*</span></label>
                    <label className={`block w-full border-2 border-dashed rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${
                      photoPreview ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/80'
                    }`}>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      {photoPreview ? (
                        <div className="relative aspect-[21/9] w-full group">
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            <span className="text-white font-bold flex items-center gap-2 bg-emerald-500/90 px-6 py-3 rounded-xl shadow-xl hover:scale-105 transition-transform"><Camera className="w-5 h-5"/> Change Photo</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-16 flex flex-col items-center justify-center text-slate-500">
                          <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-6 text-emerald-400 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] border border-slate-800">
                            <UploadCloud className="w-10 h-10" />
                          </div>
                          <span className="font-bold text-slate-300 text-lg">Click to upload photo</span>
                          <span className="text-sm mt-2 text-slate-500">JPG, PNG up to 10MB</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Location & Description Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-widest text-slate-400 ml-1">Location / Ward <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                        <input 
                          type="text" 
                          required
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          placeholder="e.g., Kadiyali Ward"
                          className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500 rounded-2xl py-4 pl-14 pr-4 text-white placeholder-slate-600 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-widest text-slate-400 ml-1">Notes (Optional)</label>
                      <input 
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Type of waste or severity..."
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500 rounded-2xl py-4 px-5 text-white placeholder-slate-600 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={reportState !== 'idle' || !photoPreview || !location}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xl py-5 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_50px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden relative"
                  >
                    {reportState === 'idle' && (
                      <><UploadCloud className="w-6 h-6" /> Submit Report to CMC</>
                    )}
                    {reportState === 'uploading' && (
                      <><span className="w-6 h-6 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></span> Processing Geolocation...</>
                    )}
                    {reportState === 'success' && (
                      <><CheckCircle2 className="w-7 h-7" /> Successfully Reported!</>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* 2. TRACK COMPLAINTS TAB */}
            {activeTab === 'complaints' && (
              <motion.div
                key="complaints"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {citizenComplaints.length === 0 ? (
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-16 text-center shadow-2xl">
                    <div className="w-24 h-24 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">No complaints filed yet!</h3>
                    <p className="text-slate-400 text-lg">Your neighborhood is looking clean. Thank you for your support!</p>
                  </div>
                ) : (
                  citizenComplaints.map((complaint, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={complaint.id} 
                      className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-800/90 hover:border-slate-700 transition-all shadow-xl group overflow-hidden relative"
                    >
                      {/* Status Background Glow */}
                      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] -z-10 opacity-30 ${
                        complaint.status === 'Resolved' ? 'bg-emerald-500' : 
                        complaint.status === 'In Progress' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}></div>

                      <div className="flex items-start gap-6">
                        {complaint.photoUrl ? (
                           <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 border-slate-700/50 shrink-0 overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500">
                             <img src={complaint.photoUrl} alt="Report" className="w-full h-full object-cover" />
                           </div>
                        ) : (
                          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-slate-950/80 border-2 border-slate-800 flex items-center justify-center text-slate-600 shrink-0 shadow-lg">
                            <ImageIcon className="w-10 h-10" />
                          </div>
                        )}
                        <div className="pt-2">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-black tracking-widest text-slate-500 uppercase">Ticket {complaint.id}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                            <span className="text-xs font-bold text-slate-400" suppressHydrationWarning>{new Date(complaint.date).toLocaleDateString()}</span>
                          </div>
                          <h3 className="font-black text-white text-xl md:text-2xl mb-3 tracking-tight">{complaint.type}</h3>
                          
                          <div className="flex flex-col gap-2">
                            <span className="flex items-center gap-2 text-slate-300 font-medium bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800/50 w-fit">
                              <MapPin className="w-4 h-4 text-emerald-400" /> {complaint.location}
                            </span>
                            {complaint.description && (
                              <span className="flex items-center gap-2 text-slate-400 font-medium text-sm mt-1">
                                <FileText className="w-4 h-4 text-blue-400" /> {complaint.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-auto flex flex-col items-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                        <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Live Status</div>
                        <div className={`px-6 py-3 rounded-xl font-black text-sm md:text-base border-2 shadow-[0_0_20px_rgba(0,0,0,0.2)] flex items-center gap-2 ${
                          complaint.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                          complaint.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}>
                          {complaint.status === 'Resolved' && <CheckCircle2 className="w-5 h-5" />}
                          {complaint.status === 'In Progress' && <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>}
                          {complaint.status === 'Pending' && <Clock className="w-5 h-5" />}
                          {complaint.status}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* 3. GUIDELINES & AWARENESS TAB */}
            {activeTab === 'guidelines' && (
              <motion.div
                key="guidelines"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                {/* Hero Banner for Awareness */}
                <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden backdrop-blur-xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -z-10"></div>
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Swachh Udupi Mission</h2>
                  <p className="text-lg md:text-xl text-purple-200/80 max-w-2xl font-medium leading-relaxed">
                    Udupi City Municipal Council mandates 100% source segregation of waste. Together, we can prevent landfills and promote a circular economy.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Segregation Guide */}
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 md:p-10 flex flex-col h-full hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.2)]"><FileText className="w-8 h-8" /></div>
                      <div>
                        <h2 className="text-2xl font-black text-white">Official Segregation Guide</h2>
                        <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mt-1">Circular No. 2026/SWM</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mt-auto">
                      <div className="flex items-center gap-5 p-5 bg-slate-950/50 border border-green-500/20 rounded-2xl hover:bg-green-500/5 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 text-3xl shadow-inner border border-green-500/20">🍏</div>
                        <div>
                          <h4 className="font-black text-green-400 text-xl tracking-tight">Wet Waste (Green Bin)</h4>
                          <p className="text-sm text-slate-400 font-medium mt-1 leading-relaxed">Food scraps, peels, organic matter. Goes to Biomethanation plants daily.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 p-5 bg-slate-950/50 border border-blue-500/20 rounded-2xl hover:bg-blue-500/5 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-3xl shadow-inner border border-blue-500/20">📦</div>
                        <div>
                          <h4 className="font-black text-blue-400 text-xl tracking-tight">Dry Waste (Blue Bin)</h4>
                          <p className="text-sm text-slate-400 font-medium mt-1 leading-relaxed">Plastics, paper, metal, glass. Handed over bi-weekly to localized DWCCs.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 p-5 bg-slate-950/50 border border-red-500/20 rounded-2xl hover:bg-red-500/5 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 text-3xl shadow-inner border border-red-500/20">🔋</div>
                        <div>
                          <h4 className="font-black text-red-400 text-xl tracking-tight">Hazardous/Sanitary (Red)</h4>
                          <p className="text-sm text-slate-400 font-medium mt-1 leading-relaxed">Batteries, medical waste, diapers. Must be wrapped in newspaper with red cross.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Swachagraha Leaderboard */}
                  <div className="bg-gradient-to-br from-slate-900/80 to-emerald-900/30 backdrop-blur-xl border border-emerald-500/20 rounded-[2.5rem] p-8 md:p-10 flex flex-col h-full relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                      <Trophy className="w-72 h-72 text-emerald-400" />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-8 relative z-10">
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)]"><Trophy className="w-8 h-8" /></div>
                      <div>
                        <h2 className="text-2xl font-black text-white">Swachagraha Warriors</h2>
                        <div className="text-sm font-bold text-emerald-400 uppercase tracking-widest mt-1">Monthly Leaderboard</div>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 rounded-3xl border border-emerald-500/10 overflow-hidden relative z-10 shadow-2xl">
                      {[
                        { rank: 1, name: 'Ankita P.', ward: 'Manipal', pts: 1250 },
                        { rank: 2, name: 'Rohan Shetty', ward: 'Malpe', pts: 1120 },
                        { rank: 3, name: 'Dr. Ramesh K.', ward: 'Kadiyali', pts: 985 },
                        { rank: 4, name: 'Priya Nayak', ward: 'Ambalpadi', pts: 840 },
                        { rank: 5, name: 'Karthik Rao', ward: 'Udupi Central', pts: 720 },
                      ].map((user, i) => (
                        <div key={i} className={`flex items-center justify-between p-5 ${i !== 4 ? 'border-b border-emerald-500/10' : ''} hover:bg-emerald-500/5 transition-colors`}>
                          <div className="flex items-center gap-5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner ${
                              i === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950' : 
                              i === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900' : 
                              i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100' : 
                              'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {user.rank}
                            </div>
                            <div>
                              <div className="font-black text-slate-200 text-lg">{user.name}</div>
                              <div className="text-xs font-bold text-slate-500 tracking-wide">{user.ward}</div>
                            </div>
                          </div>
                          <div className="font-mono text-emerald-400 font-black bg-emerald-500/10 px-4 py-1.5 rounded-xl border border-emerald-500/20">
                            {user.pts} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. CONTACT CMC TAB */}
            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4 }}
                className="max-w-5xl mx-auto"
              >
                <div className="bg-slate-900/70 backdrop-blur-3xl border border-slate-800 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
                  
                  <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 text-amber-400 rounded-3xl mb-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] border border-amber-500/20">
                      <Building2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Get in Touch</h2>
                    <p className="text-slate-400 text-lg md:text-xl font-medium">Udupi City Municipal Council (CMC) is always available for citizen grievances, feedback, and emergencies.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Address Card */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-8 hover:border-amber-500/30 hover:bg-slate-900 transition-all group">
                      <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <MapPin className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-4">Head Office</h3>
                      <p className="text-slate-400 font-medium leading-relaxed">
                        City Municipal Council<br/>
                        K.M. Marg, Udupi<br/>
                        Karnataka 576101<br/>
                        India
                      </p>
                    </div>

                    {/* Contact Card */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-8 hover:border-blue-500/30 hover:bg-slate-900 transition-all group">
                      <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <PhoneCall className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-4">Contact Info</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-400 font-medium">
                          <PhoneCall className="w-5 h-5 text-slate-500" />
                          <span>0820-2520306 (Admin)</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 font-medium">
                          <AlertCircle className="w-5 h-5 text-rose-500" />
                          <span className="text-rose-400 font-bold">1903 (SWM Helpline)</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 font-medium">
                          <Mail className="w-5 h-5 text-slate-500" />
                          <span>cmcudupi@gmail.com</span>
                        </div>
                      </div>
                    </div>

                    {/* Social Media Card */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-8 hover:border-purple-500/30 hover:bg-slate-900 transition-all group">
                      <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Megaphone className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-4">Social Media</h3>
                      <p className="text-slate-400 font-medium mb-6">Follow official channels for daily updates and programs.</p>
                      <div className="flex gap-4">
                        <a href="#" className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-colors"><Facebook className="w-6 h-6" /></a>
                        <a href="#" className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1DA1F2] hover:border-[#1DA1F2] transition-colors"><Twitter className="w-6 h-6" /></a>
                        <a href="#" className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#E1306C] hover:border-[#E1306C] transition-colors"><Instagram className="w-6 h-6" /></a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                    <p className="text-emerald-400 font-bold">In case of severe illegal dumping or biomedical waste exposure, please contact the SWM Helpline immediately.</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
