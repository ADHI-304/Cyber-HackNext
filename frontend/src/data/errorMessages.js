import { t } from '../i18n';

export function getErrorMessage(code, lang = 'en') {
  switch (code) {
    case 'INVALID_CREDENTIALS':
      return {
        code: 'INVALID_CREDENTIALS',
        title: t(lang, 'errInvalidCredsTitle'),
        plainExplanation: t(lang, 'errInvalidCredsText'),
        nextAction: t(lang, 'errInvalidCredsText'),
        icon: 'ShieldAlert'
      };
    case 'OTP_INCOMPLETE':
      return {
        code: 'OTP_INCOMPLETE',
        title: 'Incomplete Verification Code',
        plainExplanation: 'Please enter a valid 6-digit OTP.',
        nextAction: 'Please enter the full 6 digits to verify.',
        icon: 'KeyRound'
      };
    case 'OTP_EXPIRED':
      return {
        code: 'OTP_EXPIRED',
        title: t(lang, 'errOtpExpiredTitle'),
        plainExplanation: t(lang, 'errOtpExpiredText'),
        nextAction: t(lang, 'errOtpExpiredText'),
        icon: 'Clock'
      };
    case 'OTP_INVALID':
      return {
        code: 'OTP_INVALID',
        title: 'Invalid OTP',
        plainExplanation: 'Invalid OTP. The verification code is incorrect.',
        nextAction: 'Please double-check your code and re-type the digits carefully.',
        icon: 'KeyRound'
      };
    case 'ACCOUNT_LOCKED':
      return {
        code: 'ACCOUNT_LOCKED',
        title: t(lang, 'errAccountLockedTitle'),
        plainExplanation: t(lang, 'errAccountLockedText'),
        nextAction: t(lang, 'errAccountLockedText'),
        icon: 'Lock'
      };
    case 'WEAK_PASSWORD':
      return {
        code: 'WEAK_PASSWORD',
        title: t(lang, 'pwdWeak'),
        plainExplanation: t(lang, 'pwdHint8Chars'),
        nextAction: t(lang, 'pwdHintNumberSymbol'),
        icon: 'ShieldQuestion'
      };
    default:
      return {
        code: code || 'UNKNOWN',
        title: t(lang, 'errInvalidCredsTitle'),
        plainExplanation: t(lang, 'errInvalidCredsText'),
        nextAction: t(lang, 'errInvalidCredsText'),
        icon: 'AlertCircle'
      };
  }
}
