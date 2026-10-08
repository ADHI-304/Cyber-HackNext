import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, sendRegistrationPhoneOtp } from '../api/mockApi';
import { useA11yPrefs } from '../context/A11yContext';
import { AuthForm } from '../components/AuthForm';
import { ErrorBanner } from '../components/ErrorBanner';
import { HelpPanel } from '../components/HelpPanel';
import { PasswordMeter } from '../components/PasswordMeter';
import { A11yProfileSelector } from '../components/A11yProfileSelector';
import { TotpSetup } from '../components/TotpSetup';
import { RegisterPhoneStep } from '../components/RegisterPhoneStep';
import { RegisterTrustedContacts } from '../components/RegisterTrustedContacts';
import { useStruggleScore } from '../hooks/useStruggleScore';
import { UserPlus, Eye, EyeOff, Phone } from 'lucide-react';

export function Register() {
  const navigate = useNavigate();
  const { prefs, t } = useA11yPrefs();
  const { score, addStrugglePoints, resetScore, activeHelpMode, setActiveHelpMode } = useStruggleScore('Register');

  const [step, setStep] = useState('FORM');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('+91 9876543210');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [trustedContacts, setTrustedContacts] = useState([
    { name: '', email: '', mandatory: true, status: 'pending' },
    { name: '', email: '', mandatory: false, status: 'pending' },
    { name: '', email: '', mandatory: false, status: 'pending' }
  ]);
  const [totpData, setTotpData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState(null);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorCode(null);

    if (!username || !password || !phone) {
      addStrugglePoints(1, 'empty_fields');
      setErrorCode('WEAK_PASSWORD');
      return;
    }

    setIsLoading(true);
    const res = await register(username, password, phone, prefs, trustedContacts);
    setIsLoading(false);

    if (!res.ok) {
      addStrugglePoints(2, 'failed_registration');
      setErrorCode(res.errorCode);
    } else {
      localStorage.setItem('authbuddy_last_username', username);
      setTotpData(res.data);
      await sendRegistrationPhoneOtp(phone);
      setStep('PHONE_VERIFY');
    }
  };

  return (
    <main id="main-content" className="min-h-[85vh] py-8 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <ErrorBanner errorCode={errorCode} onClose={() => setErrorCode(null)} onPrimaryAction={() => setErrorCode(null)} primaryActionLabel="Review Details" />

        {step === 'FORM' && (
          <AuthForm title={t('regTitle')} subtitle={t('regSubtitle')} onSubmit={handleRegisterSubmit} submitText={t('continueTo2FA')} isLoading={isLoading} icon={UserPlus}>
            <div>
              <label htmlFor="reg-username" className="block text-sm font-bold text-slate-800 mb-1.5 high-contrast:text-slate-100">{t('usernameLabel')}</label>
              <input id="reg-username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('usernamePlaceholder')} className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-200 focus:outline-none transition-colors high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400" />
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-sm font-bold text-slate-800 mb-1.5 high-contrast:text-slate-100 flex items-center gap-1">
                <Phone className="w-4 h-4 text-sky-600" /> {t('phoneLabel')}
              </label>
              <input id="reg-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('phonePlaceholder')} className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-200 focus:outline-none transition-colors high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400 font-mono" />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-bold text-slate-800 mb-1.5 high-contrast:text-slate-100">{t('passwordLabel')}</label>
              <div className="relative">
                <input id="reg-password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('passwordPlaceholder')} className="w-full min-h-[44px] px-4 py-2.5 pr-12 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-200 focus:outline-none transition-colors high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] p-2 text-slate-500 flex items-center justify-center rounded-lg" aria-label={showPassword ? t('hidePassword') : t('showPassword')}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <PasswordMeter password={password} />
            </div>

            <A11yProfileSelector />
            <RegisterTrustedContacts contacts={trustedContacts} setContacts={setTrustedContacts} />

            <p className="text-xs text-center text-slate-600 mt-3 high-contrast:text-slate-300">
              {t('alreadyHaveAccount')}{' '}
              <Link to="/login" className="font-bold text-sky-700 underline hover:text-sky-900 high-contrast:text-amber-400">{t('signInHere')}</Link>
            </p>
          </AuthForm>
        )}

        {step === 'PHONE_VERIFY' && (
          <RegisterPhoneStep username={username} phone={phone} onVerified={() => setStep('TOTP')} onBack={() => setStep('FORM')} />
        )}

        {step === 'TOTP' && (
          <TotpSetup totpData={totpData} onDone={() => navigate('/login')} />
        )}
      </div>

      <HelpPanel score={score} onResetScore={resetScore} stepName="Register" activeHelpMode={activeHelpMode} setActiveHelpMode={setActiveHelpMode} onAddPoints={addStrugglePoints} />
    </main>
  );
}
