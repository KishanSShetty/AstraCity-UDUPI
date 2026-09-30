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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-12">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl mb-4 border border-emerald-100 shadow-xs">
            <Server className="w-8 h-8" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Open Data Hub
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Transparency is at the core of the SWM Digital Twin. Explore, audit, and download the geospatial datasets and APIs powering the Udupi routing algorithms.
          </motion.p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                  activeCategory === category 
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 shadow-xs'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search datasets, tags..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs shadow-xs"
            />
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredData.length > 0 ? (
            filteredData.map((data, idx) => (
              <motion.div 
                key={data.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col h-full hover:border-emerald-500/40 hover:shadow-md transition-all group shadow-xs"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
                      {data.category}
                    </span>
                    {data.status === 'Live Sync' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Live
                      </span>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
                    {data.category === 'Spatial Data' ? <MapIcon className="w-4 h-4" /> : 
                     data.category === 'Live API' ? <Globe className="w-4 h-4" /> : 
                     <FileJson className="w-4 h-4" />}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">{data.title}</h3>
                <p className="text-slate-600 text-xs mb-4 leading-relaxed flex-grow">
                  {data.description}
                </p>

                <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Source</span>
                    <span className="text-slate-700 font-semibold truncate max-w-[150px]" title={data.source}>{data.source}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Format</span>
                    <span className="text-slate-700 font-semibold">{data.format}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Size</span>
                    <span className="text-slate-700 font-semibold">{data.size}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {data.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div 
                  className="mt-auto w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                  title="Download access has been disabled by the administrator"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Access Restricted
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
              <Database className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No datasets found</h3>
              <p className="text-xs text-slate-500">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

