'use client';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { UDUPI_DATA } from '@/lib/constants';

const MAIN_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: '⚡ Command Center' },
  { href: '/map', label: 'Map' },
  { href: '/osm', label: 'OSM' },
  { href: '/simulation', label: 'Simulation' },
  { href: '/routes', label: 'Routes' },
  { href: '/routing', label: '🚛 Routing Engine' },
  { href: '/forecast', label: '🔮 Forecast' },
  { href: '/ingestion', label: '📋 Field Ingestion' },
  { href: '/open-data', label: '📂 Open Data' },
  { href: '/methodology', label: 'Methodology' },
];

const FEATURES_LINKS = [
  { href: '/analysis', label: 'Data Analysis', desc: 'Geospatial datasets & urban metrics', icon: '📊' },
  { href: '/analytics', label: 'Routing Analytics', desc: 'ROI, carbon credits & fleet performance', icon: '📈' },
  { href: '/impact', label: 'Impact Dashboard', desc: 'Environmental & social impact', icon: '🌍' },
  { href: '/wards', label: 'Ward Metrics', desc: 'Udupi City sector scores', icon: '🏘️' },
  { href: '/economics', label: 'Economics', desc: 'Live financial calculator', icon: '💰' },
  { href: '/gridwise', label: 'Grid-Wise Zones', desc: '500m grid zone analysis & risk', icon: '🗺️' },
  { href: '/lulc', label: 'LULC Analysis', desc: 'Land Use & Cover via Sentinel', icon: '🛰️' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const featuresRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { role, logout } = useAuthStore();

  const isWorkspaceRoute = [
    '/dashboard', '/data-ingestion', '/chat', '/network',
    '/cases', '/profiles', '/alerts', '/financial', '/audit', '/settings'
  ].some(prefix => pathname?.startsWith(prefix));

  if (isWorkspaceRoute) {
    return null;
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (featuresRef.current && !featuresRef.current.contains(e.target as Node)) {
        setFeaturesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);

    // Theme logic
    const saved = localStorage.getItem('VajraYield-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // API check
    const checkApi = async () => {
      try {
        const res = await fetch('http://localhost:8000/');
        setApiStatus(res.ok ? 'online' : 'offline');
      } catch {
        setApiStatus('offline');
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 10000);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    setFeaturesOpen(false);
    setIsOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('VajraYield-theme', 'light');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('VajraYield-theme', 'light');
    }
  };

  const isActive = (href: string) => pathname === href;
  const isFeaturesActive = FEATURES_LINKS.some(l => pathname === l.href);
  const isHome = pathname === '/';

  return (
    <>
      <nav className={`relative flex items-center justify-between p-4 border-b sticky top-0 z-50 transition-colors ${isHome
        ? 'border-white/10 bg-[#000814]/80 backdrop-blur-md'
        : 'border-slate-200 bg-white/95 backdrop-blur-md'
        }`}>
        {/* LEFT: Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" onClick={() => setIsOpen(false)} className={`font-extrabold text-2xl tracking-tight transition-colors flex items-center gap-2 ${isHome ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-500'
            }`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 border border-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
              </svg>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-emerald-400">VajraYield</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-6">

          {/* Desktop Links */}
          <div className={`hidden md:flex items-center gap-1 text-sm font-medium ${isHome ? 'text-white/70' : 'text-slate-500'}`}>
            {role !== 'citizen' && (
              <>
                {MAIN_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${isActive(link.href)
                  ? (isHome ? 'text-white font-bold bg-white/10' : 'text-slate-900 font-bold bg-slate-100/60')
                  : (isHome ? 'hover:text-white hover:bg-white/5' : 'hover:text-slate-900 hover:bg-slate-100/40')
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* FEATURES DROPDOWN */}
            <div ref={featuresRef} className="relative">
              <button
                onClick={() => setFeaturesOpen(!featuresOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${isFeaturesActive || featuresOpen
                  ? (isHome ? 'text-white font-bold bg-white/10' : 'text-slate-900 font-bold bg-slate-100/60')
                  : (isHome ? 'hover:text-white hover:bg-white/5' : 'hover:text-slate-900 hover:bg-slate-100/40')
                  }`}
              >
                Features
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform duration-200 ${featuresOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M3 5l3 3 3-3" />
                </svg>
              </button>

              <AnimatePresence>
                {featuresOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-slate-100 border border-slate-300 rounded-2xl shadow-lg overflow-hidden z-[60]"
                  >
                    <div className="p-3 grid grid-cols-1 gap-1">
                      {FEATURES_LINKS.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`group flex items-start gap-4 p-3 rounded-xl transition-all duration-200 ${isActive(link.href) ? 'bg-slate-100' : 'hover:bg-slate-100/60'
                            }`}
                        >
                          <div className="text-2xl mt-0.5 grayscale group-hover:grayscale-0 transition-all">{link.icon}</div>
                          <div>
                            <div className={`text-sm font-bold mb-0.5 ${isActive(link.href) ? 'text-teal-600' : 'text-slate-700 group-hover:text-teal-600'} transition-colors`}>{link.label}</div>
                            <div className="text-xs text-slate-500 font-medium">{link.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* ⓘ Info Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={`ml-2 rounded-full flex items-center justify-center transition-colors text-sm font-bold ${isHome
                ? 'text-white/70 hover:bg-white/10 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
              style={{ border: isHome ? '1.5px solid rgba(255,255,255,0.2)' : '1.5px solid #cbd5e1', fontSize: '14px', width: '28px', height: '28px' }}
              aria-label="Data Sources"
            >
              ⓘ
            </button>
              </>
            )}
            {/* LOGOUT BUTTON */}
            <button
              onClick={() => {
                logout();
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('userRole');
                  localStorage.removeItem('vajrayield_role');
                  localStorage.removeItem('authToken');
                  sessionStorage.clear();
                  window.location.href = '/';
                }
              }}
              className="ml-3 px-3 py-1 rounded-lg text-xs font-bold border border-rose-500/30 text-rose-300 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5"
            >
              Logout
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button className={`md:hidden p-2 ${isHome ? 'text-white' : 'text-slate-600'}`} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>

          {/* Mobile Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="absolute top-full left-0 w-full bg-slate-100 border-b border-slate-200 md:hidden overflow-hidden z-50 origin-top"
              >
                <div className="p-4 flex flex-col gap-2">
                  {role !== 'citizen' && (
                    <>
                      <div className="text-xs font-bold text-slate-500 uppercase px-2 mb-1 tracking-wider">Pages</div>
                  {MAIN_LINKS.map(link => (
                    <Link key={link.href} href={link.href} className="px-4 py-3 rounded-xl text-slate-600 font-semibold hover:text-teal-600 hover:bg-slate-100">
                      {link.label}
                    </Link>
                  ))}
                  <div className="h-px w-full bg-slate-100 my-2" />
                  <div className="text-xs font-bold text-slate-500 uppercase px-2 mb-1 tracking-wider">Features</div>
                  {FEATURES_LINKS.map(link => (
                    <Link key={link.href} href={link.href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-semibold hover:text-teal-600 hover:bg-slate-100">
                      <span className="text-lg grayscale">{link.icon}</span> {link.label}
                    </Link>
                  ))}
                  <div className="h-px w-full bg-slate-200 my-2" />
                    </>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('vajrayield_role');
                        localStorage.removeItem('authToken');
                        sessionStorage.clear();
                        window.location.href = '/';
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-rose-600 font-bold hover:bg-rose-50 transition-colors text-left w-full"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ⓘ Data Sources Modal — OUTSIDE nav for proper centering */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-10 p-6 sm:p-8"
              style={{ margin: 'auto' }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
              >
                ✕
              </button>

              <h2 className="text-2xl font-black text-slate-900 mb-6 pr-10">Data Sources & Methodology</h2>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5 font-extrabold uppercase tracking-widest text-[11px]">Data Point</th>
                      <th className="px-5 py-3.5 font-extrabold uppercase tracking-widest text-[11px]">Value</th>
                      <th className="px-5 py-3.5 font-extrabold uppercase tracking-widest text-[11px]">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {[
                      { point: 'Area', val: '68.23 sq km', src: 'OSM boundary' },
                      { point: 'Buildings', val: '9,471', src: 'OpenStreetMap' },
                      { point: 'Building density', val: '512/sq km', src: 'Calculated' },
                      { point: 'Road segments', val: '2,027', src: 'OpenStreetMap' },
                      { point: 'Road density', val: '110/sq km', src: 'Calculated' },
                      { point: 'Truck roads', val: '352 (17.4%)', src: 'OSM road types' },
                      { point: 'Auto roads', val: '1,579 (77.9%)', src: 'OSM road types' },
                      { point: 'Population', val: '1,65,401', src: 'Buildings×Census 2011 Karnataka' },
                      { point: 'Per capita', val: '0.5 kg/day', src: 'CPCB large city official' },
                      { point: 'Daily waste', val: '55 Tons', src: '1,65,401 × 0.5kg' },
                      { point: `Wet ${UDUPI_DATA.waste_wet_pct}%`, val: `${UDUPI_DATA.waste_wet_tons}T`, src: 'Udupi CMC Chemical Analysis' },
                      { point: `Dry ${UDUPI_DATA.waste_dry_pct}%`, val: `${UDUPI_DATA.waste_dry_tons}T`, src: 'CPCB 59-cities' },
                      { point: `Hazardous ${UDUPI_DATA.waste_hazardous_pct}%`, val: `${UDUPI_DATA.waste_hazardous_tons}T`, src: 'Udupi CMC guidelines' },
                      { point: 'Route saving', val: '75.5%', src: 'NetworkX VRP' },
                      { point: 'Collection schedule', val: 'Daily/2×wk', src: 'hsrcitizenforum.in' },
                      { point: 'Wet routing', val: '→ Bio-meth', src: 'ceeindia.org/hsr-swm' },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="px-5 py-3 text-slate-800 font-semibold">{row.point}</td>
                        <td className="px-5 py-3 font-mono text-teal-600 font-bold">{row.val}</td>
                        <td className="px-5 py-3 text-slate-500">{row.src}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
