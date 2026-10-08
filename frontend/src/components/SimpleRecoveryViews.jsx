import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OtpInput } from './OtpInput';
import { AuthBuddyGuidance } from './AuthBuddyGuidance';
import { verifyPhoneRecoveryOtp, requestEmailRecoveryOtp, verifyTotpRecovery } from '../api/mockApi';
import { Smartphone, Mail, KeyRound, CheckCircle2 } from 'lucide-react';

export function SimpleRecoveryViews({ selectedMethod, onBack }) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleVerifyPhone = async () => {
    setIsVerifying(true);
    setErrorMsg(null);
    const res = await verifyPhoneRecoveryOtp('user@securebank.com', code || '123456');
    setIsVerifying(false);
    if (res.ok || res.success) {
      navigate('/reset-password');
    } else {
      setErrorMsg(res.message || 'Invalid code');
    }
  };

  const handleSendEmail = async () => {
    setIsVerifying(true);
    await requestEmailRecoveryOtp('user@securebank.com');
    setIsVerifying(false);
    setEmailSent(true);
  };

  const handleVerifyTotp = async () => {
    setIsVerifying(true);
    setErrorMsg(null);
    const res = await verifyTotpRecovery('user@securebank.com', code || '123456');
    setIsVerifying(false);
    if (res.ok || res.success) {
      navigate('/reset-password');
    } else {
      setErrorMsg(res.message || 'Invalid TOTP code');
    }
  };

  if (selectedMethod === 'phone') {
    return (
      <div className="space-y-4 text-center">
        <AuthBuddyGuidance guidanceKey="PHONE_VERIFICATION" />
        <div className="mx-auto w-12 h-12 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center">
          <Smartphone className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 high-contrast:text-white">Registered Phone Verification</h2>
        <p className="text-xs text-slate-600 font-medium">We'll send a 6-digit code to <strong className="text-slate-900 font-mono">+91 ******1234</strong>.</p>

        <div className="space-y-2">
          <OtpInput length={6} value={code} onChange={setCode} onComplete={handleVerifyPhone} />
          <button
            type="button"
            onClick={() => setCode('123456')}
            className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors"
          >
            Auto-fill Demo Code (123456)
          </button>
        </div>

        {errorMsg && <div className="text-xs font-bold text-rose-600">{errorMsg}</div>}
        
        <div className="flex gap-2">
          <button type="button" onClick={onBack} className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border">Back</button>
          <button type="button" onClick={handleVerifyPhone} disabled={isVerifying} className="flex-1 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl disabled:opacity-50">
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      </div>
    );
  }

  if (selectedMethod === 'email') {
    return (
      <div className="space-y-4 text-center">
        <AuthBuddyGuidance guidanceKey="EMAIL_VERIFICATION" />
        <div className="mx-auto w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 high-contrast:text-white">Recovery Email Link</h2>
        <p className="text-xs text-slate-600 font-medium">We'll send a secure link to <strong className="text-slate-900 font-mono">user@securebank.com</strong>.</p>

        {emailSent ? (
          <div className="space-y-3 bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-xs font-semibold text-emerald-950">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p>Recovery link & 6-digit code sent to your inbox!</p>
            <button type="button" onClick={() => navigate('/reset-password')} className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">Open Reset Password Page</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={onBack} className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border">Back</button>
            <button type="button" onClick={handleSendEmail} disabled={isVerifying} className="flex-1 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl">
              {isVerifying ? 'Sending...' : 'Send Recovery Link'}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (selectedMethod === 'totp') {
    return (
      <div className="space-y-4 text-center">
        <AuthBuddyGuidance guidanceKey="AUTHENTICATOR_VERIFICATION" />
        <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 high-contrast:text-white">Authenticator App</h2>
        <p className="text-xs text-slate-600 font-medium">Open your authenticator app and enter the 6-digit code.</p>

        <div className="space-y-2">
          <OtpInput length={6} value={code} onChange={setCode} onComplete={handleVerifyTotp} />
          <button
            type="button"
            onClick={() => setCode('123456')}
            className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
          >
            Auto-fill Demo Code (123456)
          </button>
        </div>

        {errorMsg && <div className="text-xs font-bold text-rose-600">{errorMsg}</div>}

        <div className="flex gap-2">
          <button type="button" onClick={onBack} className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border">Back</button>
          <button type="button" onClick={handleVerifyTotp} disabled={isVerifying} className="flex-1 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl disabled:opacity-50">
            {isVerifying ? 'Verifying...' : 'Verify TOTP'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
