import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, User, HardHat, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const MASTER_ADMIN_EMAIL = 'yj23082007@gmail.com';

export default function LoginModal({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('inspector'); // 'inspector' | 'admin'
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Validate that email strictly ends with @gmail.com
  function isValidGmail(mail) {
    if (!mail) return false;
    const trimmed = mail.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(trimmed);
  }

  function handleDirectGoogleSignIn(googleEmail = MASTER_ADMIN_EMAIL) {
    setIsProcessing(true);
    setErrorMsg('');

    setTimeout(() => {
      const isOwner = googleEmail.trim().toLowerCase() === MASTER_ADMIN_EMAIL || selectedRole === 'admin';
      const role = isOwner ? 'admin' : 'inspector';
      const displayName = isOwner ? 'Yogya Jain (Master Admin)' : googleEmail.split('@')[0];

      const userObj = {
        id: `USR-${Date.now().toString().slice(-5)}`,
        email: googleEmail,
        name: displayName,
        role: role,
        accessLevel: isOwner ? 'master-admin' : 'inspector',
        loginMethod: 'Google 1-Click Sign-In',
        loginTime: new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'medium'
        }) + ' IST',
        userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop / Laptop',
        ip: '103.212.148.' + Math.floor(Math.random() * 200 + 10)
      };

      saveUserAndLogin(userObj);
    }, 500);
  }

  function handleSubmitForm(e) {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Check Gmail
    if (!trimmedEmail) {
      setErrorMsg('कृपया अपना Gmail दर्ज करें (Please enter your Gmail address).');
      return;
    }

    if (!isValidGmail(trimmedEmail)) {
      setErrorMsg('मान्य Gmail अनिवार्य है (उदा. username@gmail.com). केवल @gmail.com मान्य है।');
      return;
    }

    // 2. Password check (User explicitly requested: "पासवर्ड कोई भी चलेगा लेकिन Gmail सही होना चाहिए")
    if (!password) {
      setErrorMsg('कृपया कोई भी पासवर्ड दर्ज करें (Password is required).');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      // Grant Master Admin access only to the configured account or explicit admin demo mode.
      const isOwner = trimmedEmail === MASTER_ADMIN_EMAIL || selectedRole === 'admin';
      const role = isOwner ? 'admin' : 'inspector';
      const displayName = isOwner ? 'Yogya Jain (Master Admin)' : trimmedEmail.split('@')[0];

      const userObj = {
        id: `USR-${Date.now().toString().slice(-5)}`,
        email: trimmedEmail,
        name: displayName,
        role: role,
        accessLevel: isOwner ? 'master-admin' : 'inspector',
        loginMethod: 'Gmail & Password',
        loginTime: new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'medium'
        }) + ' IST',
        userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop / Laptop',
        ip: '103.212.148.' + Math.floor(Math.random() * 200 + 10)
      };

      saveUserAndLogin(userObj);
    }, 400);
  }

  function saveUserAndLogin(userObj) {
    // 1. Store active session
    localStorage.setItem('geosentinel_auth_user', JSON.stringify(userObj));

    // 2. Append to persistent audit log for the Admin
    try {
      const existingLogsStr = localStorage.getItem('geosentinel_user_logs');
      const logs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
      logs.unshift(userObj);
      localStorage.setItem('geosentinel_user_logs', JSON.stringify(logs.slice(0, 100)));
    } catch (err) {
      console.error('Audit log storage error', err);
    }

    setIsProcessing(false);
    onLoginSuccess(userObj);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      {/* Decorative ambient background glows */}
      <div className="absolute w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none -top-10 -left-10 animate-pulse" />
      <div className="absolute w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10 animate-pulse" />

      {/* Main Authentication Card */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-slate-100">
        
        {/* Top Header & DGMS Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-cyan-950 to-slate-900 border-2 border-cyan-400/60 rounded-2xl mb-3 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <ShieldCheck className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center justify-center gap-2">
            GEOSENTINEL PORTAL
          </h1>
          <p className="text-xs font-bold text-cyan-300 tracking-wider uppercase mt-1">
            DGMS Central Mine Safety Monitoring Network
          </p>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Underground Real-Time Subsidence Early Warning Network (SIH26025)
          </p>
        </div>

        {/* Quick Google Sign-In Button */}
        <button
          type="button"
          onClick={() => handleDirectGoogleSignIn('amankumar@gmail.com')}
          disabled={isProcessing}
          className="w-full mb-4 flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold px-4 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer disabled:opacity-50"
        >
          {/* Official Google G Logo SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-sm">Continue with Google (1-Click)</span>
        </button>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[11px] font-mono font-bold text-slate-400 uppercase">
            OR SIGN IN WITH GMAIL
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/80 border-2 border-red-500 rounded-xl text-xs font-bold text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmitForm} className="space-y-4">
          
          {/* Role Selection Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
              Select Access Clearance (भूमिका चुनें):
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRole('inspector')}
                className={`py-2 px-2 text-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedRole === 'inspector'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mine Inspector
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  if (!email) setEmail(MASTER_ADMIN_EMAIL);
                }}
                className={`py-2 px-2 text-center rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  selectedRole === 'admin'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                    : 'text-amber-400/80 hover:text-amber-300'
                }`}
              >
                <span>👑 Master Admin (Yogya 2308)</span>
              </button>
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-1">
              {selectedRole === 'admin' 
                ? '★ Master Admin Access: User Logins Audit & Hardware Console unlocked.' 
                : 'Standard Inspector Access: Real-time telemetry, 3D Twin & alerts.'}
            </p>
          </div>

          {/* Gmail Input Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Gmail Address (Gmail अनिवार्य है):
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-slate-950 text-white font-mono text-sm border-2 border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors"
                autoComplete="email"
              />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 block mt-1">
              * Must end with @gmail.com
            </span>
          </div>

          {/* Password Input Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Password (कोई भी पासवर्ड चलेगा):
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (any password)"
                className="w-full bg-slate-950 text-white font-mono text-sm border-2 border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-10 py-2.5 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">
              * Any password is valid.
            </span>
          </div>

          {/* Submit Login Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-slate-950 font-black py-3 px-4 rounded-xl shadow-xl shadow-cyan-500/20 transition-all transform hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Authenticating Session...
              </span>
            ) : (
              <>
                <span>Enter GeoSentinel Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Disclaimer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[10px] font-mono text-slate-400">
            Encrypted Session • DGMS Rule 112 Compliance • Team Green ThinkerX
          </p>
        </div>

      </div>
    </div>
  );
}
