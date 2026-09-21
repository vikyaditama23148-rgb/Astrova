'use client';

import { useEffect, useRef, useState } from 'react';
import { Square, Volume2 } from 'lucide-react';

/** Pembaca audio: pakai file MP3 (Supabase Storage) bila ada, jika tidak pakai Web Speech API bawaan browser. */
export default function AudioReader({ text, audioUrl }: { text: string; audioUrl?: string }) {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    setPlaying(false);
  };

  useEffect(() => {
    setSupported(!!audioUrl || (typeof window !== 'undefined' && 'speechSynthesis' in window));
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, audioUrl]);

  const toggle = () => {
    if (playing) return stop();
    const speak = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'id-ID'; u.rate = 0.92; u.pitch = 1.1;
      const v = window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith('id'));
      if (v) u.voice = v;
      u.onend = () => setPlaying(false);
      u.onerror = () => setPlaying(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      setPlaying(true);
    };
    if (audioUrl) {
      const a = new Audio(audioUrl);
      audioRef.current = a;
      a.onended = () => setPlaying(false);
      a.onerror = () => { audioRef.current = null; if ('speechSynthesis' in window) speak(); else setPlaying(false); };
      a.play().then(() => setPlaying(true)).catch(() => { if ('speechSynthesis' in window) speak(); });
    } else speak();
  };

  if (!supported) return null;
  return (
    <button type="button" onClick={toggle} className={`btn btn-sm ${playing ? 'btn-primary' : 'btn-aqua'}`} aria-pressed={playing}>
      {playing ? <><Square size={16} fill="currentColor" /> Berhenti</> : <><Volume2 size={18} /> Dengarkan</>}
    </button>
  );
}
