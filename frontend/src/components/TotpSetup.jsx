import React, { useState } from 'react';
import { QrCode, Check, Copy, ArrowRight } from 'lucide-react';

export function TotpSetup({ totpData, onDone }) {
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleCopySecret = () => {
    if (totpData?.secretKey) {
      navigator.clipboard.writeText(totpData.secretKey);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5 high-contrast:bg-slate-900 high-contrast:border-amber-400">
      <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shadow-inner high-contrast:bg-amber-400 high-contrast:text-slate-950">
        <QrCode className="w-6 h-6" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 high-contrast:text-white">
        Set Up Authenticator App (2FA)
      </h1>

      <p className="text-sm text-slate-600 font-medium leading-relaxed high-contrast:text-slate-300">
        Scan the code below using Google Authenticator, Authy, or 1Password to secure your account.
      </p>

      {/* QR Placeholder */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl inline-block shadow-sm high-contrast:bg-slate-800 high-contrast:border-slate-700">
        {totpData?.qrPlaceholderUrl ? (
          <img 
            src={totpData.qrPlaceholderUrl} 
            alt="QR Code Placeholder for Authenticator Setup" 
            className="w-44 h-44 mx-auto rounded-lg" 
          />
        ) : (
          <div className="w-44 h-44 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
            [ QR Code ]
          </div>
        )}
      </div>

      {/* Manual Secret Key */}
      <div className="bg-slate-100 border border-slate-300 p-3 rounded-xl text-left space-y-1 high-contrast:bg-slate-800 high-contrast:border-slate-700">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 high-contrast:text-amber-400">
          Manual Key (If camera isn't working)
        </span>
        <div className="flex items-center justify-between font-mono font-bold text-slate-900 text-sm high-contrast:text-white">
          <span>{totpData?.secretKey || 'JBSWY3DPEHPK3PXP'}</span>
          <button
            type="button"
            onClick={handleCopySecret}
            className="min-h-[44px] px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center gap-1 transition-colors high-contrast:bg-slate-700 high-contrast:border-slate-600"
            aria-label="Copy manual authenticator secret key"
          >
            {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSecret ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="w-full min-h-[48px] py-3 px-4 bg-sky-600 text-white font-bold text-base rounded-xl hover:bg-sky-700 shadow flex items-center justify-center gap-2 high-contrast:bg-amber-400 high-contrast:text-slate-950"
      >
        <span>Done! Go to Sign In</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
