"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquarePlus, 
  MessageSquare, 
  Trash2, 
  Send, 
  Sparkles, 
  Recycle, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Bot,
  User,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string[];
  citations?: { title: string; link: string }[];
  timestamp: string;
}

const PRESET_QUERIES = [
  "Analyze Indrali landfill methane emissions & bio-mining status",
  "Show Ward 12 vs Ward 4 daily wet waste collection performance",
  "Are there flagged tipping fee defaults for bulk commercial generators?",
  "What are mandatory decentralized processing rules under SWM 2026?"
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m-1",
    role: "assistant",
    content: "Welcome, Officer. I am your AstraCity SWM Intelligence Copilot for Udupi City Municipal Council. I track 35 municipal wards, 140 TPD waste generation, weighbridge tickets, methane telemetry, and SWM 2026 compliance. How may I assist your municipal operations today?",
    timestamp: "10:00 AM"
  },
  {
    id: "m-2",
    role: "user",
    content: "Summarize status and high-risk nodes for Case SWM-442 (Indrali Dumpsite Remediation & Methane Mitigation).",
    timestamp: "10:02 AM"
  },
  {
    id: "m-3",
    role: "assistant",
    content: "### Case SWM-442 Operations Dossier\n\n**Primary Category:** Landfill Capping, Leachate & Subsurface Methane Mitigation\n**Risk Score:** 92/100 (CRITICAL ENVIRONMENTAL PRIORITY)\n\n#### Key Findings:\n1. **Lead Concessionaire:** Indrali Bio-Mining Contractor LLP (PER-9842), flagged for delayed bio-cover sprinkler maintenance.\n2. **Telemetry Inflow:** IoT Probe 04 recorded 480 ppm methane concentration along North Slope Pit 3.\n3. **Tipping Disbursement:** Account `CANARA **** 3310` disbursed INR 320,000 for transport fleet, pending weighbridge verification.\n\n#### Recommended Actions:\n- Trigger emergency bio-cover water misting to suppress subsurface flare.\n- Audit daily compactor weighbridge logs against GPS tracks (`KA-20-EA-4102`).",
    reasoning: [
      "Queried Udupi CMC sensor database for Indrali remediation pit telemetry.",
      "Cross-referenced optical drone orthomosaic with thermal hotspot clusters.",
      "Verified municipal tipping fee escrow disbursements against weighbridge manifests."
    ],
    citations: [
      { title: "SWM/UDUPI/2026/0891 (Methane Spike)", link: "/cases" },
      { title: "Facility: Indrali Landfill Hub", link: "/profiles" },
      { title: "Tipping Transaction TX-9004", link: "/financial" }
    ],
    timestamp: "10:02 AM"
  }
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({ "m-3": true });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const toggleReasoning = (msgId: string) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-4).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: "assistant",
        content: data.content || "Operational telemetry retrieved.",
        reasoning: data.reasoning || [],
        citations: data.citations || [],
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      if (data.reasoning && data.reasoning.length > 0) {
        setExpandedReasoning((prev) => ({ ...prev, [botMsg.id]: true }));
      }
    } catch (err: any) {
      console.error("Failed to query chat API:", err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "### System Connection Alert\nUnable to reach SWM Intelligence server. Please verify your connection or check `/api-status`.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_MESSAGES[0]]);
  };

  return (
    <div className="flex h-full max-w-6xl mx-auto w-full p-4 lg:p-6 gap-6 overflow-hidden">
      {/* Sidebar: Presets and Sessions */}
      <div className="hidden md:flex w-72 flex-col justify-between border border-slate-200 bg-white rounded-2xl p-4 shadow-xs">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Recycle className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">AstraCity AI</span>
            </div>
            <Button onClick={handleClearHistory} variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-rose-600" title="Clear Chat">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
              Suggested SWM Inquiries
            </span>
            <div className="space-y-1.5">
              {PRESET_QUERIES.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(query)}
                  className="w-full text-left p-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-emerald-700 border border-transparent hover:border-slate-200 transition-all leading-snug"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            SWM 2026 Compliant
          </div>
          <p className="leading-relaxed">
            All AI responses backed by Udupi CMC geospatial digital-twin telemetry.
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col border border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 max-w-3xl ${msg.role === "user" ? "ml-auto justify-end" : "mr-auto"}`}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className="space-y-2 max-w-2xl">
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-none shadow-xs font-medium"
                      : "bg-slate-50 text-slate-800 rounded-bl-none border border-slate-200/90 shadow-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {/* Step-by-Step Reasoning Block */}
                {msg.reasoning && msg.reasoning.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden text-xs">
                    <button
                      onClick={() => toggleReasoning(msg.id)}
                      className="w-full flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-100/60 font-semibold text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        <span>AI Inference & Verification Steps ({msg.reasoning.length})</span>
                      </div>
                      {expandedReasoning[msg.id] ? (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>
                    {expandedReasoning[msg.id] && (
                      <div className="p-3 space-y-1.5 border-t border-slate-100 bg-white">
                        {msg.reasoning.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-slate-600 font-mono text-[11px]">
                            <span className="text-emerald-700 font-bold shrink-0">{idx + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Citations Pills */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.citations.map((cite, idx) => (
                      <Link key={idx} href={cite.link}>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold text-emerald-800 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 transition-colors cursor-pointer gap-1 py-0.5"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          {cite.title}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 px-1">{msg.timestamp}</div>
              </div>

              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-lg items-center text-xs text-slate-400">
              <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 animate-spin" />
              </div>
              <span className="animate-pulse">AstraCity Copilot querying Udupi SWM records...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI Copilot: 'Show Indrali landfill methane emissions', 'Route 4 delay', or 'Ward 12 tonnage'..."
              className="flex-1 text-xs bg-slate-50 border-slate-200 h-10 focus-visible:ring-emerald-500 focus-visible:bg-white"
            />
            <Button type="submit" size="icon" className="h-10 w-10 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-xs">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
