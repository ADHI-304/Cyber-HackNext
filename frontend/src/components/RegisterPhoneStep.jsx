import React, { useState, useEffect } from 'react';
import { OtpInput } from './OtpInput';
import { AuthBuddyGuidance } from './AuthBuddyGuidance';
import { sendRegistrationPhoneOtp, verifyRegistrationPhone } from '../api/mockApi';
import { useA11yPrefs } from '../context/A11yContext';
import { Smartphone, CheckCircle2, AlertTriangle, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';

export function RegisterPhoneStep({ username, phone, onVerified, onBack }) {
  const { t } = useA11yPrefs();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [cooldown, setCooldown] = useState(60);

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
      setErrorMsg('Please enter a valid 6-digit OTP.');
      return;
    }
    setIsVerifying(true);
    setErrorMsg(null);
    const res = await verifyRegistrationPhone(username, phone, targetCode);
    setIsVerifying(false);

    if (res.ok || res.success) {
      setIsVerified(true);
      setSuccessMsg('Phone number verified ✓');
    } else {
      setErrorMsg(res.message || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await sendRegistrationPhoneOtp(phone);
    setIsResending(false);
    if (res.ok || res.success) {
      setCooldown(60);
      setSuccessMsg(`Fresh verification code sent to ${phone}`);
    } else {
      setErrorMsg(res.message || 'Could not send verification code.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-5 text-center high-contrast:bg-slate-900 high-contrast:border-amber-400">
      <AuthBuddyGuidance guidanceKey="PHONE_VERIFICATION" />

      <div className="mx-auto w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center shadow-inner">
        {isVerified ? <CheckCircle2 className="w-8 h-8 text-emerald-600" /> : <Smartphone className="w-7 h-7" />}
      </div>

      <div>
        <h2 className="text-2xl font-black text-slate-900 high-contrast:text-white">
          {isVerified ? 'Phone Verified!' : t('verifyPhoneTitle')}
        </h2>
        <p className="text-xs text-slate-600 font-medium mt-1 high-contrast:text-slate-300">
          {t('verifyPhoneSubtitle')}{' '}
          <strong className="text-slate-900 font-mono underline high-contrast:text-amber-400">{phone}</strong>
        </p>
      </div>

      {isVerified ? (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-950 font-bold text-sm flex items-center justify-center gap-2 shadow-sm animate-pulse">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <span>Phone number verified ✓</span>
        </div>
      ) : (
        <div className="space-y-3">
          <OtpInput length={6} value={code} onChange={setCode} onComplete={(val) => handleVerify(val)} />

          <div className="flex items-center justify-end text-xs px-1">
            <button
              type="button"
              disabled={cooldown > 0 || isResending}
              onClick={handleResend}
              className="font-bold text-sky-700 hover:text-sky-900 disabled:text-slate-400 flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? t('resendCooldown', { seconds: cooldown }) : t('resendButton')}
            </button>
          </div>
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
            className="flex-1 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center justify-center gap-1 shadow-md"
          >
            Continue to 2FA Setup <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || code.length < 6}
            className="flex-1 py-3 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl disabled:opacity-50 flex items-center justify-center gap-1 shadow-md"
          >
            {isVerifying ? 'Verifying...' : 'Verify Phone'}
          </button>
        )}
      </div>
    </div>
  );
}
