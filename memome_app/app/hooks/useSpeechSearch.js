import { useCallback, useEffect, useRef, useState } from 'react';

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function mapSpeechError(code) {
  if (code === 'not-allowed' || code === 'service-not-allowed') {
    return 'Microphone access was blocked. Allow mic permission in Safari settings.';
  }
  if (code === 'no-speech') {
    return 'No speech detected. Tap the microphone and try again.';
  }
  if (code === 'audio-capture') {
    return 'No microphone found.';
  }
  if (code === 'network') {
    return 'Voice search needs a network connection. On phone, open the app via HTTPS.';
  }
  return 'Voice search is unavailable right now.';
}

const RETRYABLE_ERRORS = new Set(['no-speech', 'aborted']);

export function useSpeechSearch({ onTranscript }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const voiceActiveRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  const startEngineRef = useRef(null);

  onTranscriptRef.current = onTranscript;

  const teardownRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onstart = null;
    recognition.onend = null;
    recognition.onerror = null;
    recognition.onresult = null;

    try {
      recognition.stop();
    } catch {
      /* ignore */
    }

    recognitionRef.current = null;
  }, []);

  const stopVoiceSession = useCallback(() => {
    voiceActiveRef.current = false;
    setIsListening(false);
    teardownRecognition();
  }, [teardownRecognition]);

  const startEngine = useCallback(() => {
    if (!voiceActiveRef.current) return;

    teardownRecognition();

    const SpeechRecognition = getSpeechRecognitionCtor();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    recognition.onstart = () => {
      setError(null);
    };

    recognition.onresult = (event) => {
      let transcript = '';
      let hasFinal = false;
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) hasFinal = true;
      }

      const text = transcript.trim();
      if (!text) return;

      onTranscriptRef.current?.(text, { isFinal: hasFinal });
    };

    recognition.onend = () => {
      if (!voiceActiveRef.current) {
        stopVoiceSession();
        return;
      }

      if (isIosDevice()) {
        startEngineRef.current?.();
      }
    };

    recognition.onerror = (event) => {
      if (!voiceActiveRef.current) return;

      if (RETRYABLE_ERRORS.has(event.error)) {
        if (isIosDevice()) {
          startEngineRef.current?.();
        }
        return;
      }

      setError(mapSpeechError(event.error));
      stopVoiceSession();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      teardownRecognition();
    }
  }, [stopVoiceSession, teardownRecognition]);

  startEngineRef.current = startEngine;

  useEffect(() => {
    setIsSupported(Boolean(getSpeechRecognitionCtor()));
    return () => {
      voiceActiveRef.current = false;
      teardownRecognition();
    };
  }, [teardownRecognition]);

  const startListening = useCallback(() => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setError('Voice search needs HTTPS. On your phone, open the https:// dev URL (run npm run dev:lan).');
      return;
    }

    if (!getSpeechRecognitionCtor()) {
      setError('Voice search is not supported in this browser. Try Safari on iPhone.');
      return;
    }

    setError(null);
    voiceActiveRef.current = true;
    setIsListening(true);
    startEngine();
  }, [startEngine]);

  const stopListening = useCallback(() => {
    stopVoiceSession();
  }, [stopVoiceSession]);

  const toggleListening = useCallback(() => {
    if (voiceActiveRef.current) stopListening();
    else startListening();
  }, [startListening, stopListening]);

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}
