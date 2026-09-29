"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UDUPI_DATA } from '@/lib/constants';

export default function AIQueryBar() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setIsOpen(true);
    setIsLoading(true);
    setResponse(""); // Clear previous response

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      // Mock Responses for fallback (no API key)
      setTimeout(() => {
        const mocks: Record<string, string> = {
          "Show me illegal dumps": `Udupi City has ${UDUPI_DATA.dump_sites_detected} dump sites detected via satellite imagery, with ${UDUPI_DATA.high_risk_dumps} categorized as high risk. Eliminating these prevents toxic runoff and creates localized cleanup jobs.`,
          "methane risk": `By processing wet waste at the ${UDUPI_DATA.bio_meth_units} biomethanation plants (like Karvalu), Udupi avoids ${UDUPI_DATA.co2e_year} tons of CO₂e annually. This eliminates severe methane risk and generates ₹${UDUPI_DATA.savings_carbon_cr} Cr in carbon credits.`,
          "cost savings": `Processing ${UDUPI_DATA.waste_daily_tons} TPD locally via ${UDUPI_DATA.dwcc_count} DWCCs saves ₹1500/ton in landfill costs. This decentralized methodology generates significant annual savings for the CMC while creating circular economy jobs.`,
          "methodology": "AstraCity uses geospatial mapping and building footprint data to estimate waste generation per zone. We prioritize decentralized processing (DWCCs & Biomethanation) to eliminate landfill reliance.",
          "default": `Based on AstraCity intelligence: Udupi City generates ${UDUPI_DATA.waste_daily_tons} TPD from ${UDUPI_DATA.population} residents. Processing this waste via ${UDUPI_DATA.dwcc_count} DWCCs averts ${UDUPI_DATA.co2e_year} tons of CO₂e/year and generates ₹${UDUPI_DATA.savings_carbon_cr} Cr in carbon credits.`
        };
        const key = Object.keys(mocks).find(k => query.toLowerCase().includes(k.toLowerCase().split(' ').slice(0, 2).join(' ')));
        const resText = key ? mocks[key] : mocks["default"];
        setResponse(resText);
        setIsLoading(false);
        setQuery("");
      }, 1200);
      return;
    }

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `You are AstraCity's AI assistant for Udupi City SWM (Solid Waste Management).

REAL DATA CONTEXT (RAG Knowledge Base):
- City: ${UDUPI_DATA.city}, Population: ${UDUPI_DATA.population}, Area: ${UDUPI_DATA.area_sq_km} sq km
- Daily waste: ${UDUPI_DATA.daily_waste_tons} TPD (${UDUPI_DATA.waste_wet_pct}% wet, ${UDUPI_DATA.waste_dry_pct}% dry)
- Infrastructure: ${UDUPI_DATA.dwcc_count} DWCCs, ${UDUPI_DATA.bio_meth_units} Biomethanation plants (Karvalu SWM Campus)
- Methane Avoidance: ${UDUPI_DATA.methane_m3_per_day} m³/day, Carbon Credits: ~₹${UDUPI_DATA.carbon_credits_cr} Cr/year
- Economics: Decentralized processing saves ₹1500/ton vs landfilling.
- LULC: ${UDUPI_DATA.lulc_builtup}% built-up, ${UDUPI_DATA.lulc_vegetation}% vegetation.
- Dumpsites detected: ${UDUPI_DATA.dump_sites_detected} (High risk: ${UDUPI_DATA.high_risk_dumps})

METHODOLOGY KNOWLEDGE:
- AstraCity uses geospatial clustering to map waste generation directly to building footprints.
- We do not use centralized landfills; we process wet waste via biomethanation and dry waste via DWCCs.
- This creates circular economy jobs and mitigates methane emissions.

Answer in 2-3 sentences max. Use real numbers from the context above. Be professional, analytical, and highly specific to Udupi. Do not mention truck routing.` }]
          },
          contents: [{ parts: [{ text: query }] }]
        })
      });
      const data = await res.json();
      if (data.error) {
         setResponse("Error from AI: " + data.error.message);
      } else {
         const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
         setResponse(text);
      }
    } catch (err: any) {
      setResponse("Failed to connect to the AI service. Please confirm your network settings and API key.");
    } finally {
      setIsLoading(false);
      setQuery(""); // Clear the input after successfully triggering response
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] flex flex-col pointer-events-none">
      {/* Response Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-[0_-20px_40px_rgba(0,0,0,0.3)] rounded-2xl p-6 mb-4 max-w-4xl mx-auto w-[90%] lg:w-full border-l-4 border-l-teal-500 relative"
          >
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 p-1.5 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="flex items-start gap-4 pr-6">
               <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl shrink-0 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
               </div>
               <div className="flex-1 text-slate-200 text-[15px] leading-relaxed overflow-y-auto max-h-[40vh] mt-1 font-medium">
                  {isLoading ? (
                     <div className="flex gap-2 items-center h-6">
                       <span className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                       <span className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                       <span className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce"></span>
                     </div>
                  ) : (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} dangerouslySetInnerHTML={{ __html: response?.replace(/\n/g, '<br />') || "" }} />
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="pointer-events-auto w-full bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 flex items-center h-[64px] px-4 sm:px-6 relative shadow-[0_-10px_40px_rgba(0,0,0,0.2)] pb-safe">
        <div className="max-w-4xl w-full mx-auto flex items-center gap-4">
          <div className="bg-teal-500 text-slate-900 text-[11px] font-black tracking-widest px-3 py-1.5 rounded-full shadow-sm shrink-0 uppercase">
            AI
          </div>
          <form className="flex-1 flex items-center h-full relative" onSubmit={handleSubmit}>
             <input 
               ref={inputRef}
               type="text"
               value={query}
               onChange={e => setQuery(e.target.value)}
               placeholder="Ask anything... 'Show wards with highest methane risk'"
               className="w-full bg-transparent text-slate-100 text-[15px] font-medium placeholder-slate-500 focus:outline-none px-2 h-full"
               autoComplete="off"
             />
             <button 
               type="submit" 
               disabled={!query.trim() || isLoading} 
               className="p-2 ml-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center justify-center border border-teal-500/20"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}
