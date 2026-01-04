'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

export default function VoiceInputButton({
  onTranscript,
  disabled = false,
  size = 'default',
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports Web Speech API
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const handleVoiceInput = () => {
    if (!isSupported) {
      toast.error('Voice input is not supported in your browser');
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening... Speak now');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Voice input failed. Please try again.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      toast.error('Failed to start voice input');
      setIsListening(false);
    }
  };

  if (!isSupported) {
    return null; // Hide button if not supported
  }

  const buttonSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      type="button"
      onClick={handleVoiceInput}
      disabled={disabled || isListening}
      className={`${buttonSize} rounded-full flex items-center justify-center transition-all ${
        isListening
          ? 'bg-red-500 animate-pulse'
          : 'bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
      } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isListening ? 'Listening...' : 'Click to speak'}
    >
      {isListening ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : (
        <Mic className={iconSize} />
      )}
    </button>
  );
}
