"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Map as MapIcon, Link as LinkIcon, Download, Info, CheckCircle, Search, ExternalLink, Globe, FileJson, Server } from 'lucide-react';

const DATA_SOURCES = [
  {
    id: 1,
    category: 'Spatial Data',
    title: 'Udupi Ward Boundaries',
    description: 'GeoJSON polygons defining the 35 municipal wards of Udupi City. Used for spatial queries, choropleth maps, and jurisdiction filtering.',
    source: 'Udupi CMC / OpenStreetMap',
    format: 'GeoJSON',
    size: '1.2 MB',
    status: 'Active',
    tags: ['Boundaries', 'Admin', 'Vector'],
    downloadLink: '/udupi_wards.geojson'
  },
  {
    id: 2,
    category: 'Routing Data',
    title: 'OSM Road Network (Udupi)',
    description: 'High-resolution road network graph used by the OSRM/Valhalla routing engine for garbage collection vehicle paths.',
    source: 'OpenStreetMap Contributors',
    format: 'OSM PBF',
    size: '4.5 MB',
    status: 'Active',
    tags: ['Network', 'Roads', 'VRP'],
    downloadLink: '#'
  },
  {
    id: 3,
    category: 'Remote Sensing',
    title: 'Sentinel-2 LULC Maps',
    description: 'Land Use and Land Cover (LULC) classification derived from ESA Sentinel-2 multispectral imagery at 10m resolution.',
    source: 'European Space Agency (ESA)',
    format: 'GeoTIFF / PNG',
    size: '12 MB',
    status: 'Active',
    tags: ['Raster', 'LULC', 'Satellite'],
    downloadLink: '#'
  },
  {
    id: 4,
    category: 'SWM Infrastructure',
    title: 'Bin Locations & DWCCs',
    description: 'Point coordinates (Lat/Lon) of municipal dumpsters, Dry Waste Collection Centers, and landfill sites.',
    source: 'Field Survey / Namma Udupi Portal',
    format: 'JSON / CSV',
    size: '250 KB',
    status: 'Live Sync',
    tags: ['Points', 'Infrastructure', 'Waste'],
    downloadLink: '/bins_data.json'
  },
  {
    id: 5,
    category: 'Demographics',
    title: 'Population Density Grid',
    description: '500m x 500m hexagonal grid containing estimated population, commercial density, and waste generation multipliers.',
    source: 'Census 2011 / WorldPop projection',
    format: 'GeoJSON',
    size: '3.1 MB',
    status: 'Active',
    tags: ['Grid', 'Heatmap', 'Demographics'],
    downloadLink: '/udupi_grid_500m.geojson'
  },
  {
    id: 6,
    category: 'Live API',
    title: 'GCP Directions Matrix',
    description: 'Real-time traffic conditions and travel time matrices used for dynamic rerouting of collection vehicles.',
    source: 'Google Cloud Platform Maps API',
    format: 'REST JSON',
    size: 'Variable',
    status: 'Live Sync',
    tags: ['API', 'Traffic', 'Dynamic'],
    downloadLink: 'https://developers.google.com/maps/documentation/distance-matrix/overview'
  }
];

export default function OpenDataPortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(DATA_SOURCES.map(d => d.category)))];

  const filteredData = DATA_SOURCES.filter(d => 
    (activeCategory === 'All' || d.category === activeCategory) &&
    (d.title.toLowerCase().includes(searchTerm.toLowerCase()) || d.description.toLowerCase().includes(searchTerm.toLowerCase()) || d.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans pb-24">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center p-4 bg-blue-500/10 text-blue-400 rounded-3xl mb-6 shadow-[0_0_40px_rgba(59,130,246,0.15)] border border-blue-500/20">
            <Server className="w-10 h-10" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-200 mb-6 tracking-tight">
            Open Data Hub
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            Transparency is at the core of the SWM Digital Twin. Explore, audit, and download the geospatial datasets and APIs powering the Udupi routing algorithms.
          </motion.p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  activeCategory === category 
                    ? 'bg-blue-500 text-slate-950 shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-105'
                    : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search datasets, tags..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-md"
            />
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.length > 0 ? (
            filteredData.map((data, idx) => (
              <motion.div 
                key={data.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col h-full hover:bg-slate-800/60 hover:border-blue-500/30 transition-all group shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-slate-400 border border-slate-800">
                      {data.category}
                    </span>
                    {data.status === 'Live Sync' && (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Live
                      </span>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-inner">
                    {data.category === 'Spatial Data' ? <MapIcon className="w-5 h-5" /> : 
                     data.category === 'Live API' ? <Globe className="w-5 h-5" /> : 
                     <FileJson className="w-5 h-5" />}
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mb-3 group-hover:text-blue-400 transition-colors">{data.title}</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-grow">
                  {data.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                    <span className="text-slate-500 font-medium">Source</span>
                    <span className="text-slate-300 font-bold truncate max-w-[150px]" title={data.source}>{data.source}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                    <span className="text-slate-500 font-medium">Format</span>
                    <span className="text-slate-300 font-bold">{data.format}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Size</span>
                    <span className="text-slate-300 font-bold">{data.size}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {data.tags.map((tag, i) => (
                    <span key={i} className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div 
                  className="mt-auto w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                  title="Download access has been disabled by the administrator"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500/50"></span>
                  Access Restricted
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center bg-slate-900/40 rounded-3xl border border-slate-800 border-dashed">
              <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">No datasets found</h3>
              <p className="text-slate-500">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sources & Mathematical Baselines */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="mb-8 border-b border-slate-800 pb-4">
          <h2 className="text-3xl font-black text-white">Mathematical Baselines & Core Assumptions</h2>
          <p className="text-slate-400 mt-2">The exact numbers, formulas, and verified sources powering the Digital Twin.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-black text-blue-400 mb-2">1. Population Estimation (165,401)</h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              <strong>Source:</strong> OpenStreetMap (Spatial Data) + Census of India 2011 (Demographics)
            </p>
            <div className="text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
              Formula: (Houses × 4) + (Apartments × 284) + (Offices × 5)
              <br /><br />
              Total Buildings Mapped: 11,429 (OSM)
              <br />
              Calculated Spatial Population: 165,277 residents
              <br />
              Target Census 2011 Population: ~165,401 residents
              <br />
              Accuracy: 99.9% validation against baseline.
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-black text-emerald-400 mb-2">2. Daily Waste Generation (72 TPD)</h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              <strong>Source:</strong> Central Pollution Control Board (CPCB) India SWM Manual
            </p>
            <div className="text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
              Formula: Population × Per Capita Generation
              <br /><br />
              CPCB Baseline for Tier-2 Cities: 0.435 kg/capita/day
              <br />
              Calculation: 165,401 × 0.435 kg
              <br />
              Total Daily Waste: 71,949 kg ≈ 72 Tons Per Day (TPD)
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-black text-rose-400 mb-2">3. Routing Fleet (32 Vehicles)</h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              <strong>Source:</strong> Udupi CMC Action Plan / OSRM Graph
            </p>
            <div className="text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
              Fleet Breakdown: 27 Auto Tippers, 5 Heavy Compactors
              <br />
              Primary Collection: Auto Tippers deployed in residential lanes (&lt;4m width).
              <br />
              Secondary Collection: Compactors restricted to arterial roads (&gt;6m width).
              <br />
              Routing Algorithm: Clarke-Wright Savings with Time Windows.
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-black text-amber-400 mb-2">4. Facilities & MRFs</h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              <strong>Source:</strong> Namma Udupi Portal / Field Verification
            </p>
            <div className="text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
              Total DWCCs: 6 (Combined Capacity: ~40 TPD)
              <br />
              Wet Waste: 1 Bio-Methanisation Plant (Beedinagudde, 43.9 TPD)
              <br />
              Regional MRF: Karvalu Central SWM Plant
              <br />
              Verification: Cross-referenced with KSPCB spatial coordinates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

