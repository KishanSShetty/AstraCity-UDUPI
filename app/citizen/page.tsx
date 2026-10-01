'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  MapPin,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Search,
  Filter,
  PhoneCall,
  Mail,
  Building2,
  ShieldCheck,
  Languages,
  ArrowLeft,
  Recycle,
  FileText,
  Trophy,
  Leaf,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Navigation,
  AlertTriangle,
  Send,
  HelpCircle,
} from 'lucide-react';
import { useComplaintStore, ComplaintStatus, useAuthStore } from '@/lib/store';

const UDUPI_WARDS = [

  'Ward 01 - Santhekatte Market',
  'Ward 04 - Malpe Harbor & Port',
  'Ward 05 - Kola Seaface',
  'Ward 12 - Karavali Bypass',
  'Ward 14 - Bannanje Bus Stand',
  'Ward 18 - Manipal University',
  'Ward 19 - Saralebettu',
  'Ward 22 - Kadiyali Temple Road',
  'Ward 24 - Kasturba Nagar / Beedinagudde',
  'Ward 25 - Maruthi Veethika / Car Street',
  'Ward 28 - Ambalpadi Junction',
  'Ward 30 - Alevoor Border / Karvalu',
];

const ISSUE_CATEGORIES = [
  { id: 'Overflowing Bin', label: 'Overflowing Waste Bin', icon: '🗑️' },
  { id: 'Illegal Blackspot Dump', label: 'Illegal Roadside Dumping', icon: '⚠️' },
  { id: 'Missed Collection', label: 'Missed Door-to-Door Tipper', icon: '🛺' },
  { id: 'Clogged Drain', label: 'Plastic-Blocked Storm Drain', icon: '🌊' },
  { id: 'Commercial / Fish Waste', label: 'Commercial / Fishery Waste', icon: '🐟' },
  { id: 'Dead Animal Removal', label: 'Animal Carcass Removal', icon: '🚨' },
];

export default function CitizenPortal() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [language, setLanguage] = useState<'en' | 'kn'>('en');

  const [activeTab, setActiveTab] = useState<'report' | 'tickets' | 'guide' | 'contact'>('report');

  // Form State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('Overflowing Bin');
  const [severity, setSeverity] = useState<'normal' | 'high' | 'critical'>('normal');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [citizenPhone, setCitizenPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const [locationDetecting, setLocationDetecting] = useState<boolean>(false);

  // Tickets Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ComplaintStatus>('ALL');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { complaints, addComplaint } = useComplaintStore();
  const citizenComplaints = complaints.filter((c: any) => !c.type.startsWith('[FIELD AGENT]'));

  // Photo Handlers
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleClearPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Geolocation detector
  const handleDetectLocation = () => {
    setLocationDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSelectedWard('Ward 24 - Kasturba Nagar / Beedinagudde');
          setLandmark(`GPS: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E (Udupi Central)`);
          setLocationDetecting(false);
        },
        () => {
          // Fallback if denied
          setSelectedWard('Ward 25 - Maruthi Veethika / Car Street');
          setLandmark('Near Sri Krishna Temple Car Street');
          setLocationDetecting(false);
        },
        { timeout: 3000 }
      );
    } else {
      setSelectedWard('Ward 25 - Maruthi Veethika / Car Street');
      setLocationDetecting(false);
    }
  };

  // Form Submit
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWard) return;

    setIsSubmitting(true);
    const locationString = `${selectedWard}${landmark ? ` - ${landmark}` : ''}`;
    const descString = `[${severity.toUpperCase()}] ${notes ? notes : 'Citizen reported issue.'} (Contact: ${citizenPhone || 'Anonymous'})`;

    setTimeout(() => {
      addComplaint({
        location: locationString,
        description: descString,
        type: category,
        photoUrl: photoPreview,
      });

      const newTicketId = `UD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setLastSubmittedId(newTicketId);
      setIsSubmitting(false);

      // Reset form
      setPhotoPreview(null);
      setSelectedWard('');
      setLandmark('');
      setNotes('');
      setCitizenPhone('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1200);
  };

  const handleOfficerLogin = () => {
    login('municipal');
    router.push('/dashboard');
  };

  // Filtered tickets
  const filteredTickets = citizenComplaints.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#070D1A] text-slate-100 font-sans pb-24 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Sleek Municipal Grievance Sub-Bar */}
      <div className="w-full bg-[#0A101F]/80 backdrop-blur-md border-b border-white/[0.08] py-2.5 px-4 sm:px-6 sticky top-[65px] z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-emerald-400 font-bold">Public Grievance Redressal</span>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="tel:1903"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/20 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              <span>SWM Helpline: 1903</span>
            </a>

            <button
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              title="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>

            <button
              onClick={handleOfficerLogin}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Officer Portal</span>
            </button>
          </div>
        </div>
      </div>


      {/* 2. Structured Hero Section */}
      <section
        className="relative border-b border-white/[0.08] pt-12 pb-10 px-4 sm:px-6 overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.12), transparent 70%)',
        }}
      >
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Government Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Government of Karnataka · Udupi CMC Public Grievance Redressal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto">
            Namma Udupi Cleanliness Portal
          </h1>
          <p className="text-slate-400 font-medium text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
            Report blackspots, schedule bulk waste pickup, track grievance tickets in real time, and support 100% source segregation across all 35 Udupi municipal wards.
          </p>

          {/* 4-Stat Metric Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto mt-8">
            <div className="bg-[#0D1528]/80 hover:bg-[#111C35] p-4 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-xl backdrop-blur-md flex flex-col items-center justify-center transition-all">
              <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-lg font-black text-white">#1 Goal</span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Cleanest City Mission
              </p>
            </div>

            <div className="bg-[#0D1528]/80 hover:bg-[#111C35] p-4 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-xl backdrop-blur-md flex flex-col items-center justify-center transition-all">
              <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                <Leaf className="w-4 h-4" />
                <span className="text-lg font-black text-white">100%</span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Source Segregation
              </p>
            </div>

            <div className="bg-[#0D1528]/80 hover:bg-[#111C35] p-4 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-xl backdrop-blur-md flex flex-col items-center justify-center transition-all">
              <div className="flex items-center gap-1.5 text-sky-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-lg font-black text-white">&lt; 24 Hrs</span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Avg Resolution SLA
              </p>
            </div>

            <div className="bg-[#0D1528]/80 hover:bg-[#111C35] p-4 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-xl backdrop-blur-md flex flex-col items-center justify-center transition-all">
              <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-lg font-black text-white">35 Wards</span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Daily Fleet Coverage
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dark Segmented Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-[#0B1222] rounded-2xl border border-slate-800 max-w-full overflow-x-auto shadow-2xl">
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-emerald-400" />
              <span>File Report</span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'tickets'
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.25)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Track Tickets</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-black border border-slate-700">
                {citizenComplaints.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Recycle className="w-4 h-4 text-emerald-400" />
              <span>Segregation Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Contact CMC</span>
            </button>
          </div>
        </div>

        {/* 4. Tab Contents */}
        <AnimatePresence mode="wait">
          {/* TAB 1: FILE REPORT */}
          {activeTab === 'report' && (
            <motion.div
              key="report-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              {/* Success Notification Banner */}
              {lastSubmittedId && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 flex items-start justify-between shadow-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Complaint Successfully Registered!</h4>
                      <p className="text-xs text-emerald-300/90 mt-0.5">
                        Your Ticket ID is <strong className="underline text-white">{lastSubmittedId}</strong>. Auto Tipper and Sanitation Supervisor for your ward have been notified.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setLastSubmittedId(null);
                      setActiveTab('tickets');
                    }}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-black shrink-0 transition-colors cursor-pointer"
                  >
                    View Status →
                  </button>
                </div>
              )}

              {/* Form Card */}
              <div className="bg-[#0D1528]/90 rounded-3xl border border-slate-800/90 shadow-2xl p-6 sm:p-10 backdrop-blur-xl">
                <div className="border-b border-slate-800/80 pb-5 mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    File a Cleanliness Grievance
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                    Submit photo evidence and location. Udupi Municipal Council dispatches local collection tippers within 24 hours.
                  </p>
                </div>

                <form onSubmit={handleSubmitReport} className="space-y-6">
                  {/* Photo Dropzone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Photo Evidence (Recommended)
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />

                    {photoPreview ? (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group">
                        <img
                          src={photoPreview}
                          alt="Evidence preview"
                          className="w-full h-56 object-cover"
                        />
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-bold border border-slate-700 shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Change Photo
                          </button>
                          <button
                            type="button"
                            onClick={handleClearPhoto}
                            className="p-1.5 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-500 transition-colors cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                          ✓ Image Attached
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer bg-[#070D18]/80 hover:bg-emerald-950/20 transition-all text-center group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-white">
                          Click to upload or take photo
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Supports JPG, PNG, WEBP (Max 10MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Grievance Category <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {ISSUE_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                            category === cat.id
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                              : 'bg-[#070D18] border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-[#0a1222]'
                          }`}
                        >
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-xs font-bold leading-tight">
                            {cat.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Severity Level */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Urgency Level
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'normal', label: 'Standard (24h)', color: 'text-slate-200', activeBg: 'bg-slate-800 border-slate-600' },
                        { id: 'high', label: 'High (12h)', color: 'text-amber-300', activeBg: 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]' },
                        { id: 'critical', label: 'Critical (4h SLA)', color: 'text-rose-300', activeBg: 'bg-rose-500/15 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)]' },
                      ].map((sev) => (
                        <button
                          key={sev.id}
                          type="button"
                          onClick={() => setSeverity(sev.id as any)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                            severity === sev.id
                              ? `${sev.activeBg} ${sev.color}`
                              : 'bg-[#070D18] border-slate-800 text-slate-400 hover:bg-[#0a1222]'
                          }`}
                        >
                          {sev.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ward & Location Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Ward / Locality <span className="text-rose-400">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={locationDetecting}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>{locationDetecting ? 'Detecting...' : 'Detect GPS'}</span>
                        </button>
                      </div>

                      <select
                        required
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-slate-700 bg-[#070D18] text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="" className="bg-[#070D18] text-slate-400">Select Udupi Ward...</option>
                        {UDUPI_WARDS.map((ward) => (
                          <option key={ward} value={ward} className="bg-[#070D18] text-white">
                            {ward}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Street / Landmark
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g. Near Big Bazaar, Kavi Muddana Marg"
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-[#070D18] text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  {/* Notes & Mobile Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Additional Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Specific details about waste volume, blockages, etc."
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-[#070D18] text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Citizen Phone (For SMS)
                      </label>
                      <input
                        type="tel"
                        value={citizenPhone}
                        onChange={(e) => setCitizenPhone(e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-[#070D18] text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedWard}
                    className="w-full h-12 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Dispatching to CMC Ward Supervisor...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Report to Udupi CMC</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 2: TRACK TICKETS */}
          {activeTab === 'tickets' && (
            <motion.div
              key="tickets-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto space-y-4"
            >
              {/* Search & Filter Header */}
              <div className="bg-[#0D1528]/80 p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Ticket ID or Location..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-700 bg-[#070D18] text-white placeholder:text-slate-500 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Status Pills */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                  {(['ALL', 'Pending', 'In Progress', 'Resolved'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statusFilter === st
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets List */}
              {filteredTickets.length === 0 ? (
                <div className="bg-[#0D1528]/90 rounded-3xl border border-slate-800 p-12 text-center shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white">No Tickets Found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    No active cleanliness grievances match the selected filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map((t) => {
                    const isPending = t.status === 'Pending';
                    const isInProgress = t.status === 'In Progress';
                    const isResolved = t.status === 'Resolved';

                    return (
                      <div
                        key={t.id}
                        className="bg-[#0D1528]/90 rounded-2xl border border-slate-800/80 hover:border-slate-700 p-5 shadow-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          {t.photoUrl ? (
                            <img
                              src={t.photoUrl}
                              alt="Ticket thumbnail"
                              className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                              <AlertCircle className="w-6 h-6" />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-black text-emerald-400">
                                {t.id}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-600" />
                              <span className="text-[11px] font-semibold text-slate-400">
                                {new Date(t.date).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-white">{t.type}</h4>
                            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="line-clamp-1">{t.location}</span>
                            </p>
                            {t.description && (
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                                {t.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Badge & 3-Step Tracker */}
                        <div className="w-full sm:w-auto flex flex-col items-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              isResolved
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : isInProgress
                                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {t.status}
                          </span>

                          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                            <span className={isPending ? 'text-amber-400 font-bold' : ''}>Reported</span>
                            <span>→</span>
                            <span className={isInProgress ? 'text-sky-400 font-bold' : ''}>Dispatched</span>
                            <span>→</span>
                            <span className={isResolved ? 'text-emerald-400 font-bold' : ''}>Resolved</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: SEGREGATION GUIDE */}
          {activeTab === 'guide' && (
            <motion.div
              key="guide-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              <div className="text-center max-w-2xl mx-auto mb-2">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  3-Stream Source Segregation Mandate
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Udupi City Municipal Council bylaws mandate segregation at household source. Hand over waste directly to Auto Tippers according to the color-coded guide.
                </p>
              </div>

              {/* 3 Streams Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Wet Waste */}
                <div className="bg-[#0D1528]/90 rounded-2xl border border-emerald-500/30 p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl">
                        🍏
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Wet Organic Waste</h3>
                        <p className="text-[11px] font-bold text-emerald-400 uppercase">Green Bin · Daily</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Directly diverted to <strong className="text-slate-200">Beedinagudde BMU</strong> for biomethanation and organic compost.
                    </p>
                    <div className="space-y-1 text-xs text-emerald-300/90 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20">
                      <p>✓ Vegetable &amp; fruit peels</p>
                      <p>✓ Cooked meals, rice &amp; fish bones</p>
                      <p>✓ Garden leaves &amp; floral offerings</p>
                      <p>✓ Tea leaves &amp; coffee grounds</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>Timing: 6:30 AM - 9:30 AM</span>
                    <span className="text-emerald-400 font-bold">Daily Door-to-Door</span>
                  </div>
                </div>

                {/* 2. Dry Waste */}
                <div className="bg-[#0D1528]/90 rounded-2xl border border-sky-500/30 p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xl">
                        📦
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Dry Recyclable Waste</h3>
                        <p className="text-[11px] font-bold text-sky-400 uppercase">Blue Bin · Bi-Weekly</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Transported to <strong className="text-slate-200">6 Udupi DWCC Hubs</strong> &amp; Karvalu Central MRF for baling and recycling.
                    </p>
                    <div className="space-y-1 text-xs text-sky-300/90 bg-sky-950/30 p-3 rounded-xl border border-sky-500/20">
                      <p>✓ Clean milk packets &amp; plastic bags</p>
                      <p>✓ Cardboard, paper &amp; magazines</p>
                      <p>✓ Aluminum cans &amp; metal lids</p>
                      <p>✓ Glass bottles (unbroken)</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>Timing: Tue &amp; Fri</span>
                    <span className="text-sky-400 font-bold">Bi-Weekly</span>
                  </div>
                </div>

                {/* 3. Hazardous Waste */}
                <div className="bg-[#0D1528]/90 rounded-2xl border border-rose-500/30 p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xl">
                        🔋
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">Domestic Hazardous</h3>
                        <p className="text-[11px] font-bold text-rose-400 uppercase">Red Wrap · Marked</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Processed via <strong className="text-slate-200">KSPCB Authorised Handlers</strong> to avoid soil contamination.
                    </p>
                    <div className="space-y-1 text-xs text-rose-300/90 bg-rose-950/30 p-3 rounded-xl border border-rose-500/20">
                      <p>✓ Batteries &amp; e-waste cables</p>
                      <p>✓ CFL bulbs &amp; tube lights</p>
                      <p>✓ Insecticides &amp; paint containers</p>
                      <p>✓ Sanitary waste (wrapped in paper with red mark)</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>Hand over separately</span>
                    <span className="text-rose-400 font-bold">Do NOT Mix</span>
                  </div>
                </div>
              </div>

              {/* Citizen Honor Roll Leaderboard */}
              <div className="bg-[#0D1528]/90 rounded-2xl border border-slate-800 p-6 shadow-xl mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-black text-white">
                        Swachagraha Citizen Leaderboard
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Recognizing top civic contributors reporting blackspots &amp; practicing 100% segregation
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    October 2026 Cycle
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">Citizen</th>
                        <th className="py-2.5 px-3">Ward</th>
                        <th className="py-2.5 px-3">Resolved Reports</th>
                        <th className="py-2.5 px-3 text-right">Civic Eco-Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
                      {[
                        { rank: '#1', name: 'Dr. Ramesh K. Bhat', ward: 'Kadiyali Ward 22', reports: 18, points: '1,450 pts' },
                        { rank: '#2', name: 'Ankita P. Rao', ward: 'Manipal Ward 18', reports: 14, points: '1,280 pts' },
                        { rank: '#3', name: 'Rohan Shetty', ward: 'Malpe Port Ward 04', reports: 12, points: '1,120 pts' },
                        { rank: '#4', name: 'Priya V. Nayak', ward: 'Bannanje Ward 14', reports: 9, points: '860 pts' },
                        { rank: '#5', name: 'Ganesh Acharya', ward: 'Car Street Ward 25', reports: 7, points: '720 pts' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3 font-black text-white">{row.rank}</td>
                          <td className="py-3 px-3 font-bold text-white">{row.name}</td>
                          <td className="py-3 px-3 text-slate-400">{row.ward}</td>
                          <td className="py-3 px-3">{row.reports} verified</td>
                          <td className="py-3 px-3 text-right font-black text-emerald-400">
                            {row.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: CONTACT & EMERGENCY HELPLINES */}
          {activeTab === 'contact' && (
            <motion.div
              key="contact-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="text-center max-w-xl mx-auto mb-4">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Udupi Municipal Council Helpdesks
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Immediate contact channels for solid waste escalation, dead animal removal, and municipal sanitation inspections.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. SWM Toll Free Helpline */}
                <div className="bg-[#0D1528]/90 rounded-2xl border border-rose-500/30 p-5 shadow-xl">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-3">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-white">24x7 SWM Emergency Helpline</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-3">
                    Toll-free emergency hotline for severe chemical dumping, dead animal disposal, or blocked drainage.
                  </p>
                  <a
                    href="tel:1903"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call 1903 (Toll Free)</span>
                  </a>
                </div>

                {/* 2. CMC Central Office */}
                <div className="bg-[#0D1528]/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-white">CMC Central Office (Admin)</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-3">
                    K.M. Marg, Court Road Junction, Udupi, Karnataka 576101. Office hours: 10:00 AM - 5:30 PM.
                  </p>
                  <a
                    href="tel:08202520306"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>0820-2520306</span>
                  </a>
                </div>

                {/* 3. Sanitation Inspector Helpdesk */}
                <div className="bg-[#0D1528]/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-white">Health &amp; Sanitation Desk</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-3">
                    Direct line for Ward Sanitation Supervisors, Auto Tipper route coordination, and commercial waste permits.
                  </p>
                  <a
                    href="tel:08202520135"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>0820-2520135</span>
                  </a>
                </div>

                {/* 4. Email & Grievance Portal */}
                <div className="bg-[#0D1528]/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-3">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-white">Email Redressal Cell</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-3">
                    Official email address for formal complaints, RTI queries, and Swachh Survekshan feedback.
                  </p>
                  <a
                    href="mailto:cmcudupi@gmail.com"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>cmcudupi@gmail.com</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
