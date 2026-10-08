import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OtpInput } from './OtpInput';
import { AuthBuddyGuidance } from './AuthBuddyGuidance';
import { requestPhoneRecoveryOtp, verifyPhoneRecoveryOtp, requestEmailRecoveryOtp, verifyTotpRecovery } from '../api/mockApi';
import { useA11yPrefs } from '../context/A11yContext';
import { Smartphone, Mail, KeyRound, CheckCircle2 } from 'lucide-react';

export function SimpleRecoveryViews({ selectedMethod, username, onBack }) {
  const navigate = useNavigate();
  const { t } = useA11yPrefs();
  const [code, setCode] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('+91 ******1234');
  const [emailSent, setEmailSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const targetUser = username || 'user@securebank.com';

  useEffect(() => {
    if (selectedMethod === 'phone') {
      (async () => {
        setErrorMsg(null);
        const res = await requestPhoneRecoveryOtp(targetUser);
        if (res.data?.maskedPhone) {
          setMaskedPhone(res.data.maskedPhone);
        } else if (res.ok === false || res.data?.success === false) {
          setErrorMsg(res.data?.message || res.message || 'No verified phone number registered for this account.');
        }
      })();
    }
  }, [selectedMethod, targetUser]);

  const handleVerifyPhone = async () => {
    setIsVerifying(true);
    setErrorMsg(null);
    const res = await verifyPhoneRecoveryOtp(targetUser, code || '123456');
    setIsVerifying(false);
    if (res.ok || res.success) {
      navigate('/reset-password');
    } else {
      setErrorMsg(res.message || 'Invalid code');
    }
  };

  const handleSendEmail = async () => {
    setIsVerifying(true);
    await requestEmailRecoveryOtp(targetUser);
    setIsVerifying(false);
    setEmailSent(true);
  };

  const handleVerifyTotp = async () => {
    setIsVerifying(true);
    setErrorMsg(null);
    const res = await verifyTotpRecovery(targetUser, code || '123456');
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
        <h2 className="text-xl font-bold text-slate-900 high-contrast:text-white">{t('recoveryPhoneTitle')}</h2>
        <p className="text-xs text-slate-600 font-medium">{t('recoveryPhoneDesc')} <strong className="text-slate-900 font-mono">{maskedPhone}</strong>.</p>

        <div className="space-y-2">
          <OtpInput length={6} value={code} onChange={setCode} onComplete={handleVerifyPhone} />
          <button type="button" onClick={() => setCode('123456')} className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors">
            {t('autoFillDemoCode')}
          </button>
        </div>

        {errorMsg && <div className="text-xs font-bold text-rose-600 p-2 bg-rose-50 border border-rose-200 rounded-xl">{errorMsg}</div>}
        
        <div className="flex gap-2">
          <button type="button" onClick={onBack} className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border">Back</button>
          <button type="button" onClick={handleVerifyPhone} disabled={isVerifying} className="flex-1 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl disabled:opacity-50">
            {isVerifying ? 'Verifying...' : t('verifyCode')}
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
        <h2 className="text-xl font-bold text-slate-900 high-contrast:text-white">{t('recoveryEmailTitle')}</h2>
        <p className="text-xs text-slate-600 font-medium">{t('recoveryEmailDesc')} <strong className="text-slate-900 font-mono">{targetUser}</strong>.</p>

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
        <h2 className="text-xl font-bold text-slate-900 high-contrast:text-white">{t('recoveryTotpTitle')}</h2>
        <p className="text-xs text-slate-600 font-medium">{t('recoveryTotpDesc')}</p>

        <div className="space-y-2">
          <OtpInput length={6} value={code} onChange={setCode} onComplete={handleVerifyTotp} />
          <button type="button" onClick={() => setCode('123456')} className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
            {t('autoFillDemoCode')}
          </button>
        </div>

        {errorMsg && <div className="text-xs font-bold text-rose-600">{errorMsg}</div>}

        <div className="flex gap-2">
          <button type="button" onClick={onBack} className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border">Back</button>
          <button type="button" onClick={handleVerifyTotp} disabled={isVerifying} className="flex-1 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl disabled:opacity-50">
            {isVerifying ? 'Verifying...' : t('verifyCode')}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
