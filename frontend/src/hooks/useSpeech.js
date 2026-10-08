import { useState, useEffect, useCallback, useRef } from 'react';

const BACKEND_URL = 'http://localhost:5000';

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(true);
  const voicesRef = useRef([]);
  const audioRef = useRef(null);

  const loadVoices = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices && availableVoices.length > 0) {
        voicesRef.current = availableVoices;
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, [loadVoices]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text, langCode = 'en-IN') => {
    if (!text) return;
    stop();

    if (voicesRef.current.length === 0 && window.speechSynthesis?.getVoices) {
      voicesRef.current = window.speechSynthesis.getVoices();
    }

    const targetLang = (langCode || 'en-IN').toLowerCase();
    const shortLang = targetLang.split('-')[0];
    const available = voicesRef.current;

    let selectedVoice = available.find(v => v.lang.toLowerCase() === targetLang);
    if (!selectedVoice) {
      selectedVoice = available.find(v => v.lang.toLowerCase().startsWith(shortLang));
    }
    if (!selectedVoice) {
      const nameMap = { hi: 'hindi', ta: 'tamil', ml: 'malayalam', en: 'english' };
      const searchName = nameMap[shortLang];
      if (searchName) {
        selectedVoice = available.find(v => v.name.toLowerCase().includes(searchName));
      }
    }

    if (selectedVoice) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      const audioUrl = `${BACKEND_URL}/api/v1/tts?text=${encodeURIComponent(text)}&lang=${shortLang}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      audio.play().catch(e => {
        console.warn('Audio TTS playback failed:', e);
        setIsSpeaking(false);
      });
    }
  }, [stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { speak, stop, isSpeaking, isSupported };
}
