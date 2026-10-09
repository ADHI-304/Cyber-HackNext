import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useA11yPrefs } from '../context/A11yContext';

export function LoginFormFields({ 
  username, 
  setUsername, 
  password, 
  setPassword, 
  showPassword, 
  setShowPassword 
}) {
  const { t } = useA11yPrefs();

  return (
    <>
      <div>
        <label htmlFor="login-username" className="block text-sm font-bold text-slate-800 mb-1.5 high-contrast:text-slate-100">
          {t('usernameLabel')} <span className="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span>
        </label>
        <input
          id="login-username"
          type="email"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('usernamePlaceholder')}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-200 focus:outline-none transition-colors high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
          <label htmlFor="login-password" className="block text-sm font-bold text-slate-800 high-contrast:text-slate-100">
            {t('passwordLabel')} <span className="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span>
          </label>
          <Link to="/recovery-start" className="text-xs font-semibold text-sky-700 hover:text-sky-900 underline flex items-center gap-1 high-contrast:text-amber-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t('forgotPassword')}</span>
          </Link>
        </div>

        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
            className="w-full min-h-[44px] px-4 py-2.5 pr-12 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-200 focus:outline-none transition-colors high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] p-2 text-slate-500 flex items-center justify-center rounded-lg"
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </>
  );
}
