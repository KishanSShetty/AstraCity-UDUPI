"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, AlertCircle, CheckCircle2, MoreHorizontal, Info } from 'lucide-react';
import { useComplaintStore, ComplaintStatus } from '@/lib/store';

export default function ComplaintsDashboard() {
  const { complaints, updateStatus } = useComplaintStore();

  const handleStatusChange = (id: string, newStatus: ComplaintStatus) => {
    updateStatus(id, newStatus);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-73px)] p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Municipal Complaints Inbox</h1>
          <p className="text-slate-500 font-medium">Review and resolve issues reported by citizens in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-bold border shadow-sm">
            Total Active: {complaints.filter(c => c.status !== 'Resolved').length}
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-200 shadow-sm">
            Resolved: {complaints.filter(c => c.status === 'Resolved').length}
          </div>
        </div>
      </div>

      {/* Kanban / List Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Pending */}
        <div className="flex flex-col gap-4 bg-slate-100 rounded-3xl p-4 border border-slate-200 shadow-inner">
          <div className="flex items-center gap-2 px-2 text-slate-700 font-bold uppercase tracking-wider text-sm">
            <AlertCircle className="w-4 h-4 text-rose-500" /> Pending ({complaints.filter(c => c.status === 'Pending').length})
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {complaints.filter(c => c.status === 'Pending').map(complaint => (
                <ComplaintCard key={complaint.id} complaint={complaint} onUpdate={handleStatusChange} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* In Progress */}
        <div className="flex flex-col gap-4 bg-slate-100 rounded-3xl p-4 border border-slate-200 shadow-inner">
          <div className="flex items-center gap-2 px-2 text-slate-700 font-bold uppercase tracking-wider text-sm">
            <MoreHorizontal className="w-4 h-4 text-amber-500" /> In Progress ({complaints.filter(c => c.status === 'In Progress').length})
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {complaints.filter(c => c.status === 'In Progress').map(complaint => (
                <ComplaintCard key={complaint.id} complaint={complaint} onUpdate={handleStatusChange} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Resolved */}
        <div className="flex flex-col gap-4 bg-slate-100 rounded-3xl p-4 border border-slate-200 shadow-inner">
          <div className="flex items-center gap-2 px-2 text-slate-700 font-bold uppercase tracking-wider text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resolved ({complaints.filter(c => c.status === 'Resolved').length})
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {complaints.filter(c => c.status === 'Resolved').map(complaint => (
                <ComplaintCard key={complaint.id} complaint={complaint} onUpdate={handleStatusChange} />
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

function ComplaintCard({ complaint, onUpdate }: { complaint: any, onUpdate: (id: string, s: ComplaintStatus) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3 group hover:shadow-md transition-shadow"
    >
      {complaint.photoUrl && (
        <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img src={complaint.photoUrl} alt="Complaint" className="w-full h-full object-cover" />
        </div>
      )}
      
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">#{complaint.id}</span>
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1" suppressHydrationWarning><Clock className="w-3 h-3" /> {new Date(complaint.date).toLocaleDateString()}</span>
        </div>
        <h3 className="font-bold text-slate-800 leading-tight">{complaint.type}</h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{complaint.description}</p>
      </div>

      <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100 mt-1">
        <MapPin className="w-3 h-3 text-slate-400" /> <span className="truncate">{complaint.location}</span>
      </div>

      <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100">
        {complaint.status === 'Pending' && (
          <button onClick={() => onUpdate(complaint.id, 'In Progress')} className="flex-1 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors">Start Progress</button>
        )}
        {complaint.status === 'In Progress' && (
          <button onClick={() => onUpdate(complaint.id, 'Resolved')} className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors">Mark Resolved</button>
        )}
        {complaint.status === 'Resolved' && (
          <div className="flex-1 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-xs font-bold text-center cursor-not-allowed flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Issue Closed
          </div>
        )}
      </div>
    </motion.div>
  );
}
