import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { changePassword, updateTrustedContacts, verifyRegistrationPhone } from '../api/mockApi';
import { ErrorBanner } from '../components/ErrorBanner';
import { OtpInput } from '../components/OtpInput';
import { 
  ShieldCheck, UserCheck, CreditCard, Lock, ArrowUpRight, 
  BarChart3, HelpCircle, KeyRound, QrCode, Users, CheckCircle2, AlertCircle, Eye, EyeOff 
} from 'lucide-react';

export function Dashboard() {
  const { user, updateUser } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin-friction" replace />;
  }

  const username = user?.username || localStorage.getItem('authbuddy_last_username') || 'user@securebank.com';
  const displayName = user?.name || username || 'Valued Customer';

  const [activeTab, setActiveTab] = useState('CONTACTS'); // 'CONTACTS' | 'PASSWORD' | 'AUTHENTICATOR'

  // Trusted Contacts State
  const [contacts, setContacts] = useState([
    { name: user?.trustedContacts?.[0]?.name || 'Arun', email: user?.trustedContacts?.[0]?.email || 'arun@example.com', mandatory: true },
    { name: user?.trustedContacts?.[1]?.name || 'Priya', email: user?.trustedContacts?.[1]?.email || 'priya@example.com', mandatory: false },
    { name: user?.trustedContacts?.[2]?.name || 'Rahul', email: user?.trustedContacts?.[2]?.email || 'rahul@example.com', mandatory: false }
  ]);
  const [contactsError, setContactsError] = useState(null);
  const [contactsSuccess, setContactsSuccess] = useState(null);
  const [isUpdatingContacts, setIsUpdatingContacts] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Authenticator State
  const [totpCode, setTotpCode] = useState('');
  const [isTotpVerified, setIsTotpVerified] = useState(true);
  const [totpError, setTotpError] = useState(null);
  const [totpSuccess, setTotpSuccess] = useState(null);
  const [isVerifyingTotp, setIsVerifyingTotp] = useState(false);

  const validateEmailFormat = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());

  // Handle Trusted Contacts Update
  const handleUpdateContactsSubmit = async (e) => {
    e.preventDefault();
    setContactsError(null);
    setContactsSuccess(null);

    const userEmailClean = username.toLowerCase().trim();

    // Check Contact 1 Mandatory
    if (!contacts[0].name || !contacts[0].name.trim()) {
      setContactsError({
        code: 'MISSING_TRUSTED_CONTACT_NAME',
        title: 'Trusted Contact 1 Name Error',
        plainExplanation: 'Trusted Contact 1 (Mandatory Primary) full name is required.',
        nextAction: 'Please enter a name for your primary contact.'
      });
      return;
    }
    if (!contacts[0].email || !contacts[0].email.trim()) {
      setContactsError({
        code: 'MISSING_TRUSTED_CONTACT_EMAIL',
        title: 'Trusted Contact 1 Email Error',
        plainExplanation: 'Trusted Contact 1 (Mandatory Primary) email address is required.',
        nextAction: 'Please enter a valid email address for your primary contact.'
      });
      return;
    }

    const seenEmails = new Set();
    for (let idx = 0; idx < contacts.length; idx++) {
      const c = contacts[idx];
      const contactLabel = idx === 0 ? 'Trusted Contact 1 (Mandatory Primary)' : `Trusted Contact ${idx + 1}`;
      if (c.email && c.email.trim()) {
        const cEmail = c.email.trim().toLowerCase();

        if (cEmail === userEmailClean) {
          setContactsError({
            code: 'SELF_TRUSTED_CONTACT_FORBIDDEN',
            title: 'Account Email Cannot Be Trusted Contact',
            plainExplanation: `${contactLabel} email ('${cEmail}') matches your own account email.`,
            nextAction: 'Please use a distinct email address for your recovery contact.'
          });
          return;
        }

        if (!validateEmailFormat(cEmail)) {
          setContactsError({
            code: 'INVALID_EMAIL_FORMAT',
            title: `${contactLabel} Email Error`,
            plainExplanation: `${contactLabel} email ('${c.email}') is not formatted correctly.`,
            nextAction: 'Please enter a valid email format like friend@example.com.'
          });
          return;
        }

        if (seenEmails.has(cEmail)) {
          setContactsError({
            code: 'DUPLICATE_TRUSTED_CONTACT',
            title: 'Duplicate Trusted Contact Email',
            plainExplanation: `${contactLabel} email ('${cEmail}') is duplicate with another contact.`,
            nextAction: 'Each pre-registered trusted contact must have a distinct email address.'
          });
          return;
        }
        seenEmails.add(cEmail);
      }
    }

    setIsUpdatingContacts(true);
    const res = await updateTrustedContacts(username, contacts);
    setIsUpdatingContacts(false);

    if (res.ok || res.success) {
      const newContacts = res.trustedContacts || contacts;
      updateUser({ trustedContacts: newContacts });
      setContactsSuccess('Trusted contacts updated successfully ✓');
    } else {
      setContactsError(res.errorCode || 'Failed to update trusted contacts.');
    }
  };

  // Handle Change Password Submit
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError({
        code: 'INVALID_CREDENTIALS',
        title: 'Current Password Required',
        plainExplanation: 'Please enter your current password.',
        nextAction: 'Type your existing password to authorize the password change.'
      });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPasswordError({
        code: 'WEAK_PASSWORD',
        title: 'Password Error',
        plainExplanation: 'New password must be at least 8 characters long.',
        nextAction: 'Choose a strong password with at least 8 characters.'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError({
        code: 'PASSWORD_MISMATCH',
        title: 'Password Confirmation Mismatch',
        plainExplanation: 'New password and confirm password do not match.',
        nextAction: 'Please ensure both password fields match exactly.'
      });
      return;
    }

    const userEmailClean = username.toLowerCase().trim();
    const pwdLower = newPassword.trim().toLowerCase();
    const emailPrefix = userEmailClean.split('@')[0];
    if (pwdLower === userEmailClean || (emailPrefix.length >= 3 && pwdLower === emailPrefix)) {
      setPasswordError({
        code: 'PASSWORD_CONTAINS_EMAIL',
        title: 'Password Contains Account Email',
        plainExplanation: 'Your new password cannot contain your account email address.',
        nextAction: 'Choose a strong password that does not include your email address.'
      });
      return;
    }

    setIsChangingPassword(true);
    const res = await changePassword(username, currentPassword, newPassword);
    setIsChangingPassword(false);

    if (res.ok || res.success) {
      setPasswordSuccess('Password updated successfully ✓');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(res.errorCode || 'Failed to update password.');
    }
  };

  // Handle Activate / Verify Authenticator Submit
  const handleVerifyTotpSubmit = async (e) => {
    e.preventDefault();
    setTotpError(null);
    setTotpSuccess(null);

    if (!totpCode || totpCode.length < 6) {
      setTotpError('Please enter a 6-digit authenticator code.');
      return;
    }

    setIsVerifyingTotp(true);
    // Simulate verification
    await new Promise(r => setTimeout(r, 400));
    setIsVerifyingTotp(false);

    setIsTotpVerified(true);
    setTotpSuccess('Authenticator successfully activated and verified ✓');
  };

  return (
    <main id="main-content" className="min-h-[85vh] py-8 px-4 max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-700 to-sky-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 high-contrast:from-slate-900 high-contrast:to-slate-900 high-contrast:border-2 high-contrast:border-amber-400">
        <div>
          <div className="inline-flex items-center gap-2 bg-sky-600/60 border border-sky-400/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>2-Factor Authentication Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {displayName}!
          </h1>
          <p className="text-sky-100 text-sm mt-1 max-w-lg">
            Manage your trusted contacts, update your password, or configure your 2FA authenticator directly from your dashboard.
          </p>
        </div>

        {user?.role === 'admin' && (
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin-friction"
              className="min-h-[44px] px-4 py-2.5 bg-amber-400 text-slate-950 font-bold text-sm rounded-xl hover:bg-amber-300 shadow flex items-center gap-1.5 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Admin Friction Metrics</span>
            </Link>
          </div>
        )}
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2 high-contrast:bg-slate-900 high-contrast:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 high-contrast:text-amber-400">Main Savings</span>
            <CreditCard className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 high-contrast:text-white">$24,850.00</div>
          <p className="text-xs text-slate-500">Account ending in •••• 4892</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2 high-contrast:bg-slate-900 high-contrast:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 high-contrast:text-amber-400">Security Score</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">100% Secure</div>
          <p className="text-xs text-slate-500">2FA enabled & trusted recovery ready</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2 high-contrast:bg-slate-900 high-contrast:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 high-contrast:text-amber-400">Trusted Contacts</span>
            <UserCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 high-contrast:text-white">{contacts.filter(c => c.name && c.email).length} Active</div>
          <p className="text-xs text-slate-500">Recovery contacts configured</p>
        </div>
      </div>

      {/* Account & Security Settings Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 high-contrast:bg-slate-900 high-contrast:border-amber-400">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 high-contrast:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-sky-600" />
              <span>Account & Security Settings</span>
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Update your security preferences, recovery contacts, and authentication credentials.
            </p>
          </div>

          {/* Settings Tabs */}
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl high-contrast:bg-slate-800">
            <button
              onClick={() => setActiveTab('CONTACTS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'CONTACTS'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-200 high-contrast:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Trusted Contacts</span>
            </button>

            <button
              onClick={() => setActiveTab('PASSWORD')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'PASSWORD'
                  ? 'bg-sky-700 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-200 high-contrast:text-slate-200'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Change Password</span>
            </button>

            <button
              onClick={() => setActiveTab('AUTHENTICATOR')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'AUTHENTICATOR'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-200 high-contrast:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>2FA Authenticator</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Trusted Contacts */}
        {activeTab === 'CONTACTS' && (
          <form onSubmit={handleUpdateContactsSubmit} className="space-y-4 max-w-2xl">
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl space-y-1">
              <h3 className="font-bold text-purple-900 text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-700" />
                <span>Manage Pre-Registered Trusted Contacts</span>
              </h3>
              <p className="text-xs text-slate-600">
                Contact 1 is mandatory for account recovery. Contacts 2 & 3 are optional.
              </p>
            </div>

            <div className="space-y-3">
              {contacts.map((c, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 high-contrast:bg-slate-800">
                  <span className="font-bold text-xs text-slate-800 flex items-center justify-between high-contrast:text-amber-400">
                    <span>{idx === 0 ? <>Contact 1 (Mandatory Primary) <span className="text-rose-500 font-bold">*</span></> : `Contact ${idx + 1} (Optional)`}</span>
                    {idx === 0 && <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">Required *</span>}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <input
                      type="text"
                      placeholder={idx === 0 ? "Full Name (Required *)" : `Contact ${idx + 1} Name`}
                      value={c.name}
                      onChange={(e) => {
                        const updated = [...contacts];
                        updated[idx].name = e.target.value;
                        setContacts(updated);
                      }}
                      className="px-3 py-2 rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-purple-400"
                    />
                    <input
                      type="email"
                      placeholder={idx === 0 ? "Email Address (Required *)" : `contact${idx + 1}@example.com`}
                      value={c.email}
                      onChange={(e) => {
                        const updated = [...contacts];
                        updated[idx].email = e.target.value;
                        setContacts(updated);
                      }}
                      className="px-3 py-2 rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isUpdatingContacts}
              className="py-3 px-6 bg-purple-700 text-white font-bold text-xs rounded-xl hover:bg-purple-800 shadow transition-colors disabled:opacity-50"
            >
              {isUpdatingContacts ? 'Updating Contacts...' : 'Save Trusted Contacts'}
            </button>

            {contactsError && (
              <ErrorBanner errorCode={contactsError} onClose={() => setContactsError(null)} />
            )}

            {contactsSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{contactsSuccess}</span>
              </div>
            )}
          </form>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === 'PASSWORD' && (
          <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-md">
            <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl space-y-1">
              <h3 className="font-bold text-sky-900 text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-sky-700" />
                <span>Update Account Password</span>
              </h3>
              <p className="text-xs text-slate-600">
                Choose a strong password at least 8 characters long that does not contain your email.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Current Password <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                New Password <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters long"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 font-medium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Confirm New Password <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="py-3 px-6 bg-sky-600 text-white font-bold text-xs rounded-xl hover:bg-sky-700 shadow transition-colors disabled:opacity-50"
            >
              {isChangingPassword ? 'Updating Password...' : 'Update Password'}
            </button>

            {passwordError && (
              <ErrorBanner errorCode={passwordError} onClose={() => setPasswordError(null)} />
            )}

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}
          </form>
        )}

        {/* Tab 3: Activate 2FA Authenticator */}
        {activeTab === 'AUTHENTICATOR' && (
          <form onSubmit={handleVerifyTotpSubmit} className="space-y-4 max-w-md">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1">
              <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Activate & Verify 2FA Authenticator App</span>
              </h3>
              <p className="text-xs text-slate-600">
                Scan the QR code in Google Authenticator or Authy to bind your account.
              </p>
            </div>

            <div className="flex flex-col items-center p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/SecureBank:${encodeURIComponent(username)}?secret=JBSWY3DPEHPK3PXP&issuer=SecureBank`}
                alt="Authenticator QR Code"
                className="w-36 h-36 border border-slate-300 rounded-xl p-1 bg-white"
              />
              <div className="text-center">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Secret Key</p>
                <code className="text-xs font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-900">
                  JBSWY3DPEHPK3PXP
                </code>
              </div>
            </div>

            <div className="space-y-2 text-center">
              <label className="block text-xs font-bold text-slate-800">
                Enter 6-Digit Code from Authenticator App <span className="text-rose-500 font-bold">*</span>
              </label>
              <OtpInput length={6} value={totpCode} onChange={setTotpCode} onComplete={(val) => setTotpCode(val)} />
            </div>

            <button
              type="submit"
              disabled={isVerifyingTotp || totpCode.length < 6}
              className="w-full py-3 px-6 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow transition-colors disabled:opacity-50"
            >
              {isVerifyingTotp ? 'Verifying...' : 'Activate & Verify Authenticator'}
            </button>

            {totpError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{totpError}</span>
              </div>
            )}

            {totpSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{totpSuccess}</span>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Quick Action Tools */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 space-y-4 high-contrast:bg-slate-900 high-contrast:border-amber-400">
        <h2 className="text-lg font-bold text-slate-900 high-contrast:text-white">
          Explore AuthBuddy Security Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/recovery-start"
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-500 shadow-sm flex items-start gap-3 transition-colors group high-contrast:bg-slate-800 high-contrast:border-slate-700"
          >
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 high-contrast:text-white flex items-center gap-1">
                <span>Trusted Contact Recovery</span>
                <ArrowUpRight className="w-4 h-4 opacity-50" />
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed high-contrast:text-slate-300">
                Simulate recovering your account using 2-of-3 approval rules when locked out.
              </p>
            </div>
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/admin-friction"
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-500 shadow-sm flex items-start gap-3 transition-colors group high-contrast:bg-slate-800 high-contrast:border-slate-700"
            >
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 high-contrast:text-white flex items-center gap-1">
                  <span>Admin Friction Dashboard</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed high-contrast:text-slate-300">
                  View real-time telemetry, failure rate per step, and struggle scores.
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
