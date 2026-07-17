// Local profiles keyed by access code — the original platform's login,
// adapted for a client-only app. Each code gets its own persisted progress
// (streaks, mastery, challenges) in localStorage; switching codes swaps the
// whole profile. No server, no password — the code IS the profile.

const AUTH_KEY = 'yusr-active-code'

export function getActiveCode(): string | null {
  return localStorage.getItem(AUTH_KEY)
}

export function setActiveCode(code: string) {
  localStorage.setItem(AUTH_KEY, code.trim().toUpperCase())
}

export function clearActiveCode() {
  localStorage.removeItem(AUTH_KEY)
}

/** storage adapter that namespaces every persisted store by the active code */
export const profileStorage = {
  getItem: (name: string) => localStorage.getItem(`${name}:${getActiveCode() ?? 'GUEST'}`),
  setItem: (name: string, value: string) => localStorage.setItem(`${name}:${getActiveCode() ?? 'GUEST'}`, value),
  removeItem: (name: string) => localStorage.removeItem(`${name}:${getActiveCode() ?? 'GUEST'}`),
}
