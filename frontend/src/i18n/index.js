import { en } from './en';
import { hi } from './hi';
import { ta } from './ta';
import { ml } from './ml';

export const translations = { en, hi, ta, ml };

export const languages = [
  { code: 'en', name: 'English', voiceCode: 'en-IN' },
  { code: 'hi', name: 'हिंदी', voiceCode: 'hi-IN' },
  { code: 'ta', name: 'தமிழ்', voiceCode: 'ta-IN' },
  { code: 'ml', name: 'മലയാളം', voiceCode: 'ml-IN' }
];

export const speechVoiceMap = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  ml: 'ml-IN'
};

export function t(lang, key, params = {}) {
  const currentDict = translations[lang] || translations.en;
  let text = currentDict[key] || translations.en[key] || key;

  // Replace dynamic template placeholders like {seconds}, {current}, {total}
  Object.keys(params).forEach(paramKey => {
    text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
  });

  return text;
}
