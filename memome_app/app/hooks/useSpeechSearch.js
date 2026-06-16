import { useCallback, useEffect, useRef, useState } from 'react';

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function mapSpeechError(code) {
  if (code === 'not-allowed' || code === 'service-not-allowed') {
    return 'Microphone access was blocked. Allow mic permission in your browser settings.';
  }
  if (code === 'no-speech') {
    return 'No speech detected. Tap the microphone and try again.';
  }
  if (code === 'audio-capture') {
    return 'No microphone found.';
  }
  if (code === 'network') {
    return 'Voice search needs a network connection.';
  }
  return 'Voice search is unavailable right now.';
}

export function useSpeechSearch({ onTranscript }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);

  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognitionCtor();
    setIsSupported(Boolean(SpeechRecognition));
    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;
      setError(mapSpeechError(event.error));
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      onTranscriptRef.current?.(transcript.trim());
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError('Voice search is not supported in this browser. Try Chrome or Safari.');
      return;
    }

    setError(null);

    try {
      recognition.start();
    } catch {
      recognition.stop();
      window.setTimeout(() => {
        try {
          recognition.start();
        } catch {
          setError('Could not start voice search. Try again.');
        }
      }, 120);
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}
