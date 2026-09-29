'use client';
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function EnginePage() {
  useEffect(() => {
    // Analytics page loaded
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden relative">
      {/* Background Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto p-6 md:p-12 relative z-10 space-y-16"
      >
        <header className="mb-12 border-b border-slate-200 shadow-md pb-8">
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-indigo-400 to-pink-400 tracking-tighter mb-4">
            Digital Twin Core Engine
          </h1>
          <p className="text-slate-600 text-lg md:text-xl font-light max-w-3xl">
            Live translation of the backend analytics pipeline. Breaking down the mathematical models driving the Udupi smart waste grid.
          </p>
        </header>

        {/* SECTION 1: WASTE ESTIMATION MODEL */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-500/30 flex items-center justify-center text-teal-600 text-2xl font-black">1</div>
            <h2 className="text-3xl font-extrabold text-slate-900">Waste Estimation Model</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-slate-50/80 backdrop-blur-xl border border-slate-200 shadow-md p-8 rounded-3xl shadow-lg">
              <h3 className="text-teal-600 font-mono text-sm tracking-widest uppercase mb-6">Algorithm Formula</h3>
              <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 shadow-sm font-mono text-lg md:text-xl overflow-x-auto text-slate-700">
                <span className="text-teal-600">Waste</span> = (0.45 * <span className="text-indigo-600">P</span>) + (2.0 * <span className="text-pink-600">C</span>) * <span className="text-orange-400">M</span>
              </div>
              
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-indigo-600 font-bold mb-1">P = Population</div>
                  <div className="text-slate-600 text-sm font-light">Derived from density × 4.2 ppl/house</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-pink-600 font-bold mb-1">C = Commercial Score</div>
                  <div className="text-slate-600 text-sm font-light">Road density * 0.4 + major_roads * 3.0</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-500/5 to-pink-500/5 backdrop-blur-xl border border-indigo-500/10 p-8 rounded-3xl shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-indigo-600 font-mono text-sm tracking-widest uppercase mb-4">Multipliers (M)</h3>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-slate-700">Rainfall &gt; 10mm</span>
                    <span className="text-rose-600 font-mono font-bold">+15% (1.15x)</span>
                  </li>
                  <li className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-slate-700">Rainfall &gt; 25mm</span>
                    <span className="text-rose-600 font-mono font-bold">+30% (1.30x)</span>
                  </li>
                  <li className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-slate-700">Festival</span>
                    <span className="text-orange-400 font-mono font-bold">+35% (1.35x)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>



      </motion.div>
    </div>
  );
}
