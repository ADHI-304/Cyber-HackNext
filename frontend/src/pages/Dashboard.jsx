import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ShieldCheck, UserCheck, CreditCard, Lock, ArrowUpRight, BarChart3, HelpCircle } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.name || user?.username || 'Valued Customer';

  return (
    <main id="main-content" className="min-h-[85vh] py-8 px-4 max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-700 to-sky-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 high-contrast:from-slate-900 high-contrast:to-slate-900 high-contrast:border-2 high-contrast:border-amber-400">
        <div>
          <div className="inline-flex items-center gap-2 bg-sky-600/60 border border-sky-400/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>2-Factor Authentication Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {displayName}!
          </h1>
          <p className="text-sky-100 text-sm mt-1 max-w-lg">
            Your SecureBank Online Dashboard is fully protected with AuthBuddy human-first security.
          </p>
        </div>

        {user?.role === 'admin' && (
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin-friction"
              className="min-h-[44px] px-4 py-2.5 bg-amber-400 text-slate-950 font-bold text-sm rounded-xl hover:bg-amber-300 shadow flex items-center gap-1.5 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Admin Friction Metrics</span>
            </Link>
          </div>
        )}
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2 high-contrast:bg-slate-900 high-contrast:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 high-contrast:text-amber-400">Main Savings</span>
            <CreditCard className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 high-contrast:text-white">$24,850.00</div>
          <p className="text-xs text-slate-500">Account ending in •••• 4892</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2 high-contrast:bg-slate-900 high-contrast:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 high-contrast:text-amber-400">Security Score</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">100% Secure</div>
          <p className="text-xs text-slate-500">2FA enabled & trusted recovery setup</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2 high-contrast:bg-slate-900 high-contrast:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 high-contrast:text-amber-400">Trusted Contacts</span>
            <UserCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 high-contrast:text-white">3 Assigned</div>
          <p className="text-xs text-slate-500">2-of-3 approval rule ready</p>
        </div>
      </div>

      {/* Quick Action Tools */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 space-y-4 high-contrast:bg-slate-900 high-contrast:border-amber-400">
        <h2 className="text-lg font-bold text-slate-900 high-contrast:text-white">
          Explore AuthBuddy Security Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/recovery-start"
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-500 shadow-sm flex items-start gap-3 transition-colors group high-contrast:bg-slate-800 high-contrast:border-slate-700"
          >
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 high-contrast:text-white flex items-center gap-1">
                <span>Trusted Contact Recovery</span>
                <ArrowUpRight className="w-4 h-4 opacity-50" />
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed high-contrast:text-slate-300">
                Simulate recovering your account using 2-of-3 approval rules when locked out.
              </p>
            </div>
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/admin-friction"
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-500 shadow-sm flex items-start gap-3 transition-colors group high-contrast:bg-slate-800 high-contrast:border-slate-700"
            >
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 high-contrast:text-white flex items-center gap-1">
                  <span>Admin Friction Dashboard</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed high-contrast:text-slate-300">
                  View real-time telemetry, failure rate per step, and struggle scores.
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
