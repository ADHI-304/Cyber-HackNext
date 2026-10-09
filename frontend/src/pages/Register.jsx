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
  const [phone, setPhone] = useState('');
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

  const validateEmailFormat = (emailStr) => {
    if (!emailStr) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorCode(null);

    const userEmailClean = username.trim().toLowerCase();

    if (!username || !username.trim()) {
      addStrugglePoints(1, 'empty_fields');
      setErrorCode({
        code: 'INVALID_EMAIL_FORMAT',
        title: 'Missing Account Email Address',
        plainExplanation: 'Account email address is required to register.',
        nextAction: 'Please enter your email address.'
      });
      return;
    }

    if (username.includes('@') && !validateEmailFormat(userEmailClean)) {
      setErrorCode({
        code: 'INVALID_EMAIL_FORMAT',
        title: 'Invalid Account Email Address',
        plainExplanation: `The account email address '${username}' is not formatted correctly.`,
        nextAction: 'Please enter a valid email format like user@domain.com for your account.'
      });
      return;
    }

    if (!phone || !phone.trim()) {
      addStrugglePoints(1, 'empty_fields');
      setErrorCode({
        code: 'INVALID_PHONE_FORMAT',
        title: 'Mobile Phone Number Error',
        plainExplanation: 'Mobile phone number is required to register.',
        nextAction: 'Please enter a valid 10-digit mobile phone number with country code (e.g. +91 9876543210).'
      });
      return;
    }

    const cleanPhoneDigits = phone.replace(/[^0-9]/g, '');
    if (cleanPhoneDigits.length < 10) {
      setErrorCode({
        code: 'INVALID_PHONE_FORMAT',
        title: 'Mobile Phone Number Error',
        plainExplanation: `The mobile phone number entered ('${phone}') must contain at least 10 digits.`,
        nextAction: 'Please enter a valid 10-digit mobile phone number with country code (e.g. +91 9876543210).'
      });
      return;
    }

    if (!password) {
      addStrugglePoints(1, 'empty_fields');
      setErrorCode({
        code: 'WEAK_PASSWORD',
        title: 'Password Error',
        plainExplanation: 'Password is required to register.',
        nextAction: 'Please enter a password that is at least 8 characters long.'
      });
      return;
    }

    if (password.length < 8) {
      setErrorCode('WEAK_PASSWORD');
      return;
    }

    const pwdLower = password.trim().toLowerCase();
    const emailPrefix = userEmailClean.split('@')[0];
    if (pwdLower === userEmailClean || (emailPrefix.length >= 3 && pwdLower === emailPrefix)) {
      setErrorCode({
        code: 'PASSWORD_CONTAINS_EMAIL',
        title: 'Password Contains Account Email',
        plainExplanation: `Your password cannot match or contain your account email address '${userEmailClean}'.`,
        nextAction: 'Choose a strong password that does not contain your email address.'
      });
      return;
    }

    const seenContacts = new Map();
    for (let idx = 0; idx < trustedContacts.length; idx++) {
      const c = trustedContacts[idx];
      const contactLabel = idx === 0 ? 'Trusted Contact 1 (Mandatory Primary)' : `Trusted Contact ${idx + 1}`;
      const hasName = Boolean(c.name && c.name.trim());
      const hasEmail = Boolean(c.email && c.email.trim());

      // Contact 1 is strictly mandatory
      if (idx === 0) {
        if (!hasName) {
          addStrugglePoints(1, 'empty_fields');
          setErrorCode({
            code: 'MISSING_TRUSTED_CONTACT_NAME',
            title: 'Trusted Contact 1 Name Error',
            plainExplanation: 'Trusted Contact 1 (Mandatory Primary) full name is required to proceed.',
            nextAction: 'Please enter the full name for your primary trusted contact.'
          });
          return;
        }
        if (!hasEmail) {
          addStrugglePoints(1, 'empty_fields');
          setErrorCode({
            code: 'MISSING_TRUSTED_CONTACT_EMAIL',
            title: 'Trusted Contact 1 Email Error',
            plainExplanation: 'Trusted Contact 1 (Mandatory Primary) email address is required to proceed.',
            nextAction: 'Please enter a valid email address for your primary trusted contact.'
          });
          return;
        }
      } else {
        // For optional Contacts 2 & 3: if one field is filled, both must be filled
        if (hasName && !hasEmail) {
          addStrugglePoints(1, 'empty_fields');
          setErrorCode({
            code: 'MISSING_TRUSTED_CONTACT_EMAIL',
            title: `${contactLabel} Email Error`,
            plainExplanation: `${contactLabel} email is required when a contact name is provided.`,
            nextAction: `Please enter an email address for ${contactLabel} or clear the contact name.`
          });
          return;
        }
        if (hasEmail && !hasName) {
          addStrugglePoints(1, 'empty_fields');
          setErrorCode({
            code: 'MISSING_TRUSTED_CONTACT_NAME',
            title: `${contactLabel} Name Error`,
            plainExplanation: `${contactLabel} name is required when a contact email is provided.`,
            nextAction: `Please enter a name for ${contactLabel}.`
          });
          return;
        }
      }

      if (hasEmail) {
        const cEmail = c.email.trim().toLowerCase();

        if (cEmail === userEmailClean) {
          setErrorCode({
            code: 'SELF_TRUSTED_CONTACT_FORBIDDEN',
            title: 'Account Email Cannot Be Trusted Contact',
            plainExplanation: `${contactLabel} email ('${cEmail}') matches your own account email.`,
            nextAction: 'You cannot use your own account email as a recovery contact. Please enter a distinct friend or family member email.'
          });
          return;
        }

        if (!validateEmailFormat(cEmail)) {
          setErrorCode({
            code: 'INVALID_EMAIL_FORMAT',
            title: `${contactLabel} Email Error`,
            plainExplanation: `${contactLabel} email ('${c.email}') is not formatted correctly.`,
            nextAction: 'Please enter a valid email format like friend@example.com.'
          });
          return;
        }

        if (seenContacts.has(cEmail)) {
          const firstIdx = seenContacts.get(cEmail);
          setErrorCode({
            code: 'DUPLICATE_TRUSTED_CONTACT',
            title: 'Duplicate Trusted Contact Email',
            plainExplanation: `${contactLabel} email ('${cEmail}') is duplicate with Trusted Contact ${firstIdx + 1}.`,
            nextAction: 'Each pre-registered trusted contact must have a distinct email address.'
          });
          return;
        }
        seenContacts.set(cEmail, idx);
      }
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
        {step === 'FORM' && (
          <AuthForm 
            title={t('regTitle')} 
            subtitle={t('regSubtitle')} 
            onSubmit={handleRegisterSubmit} 
            submitText={t('continueTo2FA')} 
            isLoading={isLoading} 
            icon={UserPlus}
            errorBanner={
              <ErrorBanner 
                errorCode={errorCode} 
                onClose={() => setErrorCode(null)} 
                onPrimaryAction={() => setErrorCode(null)} 
                primaryActionLabel="Review Details" 
              />
            }
          >
            <div>
              <label htmlFor="reg-username" className="block text-sm font-bold text-slate-800 mb-1.5 high-contrast:text-slate-100">
                {t('usernameLabel')} <span className="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span>
              </label>
              <input id="reg-username" type="email" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('usernamePlaceholder')} className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-200 focus:outline-none transition-colors high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400" />
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-sm font-bold text-slate-800 mb-1.5 high-contrast:text-slate-100 flex items-center gap-1">
                <Phone className="w-4 h-4 text-sky-600" /> {t('phoneLabel')} <span className="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span>
              </label>
              <input id="reg-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('phonePlaceholder')} className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-200 focus:outline-none transition-colors high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400 font-mono" />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-bold text-slate-800 mb-1.5 high-contrast:text-slate-100">
                {t('passwordLabel')} <span className="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span>
              </label>
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
