import { useState } from 'react'
import { setActiveCode } from '../lib/profile'

// The original platform's landing: enter your code, or start fresh.
// Codes are local profiles — no server, no password.
export function LoginScreen() {
  const [code, setCode] = useState('')

  const enter = (c: string) => {
    if (!c.trim()) return
    setActiveCode(c)
    window.location.reload()
  }

  const suggestCode = () => {
    const letters = 'ABCDEFGHJKMNPQRSTUVWXYZ'
    const digits = '23456789'
    const pick = (s: string) => s[Math.floor(Math.random() * s.length)]
    return `${pick(letters)}${pick(letters)}${pick(letters)}${pick(digits)}${pick(digits)}${pick(digits)}`
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-4">
      <img src="/yusr-icon.svg" alt="" className="h-16 w-16 rounded-2xl" />
      <h1 className="font-caps mt-4 text-2xl tracking-[0.25em] text-parchment-50">YUSR ARABIC</h1>
      <p className="font-caps mt-1 text-[10px] tracking-[0.3em] text-gold-500">ARABIC MADE EASY</p>

      <button
        type="button"
        onClick={() => enter(suggestCode())}
        className="mt-8 w-full max-w-xs rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-ink-950 transition-colors hover:bg-gold-400"
      >
        Start Your Journey
      </button>

      <p className="mt-6 text-xs text-parchment-100/60">Already with us? Enter your code</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enter(code)
        }}
        className="mt-3 w-full max-w-xs rounded-2xl bg-ink-900 p-4 shadow-xl"
      >
        <label htmlFor="code" className="font-caps block text-[10px] tracking-[0.2em] text-parchment-100/60">
          YOUR CODE
        </label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          autoComplete="off"
          className="mt-2 w-full rounded-xl border border-gold-500/30 bg-ink-950 px-4 py-3 text-center text-lg font-bold tracking-[0.3em] text-parchment-50 outline-none focus:border-gold-500"
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className="mt-3 w-full rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-bold text-ink-950 transition-colors hover:bg-gold-400 disabled:opacity-40"
        >
          Enter
        </button>
      </form>
      <p className="mt-4 max-w-xs text-center text-[11px] leading-relaxed text-parchment-100/40">
        Your code is your local profile — progress is saved on this device under that code. Remember it to come back
        to your journey.
      </p>
    </div>
  )
}
