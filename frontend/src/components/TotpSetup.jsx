import React, { useState } from 'react';
import { QrCode, Check, Copy, ArrowRight, ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';
import { verifyTrustedContact, resendContactOtp } from '../api/mockApi';
import { useA11yPrefs } from '../context/A11yContext';

export function TotpSetup({ totpData, onDone }) {
  const { t } = useA11yPrefs();
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [contacts, setContacts] = useState(totpData?.trustedContacts || []);
  const [codes, setCodes] = useState({});
  const [verifyingEmail, setVerifyingEmail] = useState(null);
  const [resendingEmail, setResendingEmail] = useState(null);
  const [feedback, setFeedback] = useState({});

  const handleCopySecret = () => {
    if (totpData?.secretKey) {
      navigator.clipboard.writeText(totpData.secretKey);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleCodeChange = (email, val) => {
    setCodes(prev => ({ ...prev, [email]: val }));
  };

  const handleVerifyCode = async (email) => {
    const code = codes[email];
    if (!code) return;
    setVerifyingEmail(email);
    setFeedback(prev => ({ ...prev, [email]: null }));
    const username = totpData?.username || 'user@securebank.com';
    const res = await verifyTrustedContact(username, email, code);
    setVerifyingEmail(null);

    if (res.ok || res.success) {
      setContacts(prev => prev.map(c => c.email.toLowerCase() === email.toLowerCase() ? { ...c, status: 'active' } : c));
      setFeedback(prev => ({ ...prev, [email]: { type: 'success', text: 'Verified!' } }));
    } else {
      setFeedback(prev => ({ ...prev, [email]: { type: 'error', text: res.message || 'Invalid code' } }));
    }
  };

  const handleResend = async (email) => {
    setResendingEmail(email);
    const res = await resendContactOtp(email);
    setResendingEmail(null);
    setFeedback(prev => ({ ...prev, [email]: { type: 'info', text: res.message || 'Fresh code sent' } }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5 high-contrast:bg-slate-900 high-contrast:border-amber-400">
      <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shadow-inner high-contrast:bg-amber-400 high-contrast:text-slate-950">
        <QrCode className="w-6 h-6" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 high-contrast:text-white">
        {t('totpSetupTitle')}
      </h1>

      <p className="text-sm text-slate-600 font-medium leading-relaxed high-contrast:text-slate-300">
        {t('totpSetupSubtitle')}
      </p>

      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl inline-block shadow-sm high-contrast:bg-slate-800 high-contrast:border-slate-700">
        {totpData?.qrPlaceholderUrl ? (
          <img src={totpData.qrPlaceholderUrl} alt="QR Code" className="w-44 h-44 mx-auto rounded-lg" />
        ) : (
          <div className="w-44 h-44 bg-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-500">[ QR Code ]</div>
        )}
      </div>

      <div className="bg-slate-100 border border-slate-300 p-3 rounded-xl text-left space-y-1 high-contrast:bg-slate-800 high-contrast:border-slate-700">
        <span className="text-[11px] font-bold uppercase text-slate-500 high-contrast:text-amber-400">{t('manualKey')}</span>
        <div className="flex items-center justify-between font-mono font-bold text-slate-900 text-sm high-contrast:text-white">
          <span>{totpData?.secretKey || 'JBSWY3DPEHPK3PXP'}</span>
          <button type="button" onClick={handleCopySecret} className="px-3 py-1 bg-white border rounded-lg text-xs font-bold flex items-center gap-1">
            {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSecret ? t('copied') : t('copy')}</span>
          </button>
        </div>
      </div>

      <div className="text-left space-y-3 pt-2 border-t border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-purple-700" /> {t('verifyTrustedTitle')}
        </h3>

        <div className="space-y-2.5">
          {contacts.map((c, idx) => {
            const isActive = c.status === 'active' || c.status === 'verified' || c.status === 'approved';
            const fb = feedback[c.email];
            return (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2 text-xs high-contrast:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 high-contrast:text-white">{c.name || `Contact ${idx + 1}`}</span>
                    {idx === 0 && <span className="ml-1.5 text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-extrabold">{t('mandatory')}</span>}
                    <div className="text-slate-500 font-mono text-[11px]">{c.email}</div>
                  </div>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full text-[11px]">
                      <UserCheck className="w-3.5 h-3.5" /> {t('activeVerified')}
                    </span>
                  )}
                </div>

                {!isActive && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder={t('enter6DigitCode')}
                        value={codes[c.email] || ''}
                        onChange={(e) => handleCodeChange(c.email, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border rounded-lg text-center font-mono font-bold tracking-widest text-xs"
                      />
                      <button type="button" disabled={verifyingEmail === c.email} onClick={() => handleVerifyCode(c.email)} className="px-3 py-1.5 bg-purple-700 text-white font-bold rounded-lg text-xs hover:bg-purple-800">
                        {verifyingEmail === c.email ? '...' : t('verifyCode')}
                      </button>
                      <button type="button" disabled={resendingEmail === c.email} onClick={() => handleResend(c.email)} className="px-2 py-1.5 text-slate-600 border rounded-lg hover:bg-slate-100 text-xs flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> {t('resend')}
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Code sent to <span className="font-mono">{c.email}</span>
                    </div>
                    {fb && <div className={`text-[11px] font-bold ${fb.type === 'error' ? 'text-rose-600' : 'text-emerald-700'}`}>{fb.text}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button type="button" onClick={onDone} className="w-full min-h-[48px] py-3 bg-sky-600 text-white font-bold text-base rounded-xl hover:bg-sky-700 shadow flex items-center justify-center gap-2">
        <span>{t('doneGoToSignIn')}</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
