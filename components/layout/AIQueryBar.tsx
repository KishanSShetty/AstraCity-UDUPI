"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UDUPI_DATA } from '@/lib/constants';
import { useComplaintStore } from '@/lib/store';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function AIQueryBar() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setIsOpen(true);
    setIsLoading(true);

    const userMessage = query;
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setQuery("");

    // Prioritize Groq API key provided by user, then fallbacks
    const apiKeys = [
      process.env.NEXT_PUBLIC_GROQ_API_KEY,
      process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      process.env.NEXT_PUBLIC_GEMINI_API_KEY_2,
      process.env.NEXT_PUBLIC_GEMINI_API_KEY_3
    ].filter(Boolean);
    
    // Pick the first available key (Groq will be first if present)
    const apiKey = apiKeys.length > 0 ? apiKeys[0] : null;

    if (!apiKey) {
      setTimeout(() => {
        const mocks: Record<string, string> = {
          "hi": "Hello! I am the VajraYield AI assistant for Udupi. How can I help you analyze our Solid Waste Management data today?",
          "hello": "Hello! I am the VajraYield AI assistant for Udupi. How can I help you analyze our Solid Waste Management data today?",
          "manipal": "Manipal (Ward 18), the academic belt of Udupi, generates approximately 14.8 TPD of waste. This is primarily processed locally at DWCC-4 to minimize transport emissions.",
          "Show me illegal dumps": `Udupi City has ${UDUPI_DATA.dump_sites_detected} dump sites detected via satellite imagery, with ${UDUPI_DATA.high_risk_dumps} categorized as high risk. Eliminating these prevents toxic runoff and creates localized cleanup jobs.`,
          "methane risk": `By processing wet waste at the ${UDUPI_DATA.bio_meth_units} biomethanation plants (like Karvalu), Udupi avoids ${UDUPI_DATA.co2e_year} tons of CO₂e annually. This eliminates severe methane risk and generates ₹${UDUPI_DATA.savings_carbon_cr} Cr in carbon credits.`,
          "cost savings": `Processing ${UDUPI_DATA.waste_daily_tons} TPD locally via ${UDUPI_DATA.dwcc_count} DWCCs saves ₹1500/ton in landfill costs. This decentralized methodology generates significant annual savings for the CMC while creating circular economy jobs.`,
          "methodology": "VajraYield uses geospatial mapping and building footprint data to estimate waste generation per zone. We prioritize decentralized processing (DWCCs & Biomethanation) to eliminate landfill reliance.",
          "default": `Based on VajraYield intelligence: Udupi City generates ${UDUPI_DATA.waste_daily_tons} TPD from ${UDUPI_DATA.population} residents. Processing this waste via ${UDUPI_DATA.dwcc_count} DWCCs averts ${UDUPI_DATA.co2e_year} tons of CO₂e/year and generates ₹${UDUPI_DATA.savings_carbon_cr} Cr in carbon credits.`
        };
        const key = Object.keys(mocks).find(k => userMessage.toLowerCase().includes(k.toLowerCase().split(' ').slice(0, 2).join(' ')));
        const resText = key ? mocks[key] : mocks["default"];
        setMessages(prev => [...prev, { role: 'assistant', content: resText }]);
        setIsLoading(false);
      }, 1200);
      return;
    }

    try {
      const isGroq = apiKey?.startsWith('gsk_');
      const storeState = useComplaintStore.getState();
      const pendingComplaints = storeState.complaints.filter(c => c.status === 'Pending').length;
      const inProgressComplaints = storeState.complaints.filter(c => c.status === 'In Progress').length;
      
      // Calculate Fleet Requirements dynamically based on the Core Engine Methodology
      const dailyWaste = UDUPI_DATA.daily_waste_tons; // 72 TPD
      const autoTippersNeeded = Math.ceil(dailyWaste / 3) + Math.ceil((dailyWaste / 3) * 0.1); // ~3 TPD/tipper + 10% reserve
      const compactorsNeeded = Math.ceil(dailyWaste / 20) + Math.ceil((dailyWaste / 20) * 0.1); // ~20 TPD/compactor + 10% reserve
      
      const systemPrompt = `You are VajraYield's AI assistant for Udupi City SWM (Solid Waste Management). You are having an ongoing conversation.

REAL DATA CONTEXT (RAG Knowledge Base):
- City: ${UDUPI_DATA.city}, Population: ${UDUPI_DATA.population}, Area: ${UDUPI_DATA.area_sq_km} sq km
- Daily waste: ${dailyWaste} TPD (${UDUPI_DATA.waste_wet_pct}% wet, ${UDUPI_DATA.waste_dry_pct}% dry)
- Infrastructure: ${UDUPI_DATA.dwcc_count} DWCCs, ${UDUPI_DATA.bio_meth_units} Biomethanation plants
- Economics: Decentralized processing saves ₹1500/ton vs landfilling.
- Live Complaints: ${pendingComplaints} cases currently pending action, ${inProgressComplaints} cases in progress.

SIMULATION PREDICTIONS (Fleet Requirements):
- Based on 72 TPD, the digital twin core engine calculates Udupi requires:
- Auto Tippers (Primary Collection): ${autoTippersNeeded} vehicles (assuming 3T/day capacity + 10% operational buffer).
- Compactors (Secondary Transport): ${compactorsNeeded} vehicles (assuming 20T/day capacity + 10% operational buffer).

METHODOLOGY & INSTRUCTIONS:
1. GREETINGS: If the user says hello, hi, or greets you, introduce yourself as the VajraYield AI and ask how you can help with Udupi's SWM data.
2. THINKING & ANSWERING: Analyze the user's question, locate the relevant metric from the context above, and formulate a direct answer.
3. CONSTRAINTS: Answer in 2-3 sentences max. Use real numbers. Be highly specific to Udupi. Do NOT mention truck routing or centralized landfills. Remember the context of the conversation.`;

      let text = "No response generated.";
      let success = false;

      for (const key of apiKeys) {
        if (success) break;
        const isGroqKey = key.startsWith('gsk_');

        if (isGroqKey) {
          const groqMessages = [
            { role: "system", content: systemPrompt },
            ...newMessages.map(m => ({ role: m.role, content: m.content }))
          ];
          const res = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
              model: "llama3-8b-8192", // Safe legacy model
              messages: groqMessages
            })
          });
          const data = await res.json();
          if (!data.error && data.choices) {
             text = data.choices[0].message.content;
             success = true;
          } else if (data.error) {
             text = "Error from Groq AI: " + data.error.message;
             // Continue loop to try next key (Gemini)
          }
        } else {
          // Gemini
          const geminiContents = newMessages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: geminiContents
            })
          });
          const data = await res.json();
          if (!data.error && data.candidates) {
             text = data.candidates[0].content.parts[0].text;
             success = true;
          } else if (data.error) {
             text = "Error from Gemini AI: " + data.error.message;
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Failed to connect to the AI service. Please confirm your network settings and API key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] flex flex-col pointer-events-none">
      {/* Response Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, height: isExpanded ? '75vh' : 'auto' }}
            exit={{ opacity: 0, y: 20 }}
            className={`pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-[0_-20px_40px_rgba(0,0,0,0.3)] rounded-2xl p-6 mb-4 mx-auto w-[90%] lg:w-full border-l-4 border-l-teal-500 relative flex flex-col transition-all duration-300 ${isExpanded ? 'max-w-5xl' : 'max-w-4xl'}`}
          >
            {/* Header Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                title={isExpanded ? "Collapse" : "Expand History"}
                className="text-slate-400 hover:text-teal-400 transition-colors bg-slate-800/50 hover:bg-slate-700 p-1.5 rounded-full flex items-center justify-center"
              >
                {isExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m4 14 6-6 6 6"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m4 10 6 6 6-6"/></svg>
                )}
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                title="Close"
                className="text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 p-1.5 rounded-full flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Chat History Container */}
            <div className={`flex-1 overflow-y-auto pr-4 mt-4 space-y-6 ${isExpanded ? 'max-h-[calc(75vh-80px)]' : 'max-h-[40vh]'}`}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                   
                   {/* Avatar */}
                   {msg.role === 'assistant' ? (
                     <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl shrink-0 shadow-inner mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                     </div>
                   ) : (
                     <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-full shrink-0 shadow-inner mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                     </div>
                   )}

                   {/* Message Content */}
                   <div className={`flex-1 text-[15px] leading-relaxed font-medium ${msg.role === 'user' ? 'text-indigo-100 text-right' : 'text-slate-200'}`}>
                     <motion.div 
                       initial={{ opacity: 0, y: 5 }} 
                       animate={{ opacity: 1, y: 0 }} 
                       transition={{ duration: 0.3 }} 
                       dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} 
                     />
                   </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl shrink-0 shadow-inner mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                  </div>
                  <div className="flex gap-2 items-center h-10 mt-1">
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
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
