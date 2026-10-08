/**
 * MOCK API LAYER FOR AUTHBUDDY
 * -------------------------------------------------------------
 * Endpoint Mapping Reference for Future Production Integration:
 * 
 * Function              -> Real Backend Endpoint           -> HTTP Method
 * -----------------------------------------------------------------------
 * register()            -> /api/v1/auth/register           -> POST
 * login()               -> /api/v1/auth/login              -> POST
 * verifyOtp()           -> /api/v1/auth/verify-otp         -> POST
 * resendOtp()           -> /api/v1/auth/resend-otp         -> POST
 * startRecovery()       -> /api/v1/recovery/start          -> POST
 * getRecoveryStatus()   -> /api/v1/recovery/status/:id     -> GET
 * approveRecovery()     -> /api/v1/recovery/approve        -> POST
 * getFrictionStats()    -> /api/v1/admin/friction-stats    -> GET
 * logEvent()            -> /api/v1/telemetry/events        -> POST
 * -------------------------------------------------------------
 */

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

export async function register(username, password, accessibilityProfile = {}) {
  await delay(400);

  if (!username || !password) {
    return { ok: false, errorCode: 'INVALID_CREDENTIALS', data: null };
  }

  if (password.length < 8) {
    return { ok: false, errorCode: 'WEAK_PASSWORD', data: null };
  }

  mockUsers.set(username, { username, password, accessibilityProfile });

  return {
    ok: true,
    errorCode: null,
    data: {
      username,
      qrPlaceholderUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/SecureBank:${encodeURIComponent(username)}?secret=JBSWY3DPEHPK3PXP&issuer=SecureBank`,
      secretKey: 'JBSWY3DPEHPK3PXP',
      message: 'Account created successfully'
    }
  };
}

export async function login(username, password) {
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

export async function logEvent(eventType, metadata = {}) {
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
