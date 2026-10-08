import React, { useState } from 'react';
import { PasswordMeter } from './PasswordMeter';
import { Eye, EyeOff, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export function ResetPasswordForm({ onSubmit, isLoading }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-type carefully.');
      return;
    }

    onSubmit(newPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 p-3 rounded-xl text-xs font-bold" role="alert">
          {errorMsg}
        </div>
      )}

      <div>
        <label htmlFor="new-password" className="block text-sm font-bold text-slate-800 mb-1.5 high-contrast:text-slate-100">
          New Password
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters..."
            className="w-full min-h-[44px] px-4 py-2.5 pr-12 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-200 focus:outline-none transition-colors high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] p-2 text-slate-500 flex items-center justify-center rounded-lg"
            aria-label={showPassword ? "Hide password text" : "Show password text"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <PasswordMeter password={newPassword} />
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-bold text-slate-800 mb-1.5 high-contrast:text-slate-100">
          Confirm New Password
        </label>
        <input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password..."
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-200 focus:outline-none transition-colors high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || newPassword.length < 8 || newPassword !== confirmPassword}
        className="w-full min-h-[48px] py-3 px-4 bg-sky-600 text-white font-bold text-base rounded-xl hover:bg-sky-700 shadow flex items-center justify-center gap-2 disabled:opacity-50 transition-colors high-contrast:bg-amber-400 high-contrast:text-slate-950"
      >
        <span>Update Password & Complete Recovery</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );
}
