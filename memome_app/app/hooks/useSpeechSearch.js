import { useCallback, useEffect, useRef, useState } from 'react';
import { requestMicrophonePermission } from '../utils/requestMicrophonePermission';

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function mapSpeechError(code) {
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

const PERMISSION_ERRORS = new Set(['not-allowed', 'service-not-allowed']);

function readTranscript(event) {
  let transcript = '';
  let hasFinal = false;
  for (let i = 0; i < event.results.length; i += 1) {
    transcript += event.results[i][0].transcript;
    if (event.results[i].isFinal) hasFinal = true;
  }
  return { text: transcript.trim(), hasFinal };
}

export function useSpeechSearch({ onTranscript }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const recognitionRef = useRef(null);
  const voiceActiveRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);

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
      const { text, hasFinal } = readTranscript(event);
      if (!text) return;

      onTranscriptRef.current?.(text, { isFinal: hasFinal });

      if (hasFinal) {
        stopVoiceSession();
      }
    };

    recognition.onend = () => {
      if (voiceActiveRef.current) {
        stopVoiceSession();
      }
    };

    recognition.onerror = (event) => {
      if (!voiceActiveRef.current) return;

      if (event.error === 'aborted') return;

      if (PERMISSION_ERRORS.has(event.error)) {
        setPermissionBlocked(true);
        stopVoiceSession();
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

  useEffect(() => {
    setIsSupported(Boolean(getSpeechRecognitionCtor()));
    return () => {
      voiceActiveRef.current = false;
      teardownRecognition();
    };
  }, [teardownRecognition]);

  const startListening = useCallback(async () => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setError('Voice search needs HTTPS. On your phone, open the https:// dev URL (run npm run dev:lan).');
      return;
    }

    if (!getSpeechRecognitionCtor()) {
      setError('Voice search is not supported in this browser. Try Safari on iPhone.');
      return;
    }

    setError(null);
    setPermissionBlocked(false);

    const permission = await requestMicrophonePermission();
    if (!permission.granted) {
      if (permission.denied) {
        setPermissionBlocked(true);
        return;
      }
      setError(permission.message ?? 'Microphone access is unavailable.');
      return;
    }

    voiceActiveRef.current = true;
    setIsListening(true);
    startEngine();
  }, [startEngine]);

  const stopListening = useCallback(() => {
    stopVoiceSession();
  }, [stopVoiceSession]);

  const toggleListening = useCallback(async () => {
    if (voiceActiveRef.current) {
      stopListening();
      return;
    }
    await startListening();
  }, [startListening, stopListening]);

  const dismissPermissionBlocked = useCallback(() => {
    setPermissionBlocked(false);
  }, []);

  return {
    isListening,
    isSupported,
    error,
    permissionBlocked,
    dismissPermissionBlocked,
    startListening,
    stopListening,
    toggleListening,
  };
}
