"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
          "Show me illegal dumps": "Udupi City has 0 dumpyards inside the ward. All 3 Udupi CMC dumpyards are in North Udupi (21-27 km away). The nearest is Yelahanka at 21.03 km, handling only 4% final rejects. This clean separation saves ~₹45 lakh annually in land value depreciation.",
          "Which DWCCs are at risk": "DWCC-1 (Sector 2 East) and DWCC-4 are running at 92% and 88% capacity respectively, approaching the 90% red alert threshold. Redistributing 500 kg/day to DWCC-5 (45% load) would save ₹12,000/day in emergency overflow transport costs.",
          "How many vehicles do we need": "Udupi City deploys 10 vehicles: 5 Auto Tippers (CNG, 500 kg each) covering 67.6% of residential roads, 2 Garbage Trucks and 1 Small Compactor on secondary roads, plus 1 Large Compactor and 1 Hook Loader for trunk/primary roads. Route optimisation reduced fleet distance from 132.44 km to 8.47 km — a 94% improvement.",
          "What is the carbon credit value": "Kudlu BMU processes 33.55 TPD wet waste, avoiding 25,959 tonnes CO₂e annually through methane capture. At CCTS 2023 pricing (₹1,200-2,200/tonne), this generates ~₹4.42 Cr/year in carbon credits, plus ₹1.21 Cr/year in operational savings from route optimisation.",
          "default": "Based on AstraCity routing intelligence: Udupi City (Udupi CMC) generates 55 TPD waste from 110K residents. Our Clarke-Wright VRP solver achieved 94% route reduction (132→8.47 km), saving ₹1.21 Cr/year in operations and generating ₹4.42 Cr/year in carbon credits from Kudlu BMU."
        };
        const key = Object.keys(mocks).find(k => query.toLowerCase().includes(k.toLowerCase().split(' ').slice(0, 3).join(' ')));
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
            parts: [{ text: `You are AstraCity's routing intelligence assistant for Udupi City (Udupi CMC), Udupi.

REAL DATA CONTEXT:
- Ward: Udupi City (Udupi CMC), Area: 68.23 sq km, Population: 110,000
- Daily waste: 55 TPD (61% wet→Kudlu BMU, 30% dry→6 DWCCs, 5% hazardous→handler, 4% rejects→Yelahanka)
- 6 DWCCs inside ward (3 TPD each = 18 TPD capacity), nearest BMU: Kudlu 2.1 km south
- Fleet: 10 vehicles (5 Auto Tippers 500kg CNG, 1 Small Compactor 5T, 1 Large Compactor 10T, 1 Hook Loader 16T, 2 Garbage Trucks 5T)
- Road network: 2,027 segments (41.4% residential 2-4m, 25.1% footway <2m, 9.4% tertiary, 5.6% secondary, 1.9% trunk ORR)
- Auto Tippers can access 67.6% roads, compactors only 7.9%, hook loaders only 1.9%
- VRP solver (Clarke-Wright Savings): 8.47 km total vs 132.44 km baseline = 94% reduction
- Carbon credits: ~₹4.42 Cr/year from Kudlu BMU methane avoidance (25,959 T CO₂e/year)
- Operational savings: ₹1.21 Cr/year (₹2800→₹2200/tonne)
- Udupi CMC collection windows: Primary 06:00-10:00, Secondary 10:00-18:00, Night ban >3.5T 22:00-06:00

Answer in 2-3 sentences max. Use real numbers. Always mention relevant cost savings or risk factors.` }]
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
