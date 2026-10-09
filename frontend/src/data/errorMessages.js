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
    case 'SELF_TRUSTED_CONTACT_FORBIDDEN':
      return {
        code: 'SELF_TRUSTED_CONTACT_FORBIDDEN',
        title: 'Invalid Trusted Contact',
        plainExplanation: 'Your account email address cannot be added as your own trusted contact.',
        nextAction: 'Please enter a different email address for your recovery contact.',
        icon: 'ShieldAlert'
      };
    case 'INVALID_EMAIL_FORMAT':
      return {
        code: 'INVALID_EMAIL_FORMAT',
        title: 'Invalid Email Address',
        plainExplanation: 'Please enter a valid email address format (e.g. user@domain.com).',
        nextAction: 'Double-check the syntax of the email address entered.',
        icon: 'AlertCircle'
      };
    case 'DUPLICATE_TRUSTED_CONTACT':
      return {
        code: 'DUPLICATE_TRUSTED_CONTACT',
        title: 'Duplicate Trusted Contacts',
        plainExplanation: 'Trusted contact email addresses must be unique.',
        nextAction: 'Please use distinct email addresses for each trusted contact.',
        icon: 'ShieldAlert'
      };
    case 'PASSWORD_CONTAINS_EMAIL':
      return {
        code: 'PASSWORD_CONTAINS_EMAIL',
        title: 'Password Error',
        plainExplanation: 'Your password cannot match or contain your email address.',
        nextAction: 'Choose a distinct password that does not contain your username or email prefix.',
        icon: 'ShieldQuestion'
      };
    case 'INVALID_PHONE_FORMAT':
      return {
        code: 'INVALID_PHONE_FORMAT',
        title: 'Mobile Phone Number Error',
        plainExplanation: 'The mobile phone number entered is invalid or missing.',
        nextAction: 'Please include a valid country code (e.g. +91 9876543210).',
        icon: 'AlertCircle'
      };
    case 'MISSING_TRUSTED_CONTACT_NAME':
      return {
        code: 'MISSING_TRUSTED_CONTACT_NAME',
        title: 'Trusted Contact Name Required',
        plainExplanation: 'Name is required for trusted contact.',
        nextAction: 'Please enter the full name for the trusted contact.',
        icon: 'AlertCircle'
      };
    case 'MISSING_TRUSTED_CONTACT_EMAIL':
      return {
        code: 'MISSING_TRUSTED_CONTACT_EMAIL',
        title: 'Trusted Contact Email Required',
        plainExplanation: 'Email is required for trusted contact.',
        nextAction: 'Please enter a valid email address for the trusted contact.',
        icon: 'AlertCircle'
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
