"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function QuickMLBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/chat?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-3xl mx-auto mb-6 shadow-sm rounded-full group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Sparkles className="h-5 w-5 text-emerald-600 transition-colors" />
      </div>
      <Input
        type="text"
        className="block w-full pl-12 pr-24 py-5 text-sm font-medium rounded-full border-slate-200 bg-white shadow-xs focus-visible:ring-emerald-500 focus-visible:border-emerald-500 placeholder:text-slate-400"
        placeholder="Ask AstraCity Copilot: 'Show Indrali landfill methane level', 'Analyze Route 4 delay', or 'Ward 12 tonnage'..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="absolute inset-y-0 right-1.5 flex items-center">
        <Button 
          type="submit" 
          size="icon" 
          className="rounded-full w-8 h-8 bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
