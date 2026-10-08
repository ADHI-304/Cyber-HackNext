/**
 * Plain-Language Error Explainer dictionary.
 * Maps backend error codes to clear, non-jargon explanations, titles, icons, and next actions.
 */
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    title: 'Login Unsuccessful',
    plainExplanation: 'The username or password you entered did not match our records. For safety, we keep logins secure.',
    nextAction: 'Double-check your username and password, then try entering them again.',
    icon: 'ShieldAlert'
  },
  OTP_EXPIRED: {
    code: 'OTP_EXPIRED',
    title: 'Verification Code Expired',
    plainExplanation: 'Your 6-digit code has expired after 30 seconds to protect your security.',
    nextAction: 'Click "Get new code" below to receive a fresh verification code.',
    icon: 'Clock'
  },
  OTP_INVALID: {
    code: 'OTP_INVALID',
    title: 'Incorrect Verification Code',
    plainExplanation: 'The 6-digit code you entered did not match the latest code sent to your device.',
    nextAction: 'Please check your text message or authenticator app and type the 6 digits carefully.',
    icon: 'KeyRound'
  },
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    title: 'Account Temporarily Locked',
    plainExplanation: 'To protect your account from unauthorized attempts, signing in has been temporarily paused after 5 failed tries.',
    nextAction: 'You can start account recovery using your trusted contacts or try again in 15 minutes.',
    icon: 'Lock'
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    title: 'Too Many Fast Attempts',
    plainExplanation: 'We noticed multiple attempts in a very short period. We paused requests for a brief moment to keep your account safe.',
    nextAction: 'Please wait 10 seconds before clicking again.',
    icon: 'Hourglass'
  },
  WEAK_PASSWORD: {
    code: 'WEAK_PASSWORD',
    title: 'Password Needs Strengthening',
    plainExplanation: 'Your chosen password is easy for automated tools to guess.',
    nextAction: 'Include at least 8 characters, a number, and a symbol like ! or #.',
    icon: 'ShieldQuestion'
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    title: 'Connection Issue',
    plainExplanation: 'We could not reach the security server. Your internet connection might be spotty.',
    nextAction: 'Check your Wi-Fi or cellular network connection and try again.',
    icon: 'WifiOff'
  },
  RECOVERY_PENDING: {
    code: 'RECOVERY_PENDING',
    title: 'Recovery Request Already Active',
    plainExplanation: 'An active account recovery process is currently waiting for contact approvals.',
    nextAction: 'Check your active recovery status page or contact your trusted friends to approve.',
    icon: 'Users'
  }
};

/**
 * Fallback helper if an unknown error code is returned.
 */
export function getErrorMessage(code) {
  if (!code || !ERROR_MESSAGES[code]) {
    return {
      code: code || 'UNKNOWN',
      title: 'Something Went Wrong',
      plainExplanation: 'An unexpected issue occurred while processing your request.',
      nextAction: 'Please refresh the page or try again in a few moments.',
      icon: 'AlertCircle'
    };
  }
  return ERROR_MESSAGES[code];
}
