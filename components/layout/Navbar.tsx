'use client';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { UDUPI_DATA } from '@/lib/constants';
import { ShieldCheck, LogOut, Sparkles } from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
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

const CITIZEN_LINKS = [
  { href: '/citizen', label: 'Citizen Portal' },
  { href: '/methodology', label: 'Methodology' },
];

const PUBLIC_LINKS = [
  { href: '/#features', label: 'Features' },
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const featuresRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { role, logout, openAuthModal } = useAuthStore();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (featuresRef.current && !featuresRef.current.contains(e.target as Node)) {
        setFeaturesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  useEffect(() => {
    setFeaturesOpen(false);
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
      localStorage.removeItem('vajrayield_role');
      localStorage.removeItem('authToken');
      sessionStorage.clear();
      router.push('/');
    }
  };

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false;
    return pathname === href;
  };

  const isFeaturesActive = FEATURES_LINKS.some(l => pathname === l.href);
  const isHome = pathname === '/';

  // Determine brand destination link
  const brandHref = isHome ? '/' : role === 'municipal' ? '/dashboard' : role === 'citizen' ? '/citizen' : '/';

  return (
    <>
      <nav className="relative flex items-center justify-between p-4 border-b border-white/10 bg-[#060B15]/90 backdrop-blur-md sticky top-0 z-50 transition-colors">
        {/* LEFT: Logo */}
        <div className="flex items-center gap-2">
          <Link
            href={brandHref}
            onClick={() => setIsOpen(false)}
            className="font-extrabold text-2xl tracking-tight transition-colors flex items-center gap-2 text-teal-400 hover:text-teal-300"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600/90 border border-emerald-400/80 flex items-center justify-center text-white shadow-md shadow-emerald-950/60">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Vajra<span className="text-emerald-400">Yield</span>
              </span>
              {!isHome && role === 'municipal' && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  Admin
                </span>
              )}
              {!isHome && role === 'citizen' && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Citizen
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* RIGHT / CENTER: Desktop Links & Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
            {/* PUBLIC NAVIGATION (Always shown on Landing Page '/' or when unlogged) */}
            {(isHome || role === null) && (
              <>
                {PUBLIC_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                      isActive(link.href)
                        ? 'text-white font-bold bg-white/10'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}

            {/* CITIZEN NAVIGATION (Only inside Citizen workspace, never on Landing Page) */}
            {!isHome && role === 'citizen' && (
              <>
                {CITIZEN_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                      isActive(link.href)
                        ? 'text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}

            {/* MUNICIPAL ADMIN NAVIGATION (Only inside Admin workspace, never on Landing Page!) */}
            {!isHome && role === 'municipal' && (
              <>
                {ADMIN_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm transition-all duration-200 ${
                      isActive(link.href)
                        ? 'text-teal-400 font-bold bg-teal-500/15 border border-teal-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* FEATURES DROPDOWN FOR ADMIN */}
                <div ref={featuresRef} className="relative">
                  <button
                    onClick={() => setFeaturesOpen(!featuresOpen)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm transition-all duration-200 ${
                      isFeaturesActive || featuresOpen
                        ? 'text-teal-400 font-bold bg-teal-500/15 border border-teal-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Features
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
                        className="absolute top-full right-0 mt-2 w-80 bg-[#0B1120]/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                      >
                        <div className="p-3 grid grid-cols-1 gap-1">
                          {FEATURES_LINKS.map(link => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={`group flex items-start gap-4 p-3 rounded-xl transition-all duration-200 ${
                                isActive(link.href) ? 'bg-teal-500/15 text-teal-300' : 'hover:bg-white/5'
                              }`}
                            >
                              <div className="text-2xl mt-0.5 grayscale group-hover:grayscale-0 transition-all">
                                {link.icon}
                              </div>
                              <div>
                                <div
                                  className={`text-sm font-bold mb-0.5 ${
                                    isActive(link.href)
                                      ? 'text-teal-400'
                                      : 'text-slate-200 group-hover:text-teal-400'
                                  } transition-colors`}
                                >
                                  {link.label}
                                </div>
                                <div className="text-xs text-slate-400 font-medium">{link.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* (i) Info Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-1 rounded-full flex items-center justify-center transition-colors text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white"
              style={{
                border: '1.5px solid rgba(255,255,255,0.2)',
                fontSize: '14px',
                width: '28px',
                height: '28px',
              }}
              aria-label="Data Sources"
            >
              ⓘ
            </button>

            {/* UNLOGGED: ACCESS PORTAL BUTTON */}
            {role === null && (
              <button
                onClick={() => openAuthModal('selection')}
                className="ml-3 px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-md hover:shadow-teal-500/20 hover:scale-[1.02] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Access Portal</span>
              </button>
            )}

            {/* ON LANDING PAGE: QUICK DIRECT BUTTON TO WORKSPACE */}
            {isHome && role === 'municipal' && (
              <Link
                href="/dashboard"
                className="ml-3 px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 shadow-md hover:scale-[1.02] transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Command Center →</span>
              </Link>
            )}

            {isHome && role === 'citizen' && (
              <Link
                href="/citizen"
                className="ml-3 px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-md hover:scale-[1.02] transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Citizen Portal →</span>
              </Link>
            )}

            {/* LOGGED IN: LOGOUT BUTTON */}
            {role !== null && (
              <button
                onClick={handleLogout}
                className="ml-3 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-500/30 text-rose-400 bg-rose-950/30 hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          {/* Mobile Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="absolute top-full left-0 w-full bg-[#0B1120] border-b border-slate-800 md:hidden overflow-hidden z-50 origin-top shadow-2xl"
              >
                <div className="p-4 flex flex-col gap-2">
                  {/* ON LANDING PAGE OR UNLOGGED */}
                  {(isHome || role === null) && (
                    <>
                      {PUBLIC_LINKS.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-3 rounded-xl text-slate-300 font-semibold hover:text-teal-400 hover:bg-white/5"
                        >
                          {link.label}
                        </Link>
                      ))}
                      {role === null && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            openAuthModal('selection');
                          }}
                          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black cursor-pointer"
                        >
                          <ShieldCheck className="w-5 h-5" />
                          <span>Access Portal / Login</span>
                        </button>
                      )}
                      {role === 'municipal' && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-black"
                        >
                          <ShieldCheck className="w-5 h-5" />
                          <span>Go to Command Center →</span>
                        </Link>
                      )}
                      {role === 'citizen' && (
                        <Link
                          href="/citizen"
                          onClick={() => setIsOpen(false)}
                          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black"
                        >
                          <ShieldCheck className="w-5 h-5" />
                          <span>Go to Citizen Portal →</span>
                        </Link>
                      )}
                      {role !== null && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-2 px-4 py-3 rounded-xl text-rose-400 font-bold hover:bg-rose-500/10 text-left w-full mt-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      )}
                    </>
                  )}

                  {/* ONLY INSIDE CITIZEN WORKSPACE */}
                  {!isHome && role === 'citizen' && (
                    <>
                      {CITIZEN_LINKS.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-3 rounded-xl text-slate-300 font-semibold hover:text-emerald-400 hover:bg-white/5"
                        >
                          {link.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-rose-400 font-bold hover:bg-rose-500/10 text-left w-full mt-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  )}

                  {/* ONLY INSIDE ADMIN WORKSPACE */}
                  {!isHome && role === 'municipal' && (
                    <>
                      <div className="text-xs font-bold text-slate-400 uppercase px-2 mb-1 tracking-wider">
                        Command Routes
                      </div>
                      {ADMIN_LINKS.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-2.5 rounded-xl text-slate-300 font-semibold hover:text-teal-400 hover:bg-white/5"
                        >
                          {link.label}
                        </Link>
                      ))}
                      <div className="h-px w-full bg-slate-800 my-2" />
                      <div className="text-xs font-bold text-slate-400 uppercase px-2 mb-1 tracking-wider">
                        Features
                      </div>
                      {FEATURES_LINKS.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 font-semibold hover:text-teal-400 hover:bg-white/5"
                        >
                          <span className="text-lg">{link.icon}</span>
                          <div>
                            <div className="text-sm font-bold text-white">{link.label}</div>
                            <div className="text-xs text-slate-400">{link.desc}</div>
                          </div>
                        </Link>
                      ))}
                      <div className="h-px w-full bg-slate-800 my-2" />
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-rose-400 font-bold hover:bg-rose-500/10 text-left w-full cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ⓘ Data Sources Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-[#0B1120] border border-slate-800 rounded-3xl shadow-2xl z-10 p-6 sm:p-8 text-white"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>

              <h2 className="text-2xl font-black text-white mb-6 pr-10">Data Sources &amp; Methodology</h2>

              <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-[#070D18]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5 font-extrabold uppercase tracking-widest text-[11px]">Data Point</th>
                      <th className="px-5 py-3.5 font-extrabold uppercase tracking-widest text-[11px]">Value</th>
                      <th className="px-5 py-3.5 font-extrabold uppercase tracking-widest text-[11px]">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-sm">
                    {[
                      { point: 'Area', val: '68.33 sq km', src: 'OSM boundary' },
                      { point: 'Buildings', val: '11,429', src: 'OpenStreetMap' },
                      { point: 'Road segments', val: '2,027', src: 'OpenStreetMap' },
                      { point: 'Population', val: '1,65,401', src: 'Buildings × Census 2011 Karnataka' },
                      { point: 'Per capita', val: '0.435 kg/day', src: 'CPCB standard' },
                      { point: 'Daily waste', val: '72 Tons', src: 'Udupi CMC audited baseline' },
                      { point: `Wet ${UDUPI_DATA.waste_wet_pct}%`, val: `${UDUPI_DATA.waste_wet_tons}T`, src: 'Beedinagudde BMU' },
                      { point: `Dry ${UDUPI_DATA.waste_dry_pct}%`, val: `${UDUPI_DATA.waste_dry_tons}T`, src: '6 Zonal DWCCs & MRF' },
                      { point: `Hazardous ${UDUPI_DATA.waste_hazardous_pct}%`, val: `${UDUPI_DATA.waste_hazardous_tons}T`, src: 'KSPCB Authorised' },
                      { point: 'Route saving', val: '38.2%', src: 'VRP NetworkX' },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-[#0B1120]' : 'bg-[#090F1C]'}>
                        <td className="px-5 py-3 text-slate-200 font-semibold">{row.point}</td>
                        <td className="px-5 py-3 font-mono text-teal-400 font-bold">{row.val}</td>
                        <td className="px-5 py-3 text-slate-400">{row.src}</td>
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
