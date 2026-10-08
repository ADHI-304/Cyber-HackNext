import React from 'react';
import { Smartphone, Mail, KeyRound, AlertOctagon, ArrowRight } from 'lucide-react';

export function RecoveryMethodSelector({ onSelectMethod }) {
  const methods = [
    {
      id: 'phone',
      icon: Smartphone,
      title: 'Registered phone',
      desc: 'Receive a 6-digit verification code at +91 ******1234.',
      color: 'text-sky-600 bg-sky-100'
    },
    {
      id: 'email',
      icon: Mail,
      title: 'Recovery email',
      desc: 'Receive a secure verification link at a******@gmail.com.',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 'totp',
      icon: KeyRound,
      title: 'Authenticator app',
      desc: 'Use a 6-digit code from Google Authenticator or 1Password.',
      color: 'text-amber-600 bg-amber-100'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1 mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 high-contrast:text-white">
          🔐 Account Recovery
        </h1>
        <p className="text-xs font-medium text-slate-600 max-w-sm mx-auto leading-relaxed high-contrast:text-slate-300">
          Let's help you recover your account. First, choose which verification method you still have access to.
        </p>
      </div>

      <div className="space-y-2">
        {methods.map((m) => {
          const IconComp = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMethod(m.id)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-sky-500 hover:bg-white transition-all text-left flex items-start gap-3 shadow-sm group high-contrast:bg-slate-800 high-contrast:border-slate-700"
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${m.color} group-hover:scale-105 transition-transform`}>
                <IconComp className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-sm text-slate-900 high-contrast:text-white flex items-center gap-1">
                    <span>{m.title}</span>
                  </h2>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5 high-contrast:text-slate-300">{m.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* "I can't access any of these" Button */}
      <div className="pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={() => onSelectMethod('contacts')}
          className="w-full p-3.5 bg-purple-50 border-2 border-purple-300 text-purple-950 hover:bg-purple-100 rounded-2xl text-left flex items-start gap-3 transition-colors high-contrast:bg-slate-800 high-contrast:border-purple-400 high-contrast:text-white"
        >
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-purple-900 high-contrast:text-amber-400 flex items-center gap-1">
              <span>🆘 I can't access any of these</span>
            </h2>
            <p className="text-xs text-purple-800 mt-0.5 high-contrast:text-slate-200">
              Lost phone & methods? Start 2-of-3 Trusted Contact recovery.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
