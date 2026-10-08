import React from 'react';
import { useA11yPrefs } from '../context/A11yContext';
import { Smartphone, Mail, KeyRound, AlertOctagon, ArrowRight, User } from 'lucide-react';

export function RecoveryMethodSelector({ username, setUsername, onSelectMethod }) {
  const { t } = useA11yPrefs();

  const methods = [
    {
      id: 'phone',
      icon: Smartphone,
      title: t('recoveryPhoneTitle'),
      desc: `${t('recoveryPhoneDesc')} your verified phone number.`,
      color: 'text-sky-600 bg-sky-100'
    },
    {
      id: 'email',
      icon: Mail,
      title: t('recoveryEmailTitle'),
      desc: `${t('recoveryEmailDesc')} ${username || 'your email'}.`,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 'totp',
      icon: KeyRound,
      title: t('recoveryTotpTitle'),
      desc: t('recoveryTotpDesc'),
      color: 'text-amber-600 bg-amber-100'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1 mb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 high-contrast:text-white">
          {t('recoveryTitle')}
        </h1>
        <p className="text-xs font-medium text-slate-600 max-w-sm mx-auto leading-relaxed high-contrast:text-slate-300">
          {t('recoverySubtitle')}
        </p>
      </div>

      <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-3.5 space-y-1 high-contrast:bg-slate-800">
        <label htmlFor="rec-user-input" className="block text-xs font-bold text-slate-800 high-contrast:text-amber-400 flex items-center gap-1">
          <User className="w-3.5 h-3.5 text-sky-600" /> {t('usernameLabel')}
        </label>
        <input
          id="rec-user-input"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="you@example.com"
          className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900 bg-white focus:ring-2 focus:ring-sky-500 high-contrast:bg-slate-900 high-contrast:text-white"
        />
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

      <div className="pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => onSelectMethod('contacts')}
          className="w-full p-3 bg-purple-50 border-2 border-purple-300 text-purple-950 hover:bg-purple-100 rounded-2xl text-left flex items-start gap-3 transition-colors high-contrast:bg-slate-800 high-contrast:border-purple-400 high-contrast:text-white"
        >
          <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-xs text-purple-900 high-contrast:text-amber-400 flex items-center gap-1">
              <span>🆘 {t('noAccessContacts')}</span>
            </h2>
            <p className="text-[11px] text-purple-800 mt-0.5 high-contrast:text-slate-200 leading-tight">
              {t('guidanceNoAccessText')}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
