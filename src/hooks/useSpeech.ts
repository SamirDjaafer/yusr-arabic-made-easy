import { useCallback, useEffect, useState } from 'react'

/**
 * Best-effort Arabic pronunciation via the browser's built-in SpeechSynthesis
 * API — no audio files/licensing needed. Availability depends on the user's
 * OS/browser having an Arabic voice installed, so callers should hide the
 * "listen" affordance when `supported` is false rather than showing a button
 * that silently does nothing.
 */
export function useSpeech() {
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      setSupported(voices.some((v) => v.lang.toLowerCase().startsWith('ar')))
    }

    checkVoices()
    window.speechSynthesis.addEventListener('voiceschanged', checkVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', checkVoices)
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ar-SA'
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('ar'))
    if (voice) utterance.voice = voice
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }, [])

  return { speak, supported }
}
