import { AtpAgent, type AtpSessionData } from '@atproto/api'

const SESSION_KEY = 'piratesky-session'

export const agent = new AtpAgent({
  service: 'https://bsky.social',
  persistSession: (_evt, session) => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  },
})

/** Try to resume a saved session. Returns true if logged in. */
export async function resumeSession(): Promise<boolean> {
  const saved = localStorage.getItem(SESSION_KEY)
  if (!saved) return false
  try {
    await agent.resumeSession(JSON.parse(saved) as AtpSessionData)
    return true
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return false
  }
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
}
