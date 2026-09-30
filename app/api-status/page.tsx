"use client";
import React, { useState, useEffect } from 'react';

const endpoints = [
  { name: 'Health Check', url: 'http://localhost:8000/', method: 'GET' },
  { name: 'Ward Stats', url: 'http://localhost:8000/ward-stats', method: 'GET' },
  { name: 'Optimize Routes', url: 'http://localhost:8000/optimize-routes', method: 'GET' },
  { name: 'Building Analysis', url: 'http://localhost:8000/building-analysis', method: 'GET' },
  { name: 'Predict Waste', url: 'http://localhost:8000/predict-waste', method: 'POST', body: {} },
  { name: 'Simulate Dumpyard', url: 'http://localhost:8000/simulate-dumpyard', method: 'POST', body: {} },
  { name: 'Run Digital Twin', url: 'http://localhost:8000/run-digital-twin', method: 'POST', body: {} },
  { name: 'Process Satellite', url: 'http://localhost:8000/process-satellite', method: 'POST', isFormData: true }
]

export default function ApiStatusPage() {
  const [statuses, setStatuses] = useState<{ [key: string]: { status: 'online' | 'offline' | 'slow' | 'checking', ms: number } }>({});
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    const checkEndpoints = async () => {
      const newStatuses: any = {};

      await Promise.all(endpoints.map(async (ep) => {
        const start = performance.now();
        try {
          const reqOpts: any = { method: ep.method };
          if (ep.method === 'POST') {
            if (ep.isFormData) {
              const fd = new FormData();
              fd.append('file', new Blob(['test'], { type: 'text/plain' }), 'test.txt');
              reqOpts.body = fd;
            } else {
              reqOpts.headers = { 'Content-Type': 'application/json' };
              reqOpts.body = JSON.stringify(ep.body);
            }
          }

          const res = await fetch(ep.url, reqOpts);
          const time = Math.round(performance.now() - start);

          if (res.ok) {
            newStatuses[ep.name] = { status: time > 500 ? 'slow' : 'online', ms: time };
          } else {
            newStatuses[ep.name] = { status: 'offline', ms: time };
          }
        } catch {
          newStatuses[ep.name] = { status: 'offline', ms: Math.round(performance.now() - start) };
        }
      }));

      setStatuses(newStatuses);
      setLastChecked(new Date());
    };

    checkEndpoints();
    const interval = setInterval(checkEndpoints, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-100 pb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
              Backend API Status
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">AstraCity SWM Digital Twin Telemetry Feeds</p>
          </div>
          <a href="/api/fleet-status" target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors shrink-0">
            View Live JSON →
          </a>
        </div>

        <div className="text-xs text-slate-500 mb-6 font-mono flex items-center gap-2 bg-slate-50 px-3.5 py-2 inline-flex rounded-xl border border-slate-200">
          <svg className="w-3.5 h-3.5 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <span>Auto-refreshing... Last connection: <span className="text-slate-900 font-bold">{lastChecked.toLocaleTimeString()}</span></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {endpoints.map((ep) => {
            const data = statuses[ep.name] || { status: 'checking', ms: 0 };

            let color = 'bg-slate-50 text-slate-600 border-slate-200';
            let icon = '⏳';
            if (data.status === 'online') { color = 'bg-emerald-50 text-emerald-900 border-emerald-200'; icon = '✅'; }
            if (data.status === 'slow') { color = 'bg-amber-50 text-amber-900 border-amber-200'; icon = '🟡'; }
            if (data.status === 'offline') { color = 'bg-rose-50 text-rose-900 border-rose-200'; icon = '❌'; }

            return (
              <div key={ep.name} className={`p-4 rounded-2xl border ${color} flex items-center justify-between transition-colors shadow-2xs`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-lg shadow-2xs">
                    {icon}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{ep.name}</div>
                    <div className="text-[10px] uppercase tracking-wider flex gap-2 mt-0.5">
                      <span className={`px-1.5 py-0.2 rounded font-bold ${ep.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>{ep.method}</span>
                      <span className="font-mono text-slate-500">{ep.url.replace('http://localhost:8000', '')}</span>
                    </div>
                  </div>
                </div>
                <div className="font-mono font-bold text-xs tracking-tight bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                  {data.status !== 'checking' ? `${data.ms}ms` : '--'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

