/**
 * API LAYER FOR AUTHBUDDY
 * Configured to seamlessly switch between local mock data and Python FastAPI backend (http://localhost:5000).
 */

const USE_REAL_BACKEND = true; // Connected directly to FastAPI backend on port 5000 (with automatic mock fallback)
const BACKEND_URL = 'http://localhost:5000';

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const mockUsers = new Map([
  ['user@securebank.com', { username: 'user@securebank.com', password: 'Password123!', name: 'Alex Johnson' }],
  ['demo', { username: 'demo', password: 'Password123!', name: 'Demo User' }]
]);

const failedAttempts = new Map();
const lastAttemptTimestamp = new Map();
const activeOtps = new Map();
const recoverySessions = new Map();

let loggedEvents = [
  { id: 1, type: 'FORGOT_PASSWORD_INITIATED', step: 'AccountRecovery', timestamp: new Date(Date.now() - 3600000).toISOString(), metadata: { methodChosen: 'phone' } },
  { id: 2, type: 'FAILED_LOGIN', step: 'Login', timestamp: new Date(Date.now() - 2700000).toISOString(), metadata: { reason: 'Wrong password' } },
  { id: 3, type: 'AUTHBUDDY_ACCEPTED', step: 'Login', timestamp: new Date(Date.now() - 1800000).toISOString(), metadata: { mode: 'guided' } },
  { id: 4, type: 'SECURE_RECOVERY_STARTED', step: 'Recovery', timestamp: new Date(Date.now() - 900000).toISOString(), metadata: { contactsCount: 3 } },
];

async function apiFetch(endpoint, options = {}) {
  try {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    let savedUserStr = null;
    try {
      savedUserStr = sessionStorage.getItem('authbuddy_user') || localStorage.getItem('authbuddy_user');
    } catch (e) {}
    if (savedUserStr) {
      const parsed = JSON.parse(savedUserStr);
      if (parsed?.token) {
        headers['Authorization'] = `Bearer ${parsed.token}`;
      }
    }
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      headers,
      ...options
    });
    return await res.json();
  } catch (e) {
    console.warn(`Backend fetch failed for ${endpoint}, falling back to mock mode`, e);
    return null;
  }
}

export async function sendRegistrationPhoneOtp(phone) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/auth/send-phone-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
    if (res) return res;
  }
  await delay(300);
  return { ok: true, success: true, message: `6-digit verification code sent to ${phone}`, demoCodeHint: '123456' };
}

export async function verifyRegistrationPhone(username, phone, otp) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/auth/verify-phone-registration', {
      method: 'POST',
      body: JSON.stringify({ username, phone, otp })
    });
    if (res) return res;
  }
  await delay(350);
  if (otp === '123456' || otp.length === 6) {
    const usr = mockUsers.get(username);
    if (usr) {
      usr.phoneNumber = phone;
      usr.phoneVerified = true;
    }
    return { ok: true, success: true, message: 'Phone number verified ✓', phoneVerified: true };
  }
  return { ok: false, success: false, errorCode: 'OTP_INVALID', message: 'The phone verification code is incorrect.' };
}

export async function register(username, password, phone = '', accessibilityProfile = {}, trustedContacts = []) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, phone, accessibilityProfile, trustedContacts })
    });
    if (res) return res;
  }

  await delay(400);

  if (!username || !password) {
    return { ok: false, errorCode: 'INVALID_CREDENTIALS', data: null };
  }

  if (password.length < 8) {
    return { ok: false, errorCode: 'WEAK_PASSWORD', data: null };
  }

  mockUsers.set(username, { username, password, phoneNumber: phone, phoneVerified: false, accessibilityProfile, trustedContacts });

  return {
    ok: true,
    errorCode: null,
    data: {
      username,
      phoneNumber: phone,
      phoneVerified: false,
      trustedContacts,
      qrPlaceholderUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/SecureBank:${encodeURIComponent(username)}?secret=JBSWY3DPEHPK3PXP&issuer=SecureBank`,
      secretKey: 'JBSWY3DPEHPK3PXP',
      message: 'Account created successfully'
    }
  };
}

export async function verifyTrustedContact(username, contactEmail, code = null) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/auth/verify-trusted-contact', {
      method: 'POST',
      body: JSON.stringify({ username, contactEmail, code })
    });
    if (res) return res;
  }

  await delay(300);
  const user = mockUsers.get(username);
  if (user && user.trustedContacts) {
    user.trustedContacts.forEach(c => {
      if (c.email.toLowerCase() === contactEmail.toLowerCase()) {
        c.status = 'active';
      }
    });
  }
  return { ok: true, success: true, message: `Trusted contact ${contactEmail} verified` };
}

export async function resendContactOtp(email) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/auth/resend-contact-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    if (res) return res;
  }

  await delay(300);
  return { ok: true, success: true, message: `Fresh code sent to ${email}` };
}

export async function acceptTrustedContactStart(contactEmail, invitationCode) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/auth/accept-trusted-contact/start', {
      method: 'POST',
      body: JSON.stringify({ contactEmail, invitationCode })
    });
    if (res) return res;
  }

  await delay(300);
  return {
    ok: true,
    success: true,
    message: `Invitation code validated! A 6-digit verification code was sent to ${contactEmail}.`,
    data: { contactEmail, otpRequired: true }
  };
}

export async function acceptTrustedContactConfirm(contactEmail, invitationCode, otp) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/auth/accept-trusted-contact/confirm', {
      method: 'POST',
      body: JSON.stringify({ contactEmail, invitationCode, otp })
    });
    if (res) return res;
  }

  await delay(300);
  return {
    ok: true,
    success: true,
    message: 'Success! You are now an active pre-registered trusted contact.'
  };
}

export async function login(username, password) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res) return res;
  }

  await delay(400);

  const now = Date.now();
  const lastTime = lastAttemptTimestamp.get(username) || 0;
  if (now - lastTime < 300) {
    return { ok: false, errorCode: 'RATE_LIMITED', data: null };
  }
  lastAttemptTimestamp.set(username, now);

  const attempts = failedAttempts.get(username) || 0;
  if (attempts >= 5) {
    return { ok: false, errorCode: 'ACCOUNT_LOCKED', data: null };
  }

  const existingUser = mockUsers.get(username);

  if (!existingUser || existingUser.password !== password) {
    const newCount = attempts + 1;
    failedAttempts.set(username, newCount);

    if (newCount >= 5) {
      logEvent('ACCOUNT_LOCKED', { username, attempts: newCount });
      return { ok: false, errorCode: 'ACCOUNT_LOCKED', data: null };
    }

    logEvent('FAILED_LOGIN', { username });
    return { ok: false, errorCode: 'INVALID_CREDENTIALS', data: null };
  }

  failedAttempts.delete(username);

  const code = '123456';
  const expiresAt = Date.now() + 30 * 1000;
  activeOtps.set(username, { code, expiresAt });

  return {
    ok: true,
    errorCode: null,
    data: {
      username,
      otpRequired: true,
      expiresInSeconds: 30,
      demoCodeHint: '123456'
    }
  };
}

export async function verifyOtp(username, code) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ username, code })
    });
    if (res) return res;
  }

  await delay(350);

  const otpData = activeOtps.get(username);

  if (!otpData) {
    return { ok: false, errorCode: 'OTP_EXPIRED', data: null };
  }

  if (Date.now() > otpData.expiresAt) {
    logEvent('OTP_EXPIRED', { username });
    return { ok: false, errorCode: 'OTP_EXPIRED', data: null };
  }

  if (otpData.code !== code) {
    logEvent('FAILED_OTP', { username, codeEntered: code });
    return { ok: false, errorCode: 'OTP_INVALID', data: null };
  }

  activeOtps.delete(username);
  logEvent('SUCCESSFUL_LOGIN', { username });

  return {
    ok: true,
    errorCode: null,
    data: {
      token: 'mock-jwt-token-xyz-123',
      user: {
        username,
        name: username.split('@')[0] || 'User',
        role: 'customer'
      }
    }
  };
}

export async function resendOtp(username) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
    if (res) return res;
  }

  await delay(300);

  const code = '123456';
  const expiresAt = Date.now() + 30 * 1000;
  activeOtps.set(username, { code, expiresAt });

  logEvent('OTP_RESENT', { username });

  return {
    ok: true,
    errorCode: null,
    data: {
      message: 'New code sent to your registered device',
      expiresInSeconds: 30,
      demoCodeHint: '123456'
    }
  };
}

export async function startRecovery(username, contacts) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/recovery/start', {
      method: 'POST',
      body: JSON.stringify({ username, contacts })
    });
    if (res) return res;
  }

  await delay(450);

  const recoveryId = 'rec_' + Math.random().toString(36).substr(2, 9);
  const newSession = {
    id: recoveryId,
    username: username || 'user@securebank.com',
    contacts,
    approvals: 0,
    requiredApprovals: 2,
    createdAt: Date.now(),
    delaySeconds: 60,
    completed: false
  };

  recoverySessions.set(recoveryId, newSession);
  logEvent('RECOVERY_STARTED', { recoveryId, username, contactsCount: contacts.length });

  return {
    ok: true,
    errorCode: null,
    data: {
      recoveryId,
      status: newSession
    }
  };
}

export async function getRecoveryStatus(recoveryId) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch(`/api/v1/recovery/status/${recoveryId}`, { method: 'GET' });
    if (res) return res;
  }

  await delay(150);

  const session = recoverySessions.get(recoveryId);
  if (!session) {
    return {
      ok: true,
      errorCode: null,
      data: {
        id: recoveryId || 'rec_demo',
        username: 'user@securebank.com',
        contacts: [
          { name: 'Arun', email: 'arun@example.com', status: 'approved' },
          { name: 'Priya', email: 'priya@example.com', status: 'pending' },
          { name: 'Rahul', email: 'rahul@example.com', status: 'pending' }
        ],
        approvals: 1,
        requiredApprovals: 2,
        createdAt: Date.now() - 20000,
        delaySeconds: 60,
        completed: false
      }
    };
  }

  return {
    ok: true,
    errorCode: null,
    data: session
  };
}

export async function approveRecovery(recoveryId, contactIndex, decision = 'approved') {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/recovery/approve', {
      method: 'POST',
      body: JSON.stringify({ recoveryId, contactIndex, decision })
    });
    if (res) return res;
  }

  await delay(350);

  const session = recoverySessions.get(recoveryId);
  if (session && session.contacts[contactIndex]) {
    session.contacts[contactIndex].status = decision;
    const approvedCount = session.contacts.filter(c => c.status === 'approved').length;
    session.approvals = approvedCount;
    if (approvedCount >= session.requiredApprovals) {
      session.completed = true;
    }
    recoverySessions.set(recoveryId, session);
  }

  logEvent('RECOVERY_CONTACT_ACTION', { recoveryId, contactIndex, decision });

  return {
    ok: true,
    errorCode: null,
    data: {
      success: true,
      decision,
      message: `You have ${decision} this recovery request.`
    }
  };
}

export async function requestPhoneRecoveryOtp(username = 'user@securebank.com', phone = '+91 ******1234') {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/recovery/request-phone-otp', {
      method: 'POST',
      body: JSON.stringify({ username, phone })
    });
    if (res) return res;
  }
  await delay(300);
  return { ok: true, success: true, message: `OTP sent to ${phone}`, data: { demoCodeHint: '123456' } };
}

export async function verifyPhoneRecoveryOtp(username = 'user@securebank.com', code) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/recovery/verify-phone-otp', {
      method: 'POST',
      body: JSON.stringify({ username, code })
    });
    if (res) return res;
  }
  await delay(300);
  if (code === '123456' || code.length === 6) {
    return { ok: true, success: true, message: 'Phone verification successful' };
  }
  return { ok: false, errorCode: 'OTP_INVALID', message: 'Invalid phone OTP' };
}

export async function requestEmailRecoveryOtp(email) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/recovery/request-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    if (res) return res;
  }
  await delay(300);
  return { ok: true, success: true, message: `Recovery link sent to ${email}`, data: { demoCodeHint: '123456' } };
}

export async function verifyEmailRecoveryOtp(email, code) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/recovery/verify-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
    if (res) return res;
  }
  await delay(300);
  if (code === '123456' || code.length === 6) {
    return { ok: true, success: true, message: 'Email recovery verified' };
  }
  return { ok: false, errorCode: 'OTP_INVALID', message: 'Invalid email recovery code' };
}

export async function verifyTotpRecovery(username = 'user@securebank.com', code) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/recovery/verify-totp', {
      method: 'POST',
      body: JSON.stringify({ username, code })
    });
    if (res) return res;
  }
  await delay(300);
  if (code === '123456' || code.length === 6) {
    return { ok: true, success: true, message: 'TOTP verified' };
  }
  return { ok: false, errorCode: 'OTP_INVALID', message: 'Invalid TOTP code' };
}

export async function logEvent(eventType, metadata = {}) {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/telemetry/events', {
      method: 'POST',
      body: JSON.stringify({ type: eventType, step: metadata.step || 'General', metadata })
    });
    if (res) return res;
  }

  const newEvent = {
    id: loggedEvents.length + 1,
    type: eventType,
    step: metadata.step || 'General',
    timestamp: new Date().toISOString(),
    metadata
  };
  loggedEvents.unshift(newEvent);
  return { ok: true, errorCode: null, data: { logged: true } };
}

export async function getFrictionStats() {
  if (USE_REAL_BACKEND) {
    const res = await apiFetch('/api/v1/admin/friction-stats', { method: 'GET' });
    if (res) return res;
  }

  await delay(250);

  return {
    ok: true,
    errorCode: null,
    data: {
      forgotPasswordAttempts: 54,
      usersSuccessfullyRecovered: 48,
      securityBypassedCount: 0,
      recoveryMethodBreakdown: {
        phoneOtp: 22,
        emailLink: 14,
        authenticator: 8,
        trustedDevice: 4,
        contactsRecovery: 6
      },
      authBuddyActivations: 42,
      usersAcceptedAssistance: 34,
      usersDeclinedAssistance: 8,
      failuresPerStep: [
        { step: 'Step 1: Password', failures: 42, color: '#f59e0b' },
        { step: 'Step 2: OTP Entry', failures: 68, color: '#ef4444' },
        { step: 'Step 3: Account Recovery', failures: 15, color: '#3b82f6' }
      ],
      lockoutsOverTime: [
        { time: '08:00', lockouts: 2 },
        { time: '10:00', lockouts: 5 },
        { time: '12:00', lockouts: 11 },
        { time: '14:00', lockouts: 8 },
        { time: '16:00', lockouts: 14 },
        { time: '18:00', lockouts: 6 }
      ],
      recoveryStats: {
        totalRequests: 24,
        successful: 19,
        timedOut: 3,
        denied: 2
      },
      avgStruggleScore: 3.8,
      frictionVsRisk: [
        { step: 'Simple Recovery (Phone/Email)', friction: 'Low', risk: 'Medium', score: '3.2/10', recommendation: 'Masked contact info + OTP verification' },
        { step: 'Authenticator App (TOTP)', friction: 'Medium', risk: 'High', score: '5.1/10', recommendation: '6-digit auto-advance' },
        { step: 'Secure Account Recovery', friction: 'Very High', risk: 'Critical', score: '8.9/10', recommendation: '2-of-3 trusted contacts + 60s delay' },
      ],
      recentTelemetryEvents: loggedEvents.slice(0, 10)
    }
  };
}
