import React from 'react';
import { UserCheck, Clock, XCircle, Mail, User } from 'lucide-react';

export function ContactCard({ name, email, status = 'pending', onChange, onRemove, isEditable = false, index }) {
  const getStatusBadge = () => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved (1/2)</span>
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Denied</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Waiting for approval</span>
          </span>
        );
    }
  };

  if (isEditable) {
    return (
      <div 
        className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 high-contrast:bg-slate-800 high-contrast:border-slate-700"
        role="group"
        aria-label={`Trusted Contact ${index + 1}`}
      >
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 high-contrast:text-amber-400">
          <span>Trusted Contact #{index + 1}</span>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1 rounded font-semibold text-xs transition-colors"
              aria-label={`Remove Contact ${index + 1}`}
            >
              Remove
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label 
              htmlFor={`contact-name-${index}`} 
              className="block text-xs font-bold text-slate-700 mb-1 high-contrast:text-slate-200"
            >
              Full Name
            </label>
            <div className="relative">
              <input
                id={`contact-name-${index}`}
                type="text"
                required
                value={name}
                onChange={(e) => onChange(index, 'name', e.target.value)}
                placeholder="e.g. Sarah Miller"
                className="w-full min-h-[44px] px-3 py-2 pl-9 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none high-contrast:bg-slate-900 high-contrast:text-white"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label 
              htmlFor={`contact-email-${index}`} 
              className="block text-xs font-bold text-slate-700 mb-1 high-contrast:text-slate-200"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id={`contact-email-${index}`}
                type="email"
                required
                value={email}
                onChange={(e) => onChange(index, 'email', e.target.value)}
                placeholder="sarah@example.com"
                className="w-full min-h-[44px] px-3 py-2 pl-9 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none high-contrast:bg-slate-900 high-contrast:text-white"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 high-contrast:bg-slate-800 high-contrast:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-800 font-bold text-sm flex items-center justify-center shrink-0 high-contrast:bg-amber-400 high-contrast:text-slate-950">
          {name ? name[0].toUpperCase() : 'C'}
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-900 high-contrast:text-white">{name || 'Trusted Contact'}</h4>
          <p className="text-xs text-slate-500 font-mono">{email}</p>
        </div>
      </div>

      <div>{getStatusBadge()}</div>
    </div>
  );
}
