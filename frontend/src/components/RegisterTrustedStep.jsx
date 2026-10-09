import React, { useState, useEffect } from 'react';
import { OtpInput } from './OtpInput';
import { AuthBuddyGuidance } from './AuthBuddyGuidance';
import { verifyRegistrationTrustedContact } from '../api/mockApi';
import { useA11yPrefs } from '../context/A11yContext';
import { Users, CheckCircle2, AlertTriangle, RefreshCw, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export function RegisterTrustedStep({ username, contact, onVerified, onBack }) {
  const { t } = useA11yPrefs();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const contactEmail = contact?.email || 'primary.contact@example.com';
  const contactName = contact?.name || 'Primary Contact 1';

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (otpToVerify) => {
    const targetCode = (typeof otpToVerify === 'string' && otpToVerify.length > 0) ? otpToVerify : code;
    if (!targetCode || targetCode.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code sent to your primary contact.');
      return;
    }
    setIsVerifying(true);
    setErrorMsg(null);
    const res = await verifyRegistrationTrustedContact(username, contactEmail, targetCode);
    setIsVerifying(false);

    if (res.ok || res.success) {
      setIsVerified(true);
      setSuccessMsg(`Mandatory Primary Contact (${contactName}) verified ✓`);
    } else {
      setErrorMsg(res.message || 'Invalid verification code.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-purple-200 shadow-xl space-y-5 text-center high-contrast:bg-slate-900 high-contrast:border-amber-400">
      <div className="mx-auto w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center shadow-inner">
        {isVerified ? <CheckCircle2 className="w-8 h-8 text-emerald-600" /> : <Users className="w-7 h-7 text-purple-700" />}
      </div>

      <div>
        <h2 className="text-2xl font-black text-slate-900 high-contrast:text-white">
          {isVerified ? 'Trusted Contact Verified!' : 'Verify Mandatory Primary Contact'}
        </h2>
        <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed high-contrast:text-slate-300">
          Enter the 6-digit code sent to your mandatory primary contact <strong className="text-slate-900 high-contrast:text-amber-400">{contactName}</strong> (<span className="font-mono">{contactEmail}</span>) to authorize recovery setup.
        </p>
      </div>

      {isVerified ? (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-950 font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <span>Mandatory Primary Trusted Contact Verified ✓</span>
        </div>
      ) : (
        <div className="space-y-3">
          <OtpInput length={6} value={code} onChange={setCode} onComplete={(val) => handleVerify(val)} />
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && !isVerified && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800">
          {successMsg}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl border flex items-center justify-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {isVerified ? (
          <button
            type="button"
            onClick={onVerified}
            className="flex-1 py-3 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl flex items-center justify-center gap-1 shadow-md"
          >
            Continue to 2FA Setup <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || code.length < 6}
            className="flex-1 py-3 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl disabled:opacity-50 flex items-center justify-center gap-1 shadow-md"
          >
            {isVerifying ? 'Verifying...' : 'Verify Primary Contact'}
          </button>
        )}
      </div>
    </div>
  );
}
