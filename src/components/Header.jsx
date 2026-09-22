import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Radio, 
  Volume2, 
  VolumeX, 
  FileDown, 
  Activity,
  Layers,
  Clock,
  Sparkles,
  LogOut,
  UserCheck,
  Sun,
  Moon,
  Usb,
  Palette
} from 'lucide-react';

export default function Header({ 
  cmsi, 
  status, 
  activeMiners, 
  isSirenActive, 
  onToggleSiren, 
  onExportReport,
  currentShift,
  onChangeShift,
  currentUser,
  onLogout,
  themeMode = 'dark',
  onToggleTheme,
  dashboardTheme = 'cyber',
  onSelectTheme,
  fontTheme = 'inter',
  onOpenCustomizer,
  serialConnected = false,
  onConnectSerial,
  onNavigateHome
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cmsi / 100) * circumference;

  let cmsiColor = '#10b981'; // green
  let statusBadgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let statusText = 'SAFE & STABLE';

  if (status === 'critical') {
    cmsiColor = '#ef4444'; // red
    statusBadgeBg = 'bg-red-500/25 text-red-300 border-red-500/60 animate-pulse';
    statusText = 'CRITICAL DANGER';
  } else if (status === 'advisory') {
    cmsiColor = '#f59e0b'; // yellow
    statusBadgeBg = 'bg-amber-500/25 text-amber-300 border-amber-500/50';
    statusText = 'ADVISORY WARNING';
  }

  return (
    <header className="bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 sticky top-0 z-40 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-5">
        
        {/* Left: Brand & Green ThinkerX Badge (Clickable to open Command Dashboard) */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-4 text-left hover:opacity-90 transition-all cursor-pointer group bg-transparent border-0 p-0"
          title="Click GEO SENTINEL logo to open Command Overview Dashboard"
        >
          <div className="relative">
            <div className={`p-3 rounded-2xl border transition-all ${
              status === 'critical' 
                ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse' 
                : 'bg-slate-900 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:border-cyan-300'
            }`}>
              <Layers className="w-8 h-8 group-hover:scale-105 transition-transform" />
            </div>
            {status === 'critical' && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-black tracking-wider text-white flex items-center gap-1.5 group-hover:text-cyan-200 transition-colors">
                GEO<span className="text-cyan-400 group-hover:text-cyan-300">SENTINEL</span>
              </h1>
              
              {/* Green ThinkerX Brand Badge */}
              <span className="px-2.5 py-0.5 text-xs font-black bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.5)] tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> GREEN THINKERX
              </span>

              <span className="px-2 py-0.5 text-xs font-bold bg-slate-900 text-purple-300 border border-purple-500/40 rounded-lg">
                SIH26025
              </span>
            </div>

            <p className="text-sm text-slate-300 font-medium flex items-center gap-2 mt-0.5">
              <span>AI Mine Subsidence Early Warning System</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-mono font-bold tracking-wide">DGMS COMPLIANT</span>
              <span className="text-xs text-cyan-400/80 font-mono ml-1 underline underline-offset-2">Go to Dashboard</span>
            </p>
          </div>
        </button>

        {/* Center: 3-LIGHT SAFETY BEACON + CMSI GAUGE */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Industrial 3-Light Mine Safety Beacon Stack (Red / Yellow / Green) */}
          <div className="flex items-center gap-3.5 bg-slate-900/95 border-2 border-slate-700/90 px-4 py-2 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2.5 bg-black/70 px-3 py-1.5 rounded-xl border border-slate-800">
              
              {/* RED LIGHT (DANGER) */}
              <div className="flex flex-col items-center gap-1">
                <div 
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                    status === 'critical'
                      ? 'bg-red-500 border-red-200 shadow-[0_0_22px_rgba(239,68,68,1)] animate-pulse ring-4 ring-red-500/50 scale-110'
                      : 'bg-red-950/30 border-red-900/40 opacity-25'
                  }`} 
                  title="RED: DANGER / CRITICAL STRATA COLLAPSE"
                />
                <span className={`text-[9px] font-mono font-black ${status === 'critical' ? 'text-red-400 animate-pulse' : 'text-slate-600'}`}>
                  RED
                </span>
              </div>

              {/* YELLOW LIGHT (ADVISORY) */}
              <div className="flex flex-col items-center gap-1">
                <div 
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                    status === 'advisory'
                      ? 'bg-amber-400 border-amber-100 shadow-[0_0_22px_rgba(245,158,11,1)] animate-pulse ring-4 ring-amber-400/50 scale-110'
                      : 'bg-amber-950/30 border-amber-900/40 opacity-25'
                  }`}
                  title="YELLOW: ADVISORY / SHEAR WARNING"
                />
                <span className={`text-[9px] font-mono font-black ${status === 'advisory' ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`}>
                  YEL
                </span>
              </div>

              {/* GREEN LIGHT (SAFE) */}
              <div className="flex flex-col items-center gap-1">
                <div 
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                    status === 'normal'
                      ? 'bg-emerald-400 border-emerald-100 shadow-[0_0_22px_rgba(16,185,129,1)] ring-4 ring-emerald-400/40 scale-110'
                      : 'bg-emerald-950/30 border-emerald-900/40 opacity-25'
                  }`}
                  title="GREEN: STATUTORY SAFE / CALIBRATED"
                />
                <span className={`text-[9px] font-mono font-black ${status === 'normal' ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
                  GRN
                </span>
              </div>

            </div>

            <div className="text-left hidden sm:block leading-tight">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                3-LIGHT BEACON
              </span>
              <span className={`text-xs font-black font-mono tracking-wide ${
                status === 'critical' ? 'text-red-400 animate-pulse' : status === 'advisory' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {status === 'critical' ? '🔴 DANGER HAZARD' : status === 'advisory' ? '🟡 ADVISORY STRAIN' : '🟢 SAFE & STABLE'}
              </span>
            </div>
          </div>

          {/* Big Bold CMSI Radial Gauge */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-2xl shadow-xl">
            <div className="relative flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#1e293b"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke={cmsiColor}
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={2 * Math.PI * 26 - (cmsi / 100) * 2 * Math.PI * 26}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white leading-none font-mono">
                  {cmsi}
                </span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  CMSI
                </span>
              </div>
            </div>

            <div className="text-left hidden md:block">
              <div className="text-[11px] uppercase font-bold tracking-wider text-slate-300">
                Safety Index
              </div>
              <div className={`text-xs font-black px-2.5 py-0.5 rounded-lg border inline-block mt-0.5 ${statusBadgeBg}`}>
                {statusText}
              </div>
            </div>
          </div>

        </div>

        {/* Right: Controls & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Manpower */}
          <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-700 px-3.5 py-2 rounded-xl">
            <Users className="w-5 h-5 text-cyan-400" />
            <div className="text-left leading-tight">
              <div className="text-sm font-black text-white font-mono">{activeMiners} Miners</div>
              <div className="text-[10px] text-slate-400 font-bold">Underground</div>
            </div>
          </div>

          {/* Shift selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-xl text-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <select 
              value={currentShift} 
              onChange={(e) => onChangeShift(e.target.value)}
              className="bg-transparent text-slate-100 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="Shift-A" className="bg-slate-900 text-white">Shift A (06:00 - 14:00)</option>
              <option value="Shift-B" className="bg-slate-900 text-white">Shift B (14:00 - 22:00)</option>
              <option value="Shift-C" className="bg-slate-900 text-white">Shift C (22:00 - 06:00)</option>
            </select>
          </div>

          {/* Direct Physical Hardware Sync Button */}
          {onConnectSerial && (
            <button
              onClick={onConnectSerial}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg ${
                serialConnected
                  ? 'bg-emerald-600 text-white border border-emerald-400 shadow-emerald-950/50'
                  : 'bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400'
              }`}
              title="Connect physical ESP32 via USB WebSerial"
            >
              <Usb className={`w-4 h-4 ${serialConnected ? 'text-emerald-300 animate-pulse' : 'text-cyan-400'}`} />
              <span className="hidden sm:inline">
                {serialConnected ? 'HARDWARE LIVE' : 'CONNECT HARDWARE PORT'}
              </span>
            </button>
          )}

          {/* Emergency Siren Actuator Button */}
          <button
            onClick={onToggleSiren}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg cursor-pointer ${
              isSirenActive
                ? 'bg-red-600 hover:bg-red-700 text-white animate-bounce shadow-red-600/50'
                : status === 'critical'
                ? 'bg-red-700 text-white animate-pulse border border-red-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
            }`}
          >
            {isSirenActive ? (
              <>
                <VolumeX className="w-4 h-4 text-white" />
                <span>MUTE SIREN</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-red-400" />
                <span>TEST SIREN</span>
              </>
            )}
          </button>

          {/* Theme Mode Switcher */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 shadow-md"
              title="Toggle Theme Visibility Mode"
            >
              {themeMode === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Slate Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Daylight Mode</span>
                </>
              )}
            </button>
          )}

          {/* 5x5 Theme, Font & 3D Effect Customization Studio Button */}
          {onOpenCustomizer && (
            <button
              onClick={onOpenCustomizer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40 border border-purple-400/40 hover:scale-105"
              title="Open 5x5 Theme, Font & 3D Effect Studio"
            >
              <Palette className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="hidden sm:inline">🎨 5x5 THEME STUDIO</span>
              <span className="sm:hidden">🎨 5x5</span>
            </button>
          )}

          {/* Dashboard Color Theme Selector */}
          {onSelectTheme && (
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs shadow-md">
              <Palette className="w-4 h-4 text-cyan-400" />
              <select
                value={dashboardTheme}
                onChange={(e) => onSelectTheme(e.target.value)}
                className="bg-transparent text-slate-100 text-xs font-black outline-none cursor-pointer"
                title="Manually change Dashboard Color Theme"
              >
                <option value="cyber" className="bg-slate-900 text-cyan-400">🌌 Cyber Cyan (Default)</option>
                <option value="amber" className="bg-slate-900 text-amber-400">🌋 Volcanic Amber</option>
                <option value="emerald" className="bg-slate-900 text-emerald-400">🌲 Emerald Mine</option>
                <option value="midnight" className="bg-slate-900 text-purple-400">⚡ Midnight OLED</option>
                <option value="titanium" className="bg-slate-900 text-blue-300">🏙️ Industrial Titanium</option>
              </select>
            </div>
          )}

          {/* Export DGMS Report Button */}
          <button
            onClick={onExportReport}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-cyan-900/40 shadow-xl cursor-pointer transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>DGMS REPORT (PDF)</span>
          </button>

          {/* Active Command Post Clearance Badge */}
          <div className="flex items-center gap-2.5 bg-slate-900/95 border-2 border-slate-700/90 px-3.5 py-1.5 rounded-2xl shadow-lg">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs bg-amber-500 text-slate-950 ring-2 ring-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              A
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <span>Aman Kumar</span>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/60 px-1.5 py-0.2 rounded font-black">
                  👑 MASTER ADMIN
                </span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono font-bold">
                Master Admin • All Sections Active
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
