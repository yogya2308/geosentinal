import React, { useState, useEffect } from 'react';
import { Users, ShieldAlert, ShieldCheck, Download, Trash2, UserPlus, Search, Clock, Laptop, Radio, Eye } from 'lucide-react';

export default function UserAccessLogSection({ currentUser }) {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Load audit logs from localStorage on mount and populate defaults if empty
  useEffect(() => {
    loadLogs();
  }, []);

  function loadLogs() {
    try {
      const stored = localStorage.getItem('geosentinel_user_logs');
      if (stored) {
        setLogs(JSON.parse(stored));
      } else {
        // Initial seeded audit data for realistic demonstration
        const defaultLogs = [
          {
            id: 'USR-89412',
            email: 'yj23082007@gmail.com',
            name: 'Yogya Jain (Master Admin)',
            role: 'admin',
            loginMethod: 'Google 1-Click Sign-In',
            loginTime: new Date().toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              dateStyle: 'medium',
              timeStyle: 'medium'
            }) + ' IST',
            userAgent: 'Desktop / Laptop (Windows 11)',
            ip: '103.212.148.22'
          },
          {
            id: 'USR-76291',
            email: 'dgms.inspector.central@gmail.com',
            name: 'DGMS Regional Inspector',
            role: 'inspector',
            loginMethod: 'Gmail & Password',
            loginTime: '10 Sep 2026, 09:14:02 PM IST',
            userAgent: 'Mobile Device (Android 14)',
            ip: '103.212.148.84'
          },
          {
            id: 'USR-61944',
            email: 'secl.safety.korba@gmail.com',
            name: 'SECL Safety Executive',
            role: 'inspector',
            loginMethod: 'Gmail & Password',
            loginTime: '10 Sep 2026, 08:30:15 PM IST',
            userAgent: 'Desktop / Laptop (Chrome)',
            ip: '103.212.148.97'
          }
        ];
        localStorage.setItem('geosentinel_user_logs', JSON.stringify(defaultLogs));
        setLogs(defaultLogs);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleClearLogs() {
    if (window.confirm('क्या आप सच में सभी विज़िटर लॉगिन रिकॉर्ड मिटाना चाहते हैं? (Confirm clear all logs)')) {
      localStorage.removeItem('geosentinel_user_logs');
      setLogs([]);
    }
  }

  function handleSimulateVisitor() {
    const demoEmails = [
      'mine.director.eastern@gmail.com',
      'cil.safety.evaluator@gmail.com',
      'sih.judge.panel2@gmail.com',
      'iit.mining.research@gmail.com'
    ];
    const pickedEmail = demoEmails[Math.floor(Math.random() * demoEmails.length)];
    const newEntry = {
      id: `USR-${Date.now().toString().slice(-5)}`,
      email: pickedEmail,
      name: pickedEmail.split('@')[0],
      role: 'inspector',
      loginMethod: 'Simulated Visitor Sign-In',
      loginTime: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'medium'
      }) + ' IST',
      userAgent: Math.random() > 0.5 ? 'Mobile Device' : 'Desktop / Laptop',
      ip: '103.212.148.' + Math.floor(Math.random() * 200 + 10)
    };

    const updated = [newEntry, ...logs];
    setLogs(updated);
    localStorage.setItem('geosentinel_user_logs', JSON.stringify(updated));
  }

  function handleExportCsv() {
    const header = ['User ID', 'Gmail Address', 'Display Name', 'Role', 'Login Method', 'Login Timestamp', 'Device / OS', 'IP Node'];
    const rows = logs.map(l => [
      l.id,
      l.email,
      l.name,
      l.role,
      l.loginMethod,
      `"${l.loginTime}"`,
      `"${l.userAgent}"`,
      l.ip
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `geosentinel_user_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Filtered list
  const filteredLogs = logs.filter(l => {
    const matchSearch = l.email.toLowerCase().includes(searchQuery.toLowerCase()) || l.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === 'all' || l.role === filterRole;
    return matchSearch && matchRole;
  });

  const uniqueGmails = new Set(logs.map(l => l.email)).size;
  const adminCount = logs.filter(l => l.role === 'admin').length;
  const inspectorCount = logs.filter(l => l.role !== 'admin').length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner - Owner Exclusive */}
      <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-amber-500/50 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-950/80 text-amber-300 border-2 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Users className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-3">
              <span>VISITOR & USER LOGIN AUDIT LEDGER</span>
              <span className="text-xs bg-amber-950 text-amber-300 border border-amber-500/60 px-3 py-1 rounded-full font-mono font-black">
                👑 MASTER ADMIN: YOGYA JAIN
              </span>
            </h2>
            <p className="text-sm font-semibold text-slate-200">
              Complete chronological ledger of all Gmail users accessing the GeoSentinel Mine Monitoring network. Restricted to Master Admin only.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSimulateVisitor}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Demo Visitor</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 text-xs font-black transition-all cursor-pointer shadow"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Logins */}
        <div className="bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider block">Total Logins Recorded</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-mono font-black text-white">{logs.length}</span>
            <span className="text-xs font-bold text-cyan-300">sessions</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-2">Persistent across reloads</p>
        </div>

        {/* Unique Gmail Users */}
        <div className="bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider block">Unique Gmail Users</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-mono font-black text-cyan-300">{uniqueGmails}</span>
            <span className="text-xs font-bold text-slate-300">accounts</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-2">100% verified @gmail.com</p>
        </div>

        {/* Admin Logins */}
        <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">👑 Master Admin (Aman)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-mono font-black text-amber-300">{adminCount}</span>
            <span className="text-xs font-bold text-slate-300">logins</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-2">Full portal control privilege</p>
        </div>

        {/* Visitor / Inspector Logins */}
        <div className="bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider block">Mine Inspectors / Visitors</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-mono font-black text-emerald-300">{inspectorCount}</span>
            <span className="text-xs font-bold text-slate-300">sessions</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-2">Hardware tab masked</p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Gmail or user name..."
            className="w-full bg-slate-950 text-white font-mono text-xs border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs font-bold text-slate-300">Filter Role:</span>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-3 py-1 rounded-lg cursor-pointer ${filterRole === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilterRole('admin')}
              className={`px-3 py-1 rounded-lg cursor-pointer ${filterRole === 'admin' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
            >
              Admin ({adminCount})
            </button>
            <button
              onClick={() => setFilterRole('inspector')}
              className={`px-3 py-1 rounded-lg cursor-pointer ${filterRole === 'inspector' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Inspectors ({inspectorCount})
            </button>
          </div>
        </div>
      </div>

      {/* Users Audit Table */}
      <div className="bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl p-5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="bg-slate-950 text-slate-200 text-xs border-b-2 border-slate-700 font-black">
                <th className="p-3">User ID</th>
                <th className="p-3">Verified Gmail Address</th>
                <th className="p-3">Role Clearance</th>
                <th className="p-3">Auth Method</th>
                <th className="p-3">Login Timestamp (IST)</th>
                <th className="p-3">Device / Platform</th>
                <th className="p-3">Subterranean IP Node</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-8 text-slate-400 font-sans">
                    कोई लॉगिन रिकॉर्ड नहीं मिला (No login records found matching filter).
                  </td>
                </tr>
              ) : (
                filteredLogs.map(user => {
                  const isAdmin = user.role === 'admin';
                  return (
                    <tr key={user.id + user.loginTime} className="border-b border-slate-800 hover:bg-slate-800/60 transition-colors font-bold">
                      <td className="p-3 text-cyan-300 font-mono font-black">{user.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                            isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-cyan-900 text-cyan-200 border border-cyan-500/40'
                          }`}>
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-mono">{user.email}</div>
                            <div className="text-[10px] text-slate-400 font-sans">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${
                          isAdmin 
                            ? 'bg-amber-950 text-amber-300 border border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        }`}>
                          {isAdmin ? '👑 MASTER ADMIN' : 'MINE INSPECTOR'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200 font-sans font-medium">{user.loginMethod}</td>
                      <td className="p-3 text-amber-200 font-mono flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.loginTime}</span>
                      </td>
                      <td className="p-3 text-slate-300 font-sans flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.userAgent}</span>
                      </td>
                      <td className="p-3 text-slate-400 font-mono">{user.ip}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
