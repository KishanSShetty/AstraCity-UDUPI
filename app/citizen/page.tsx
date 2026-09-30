"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  MapPin, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  Leaf, 
  FileText, 
  Megaphone, 
  Trophy, 
  Clock, 
  Image as ImageIcon, 
  Map, 
  PhoneCall, 
  Mail, 
  Building2, 
  Facebook, 
  Twitter, 
  Instagram,
  Recycle,
  ArrowLeft,
  ShieldCheck,
  Languages
} from 'lucide-react';
import { useComplaintStore } from '@/lib/store';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';

export default function CitizenPortal() {
  const router = useRouter();
  const { loginAsAdmin } = useAuth();
  const { language, setLanguage } = useLanguage();

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

  const handleOfficerLogin = () => {
    loginAsAdmin();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 overflow-x-hidden font-sans pb-24">
      
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl"></div>
      </div>

      {/* Dedicated Citizen Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>

            <div className="h-5 w-px bg-slate-200" />

            <Link href="/citizen" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
                <Recycle className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-slate-900">AstraCity</span>
                  <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-800 tracking-wider">CITIZEN</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Udupi CMC Public Services</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              title="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>

            <Button
              onClick={handleOfficerLogin}
              variant="outline"
              className="border-emerald-300 text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 font-bold text-xs h-9 rounded-xl px-3 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Officer Login</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 md:pt-12">
        
        {/* Dynamic Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative"
        >
          {/* Decorative Floating Elements */}
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute hidden md:block top-6 left-6 p-4 bg-white/90 rounded-2xl backdrop-blur-md border border-slate-200 shadow-lg">
            <Trophy className="w-8 h-8 text-amber-500 mb-2" />
            <div className="text-2xl font-black text-slate-900">#1</div>
            <div className="text-xs text-slate-500 font-bold uppercase">Cleanest City Goal</div>
          </motion.div>

          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute hidden md:block top-6 right-6 p-4 bg-white/90 rounded-2xl backdrop-blur-md border border-slate-200 shadow-lg">
            <Leaf className="w-8 h-8 text-emerald-600 mb-2" />
            <div className="text-2xl font-black text-slate-900">100%</div>
            <div className="text-xs text-slate-500 font-bold uppercase">Source Segregation</div>
          </motion.div>

          <div className="inline-flex items-center justify-center p-3.5 bg-emerald-100 text-emerald-700 rounded-2xl mb-4 shadow-sm border border-emerald-200">
            <Map className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
            Namma Udupi Citizen Portal
          </h1>
          <p className="text-slate-600 text-base md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            Empowering citizens to build a cleaner, greener Udupi. Report issues, track your tickets in real time, and join the Swachh Udupi movement.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10"
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
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold transition-all duration-200 shadow-sm ${
                  isActive 
                    ? tab.color === 'emerald' ? 'bg-emerald-600 text-white shadow-emerald-500/20' :
                      tab.color === 'blue' ? 'bg-blue-600 text-white shadow-blue-500/20' :
                      tab.color === 'purple' ? 'bg-purple-600 text-white shadow-purple-500/20' :
                      'bg-amber-600 text-white shadow-amber-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
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
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 md:p-12 max-w-3xl mx-auto relative overflow-hidden"
              >
                <div className="mb-8 text-center">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">File a Cleanliness Report</h2>
                  <p className="text-slate-500 text-base">Found an illegal dump or overflowing bin? Let the Udupi CMC know immediately.</p>
                </div>

                <form onSubmit={submitReport} className="space-y-6 relative z-10">
                  
                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Photo Evidence <span className="text-red-500">*</span></label>
                    <label className={`block w-full border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${
                      photoPreview ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
                    }`}>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      {photoPreview ? (
                        <div className="relative aspect-[21/9] w-full group">
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            <span className="text-white font-bold flex items-center gap-2 bg-emerald-600 px-5 py-2.5 rounded-lg shadow-lg hover:scale-105 transition-transform"><Camera className="w-4 h-4"/> Change Photo</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600 border border-emerald-100">
                            <UploadCloud className="w-8 h-8" />
                          </div>
                          <span className="font-bold text-slate-700 text-base">Click to upload photo</span>
                          <span className="text-xs mt-1 text-slate-400">JPG, PNG up to 10MB</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Location & Description Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Location / Ward <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                        <input 
                          type="text" 
                          required
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          placeholder="e.g., Kadiyali Ward, Car Street"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Notes (Optional)</label>
                      <input 
                        type="text" 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Type of waste or severity..."
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium text-sm"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={reportState !== 'idle' || !photoPreview || !location}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
                  >
                    {reportState === 'idle' && (
                      <><UploadCloud className="w-5 h-5" /> Submit Report to CMC</>
                    )}
                    {reportState === 'uploading' && (
                      <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processing Geolocation...</>
                    )}
                    {reportState === 'success' && (
                      <><CheckCircle2 className="w-6 h-6" /> Successfully Reported!</>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* 2. TRACK COMPLAINTS TAB */}
            {activeTab === 'complaints' && (
              <motion.div
                key="complaints"
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto space-y-4"
              >
                {citizenComplaints.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-14 text-center shadow-lg">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">No complaints filed yet!</h3>
                    <p className="text-slate-500 text-base">Your neighborhood is looking clean. Thank you for your civic support!</p>
                  </div>
                ) : (
                  citizenComplaints.map((complaint, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      key={complaint.id} 
                      className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-all group shadow-sm"
                    >
                      <div className="flex items-start gap-5">
                        {complaint.photoUrl ? (
                           <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl border border-slate-200 shrink-0 overflow-hidden shadow-sm">
                             <img src={complaint.photoUrl} alt="Report" className="w-full h-full object-cover" />
                           </div>
                        ) : (
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Ticket {complaint.id}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-xs font-medium text-slate-500" suppressHydrationWarning>{new Date(complaint.date).toLocaleDateString()}</span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-lg mb-2">{complaint.type}</h3>
                          
                          <div className="flex flex-col gap-1.5">
                            <span className="flex items-center gap-1.5 text-slate-700 font-medium text-sm bg-slate-100 px-3 py-1 rounded-md w-fit">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {complaint.location}
                            </span>
                            {complaint.description && (
                              <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                                <FileText className="w-3.5 h-3.5 text-blue-500" /> {complaint.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-auto flex flex-col items-end gap-1.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</div>
                        <div className={`px-4 py-2 rounded-lg font-bold text-sm border flex items-center gap-2 ${
                          complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          complaint.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {complaint.status === 'Resolved' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {complaint.status === 'In Progress' && <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>}
                          {complaint.status === 'Pending' && <Clock className="w-4 h-4 text-blue-600" />}
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
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 20 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                {/* Hero Banner for Awareness */}
                <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-sm">
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">Swachh Udupi Mission</h2>
                  <p className="text-slate-600 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                    Udupi City Municipal Council mandates 100% source segregation of waste. Together, we can eliminate open landfills and foster a clean circular economy.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Segregation Guide */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col h-full shadow-sm">
                    <div className="flex items-center gap-3.5 mb-6">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100"><FileText className="w-6 h-6" /></div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Official Segregation Guide</h2>
                        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-0.5">Circular No. 2026/SWM</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-auto">
                      <div className="flex items-center gap-4 p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl shrink-0">🍏</div>
                        <div>
                          <h4 className="font-bold text-emerald-900 text-base">Wet Waste (Green Bin)</h4>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">Food scraps, peels, organic matter. Collected daily for Biomethanation.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-blue-50/50 border border-blue-200/80 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 text-2xl shrink-0">📦</div>
                        <div>
                          <h4 className="font-bold text-blue-900 text-base">Dry Waste (Blue Bin)</h4>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">Plastics, paper, metal, glass. Handed over bi-weekly to DWCCs.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-red-50/50 border border-red-200/80 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-700 text-2xl shrink-0">🔋</div>
                        <div>
                          <h4 className="font-bold text-red-900 text-base">Hazardous/Sanitary (Red)</h4>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">Batteries, e-waste, sanitary items. Wrap in paper with a red mark.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Swachagraha Leaderboard */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col h-full shadow-sm">
                    <div className="flex items-center gap-3.5 mb-6">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100"><Trophy className="w-6 h-6" /></div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Swachagraha Warriors</h2>
                        <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-0.5">Monthly Leaderboard</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-200">
                      {[
                        { rank: 1, name: 'Ankita P.', ward: 'Manipal', pts: 1250 },
                        { rank: 2, name: 'Rohan Shetty', ward: 'Malpe', pts: 1120 },
                        { rank: 3, name: 'Dr. Ramesh K.', ward: 'Kadiyali', pts: 985 },
                        { rank: 4, name: 'Priya Nayak', ward: 'Ambalpadi', pts: 840 },
                        { rank: 5, name: 'Karthik Rao', ward: 'Udupi Central', pts: 720 },
                      ].map((user, i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                              i === 0 ? 'bg-amber-400 text-amber-950 shadow-sm' : 
                              i === 1 ? 'bg-slate-300 text-slate-800' : 
                              i === 2 ? 'bg-amber-600 text-white' : 
                              'bg-slate-200 text-slate-600'
                            }`}>
                              {user.rank}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                              <div className="text-xs text-slate-500">{user.ward}</div>
                            </div>
                          </div>
                          <div className="font-mono text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-md text-xs">
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
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 20 }}
                transition={{ duration: 0.3 }}
                className="max-w-5xl mx-auto"
              >
                <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
                  <div className="text-center max-w-2xl mx-auto mb-10">
                    <div className="inline-flex items-center justify-center p-3.5 bg-amber-50 text-amber-600 rounded-2xl mb-4 border border-amber-200">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">Get in Touch</h2>
                    <p className="text-slate-500 text-base font-medium">Udupi City Municipal Council (CMC) is accessible for citizen grievances, feedback, and emergency assistance.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Address Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-amber-400 transition-all group">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Head Office</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        City Municipal Council<br/>
                        K.M. Marg, Udupi<br/>
                        Karnataka 576101<br/>
                        India
                      </p>
                    </div>

                    {/* Contact Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-blue-400 transition-all group">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <PhoneCall className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Contact Info</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 text-slate-600 text-sm font-medium">
                          <PhoneCall className="w-4 h-4 text-slate-400" />
                          <span>0820-2520306 (Admin)</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-rose-700 text-sm font-bold">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>1903 (SWM Helpline)</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-600 text-sm font-medium">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>cmcudupi@gmail.com</span>
                        </div>
                      </div>
                    </div>

                    {/* Social Media Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-purple-400 transition-all group">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Megaphone className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Social Media</h3>
                      <p className="text-slate-600 text-sm mb-4">Follow official channels for daily updates and city programs.</p>
                      <div className="flex gap-3">
                        <a href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-colors"><Facebook className="w-5 h-5" /></a>
                        <a href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-white hover:bg-[#1DA1F2] hover:border-[#1DA1F2] transition-colors"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-white hover:bg-[#E1306C] hover:border-[#E1306C] transition-colors"><Instagram className="w-5 h-5" /></a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <p className="text-emerald-800 font-semibold text-sm">In case of severe illegal dumping or biomedical waste exposure, please contact the SWM Helpline (1903) immediately.</p>
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
