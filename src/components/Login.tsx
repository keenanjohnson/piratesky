import { useState, type FormEvent } from 'react'
import { signInWithBluesky, signInWithPassword } from '../agent'

function normalizeHandle(input: string): string {
  let h = input.trim().replace(/^@/, '')
  if (h && !h.includes('.')) h += '.bsky.social'
  return h
}

export function Login({ onLogin }: { onLogin: () => void }) {
  const [handle, setHandle] = useState('')
  const [oauthBusy, setOauthBusy] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const oauthSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const h = normalizeHandle(handle)
    if (!h) return
    setOauthBusy(true)
    setError(null)
    try {
      // Navigates away to the user's own PDS login page on success.
      await signInWithBluesky(h)
    } catch (err) {
      setError(
        err instanceof Error
          ? `Blast! ${err.message}`
          : "Blast! Couldn't find that handle on the charts.",
      )
      setOauthBusy(false)
    }
  }

  const passwordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPwBusy(true)
    setError(null)
    try {
      await signInWithPassword(identifier.trim(), password)
      onLogin()
    } catch (err) {
      setError(
        err instanceof Error
          ? `Blast! ${err.message}`
          : 'Blast! The login be scuppered. Check yer handle and app password.',
      )
    } finally {
      setPwBusy(false)
    }
  }

  return (
    <div className="login card">
      <h2>Come Aboard</h2>
      <p className="login-hint">
        Enter yer Bluesky handle an' we'll row ye over to yer own crew's login page —
        yer password ne'er touches this ship.
      </p>
      <form className="login-form" onSubmit={oauthSubmit}>
        <label>
          Handle
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="blackbeard.bsky.social"
            autoComplete="username"
            required
          />
        </label>
        <button className="btn" type="submit" disabled={oauthBusy}>
          {oauthBusy ? 'Rowin\' ye over…' : 'Sign In with Bluesky ⛵'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <details className="login-fallback">
        <summary>Sign in the old way (app password)</summary>
        <p className="login-hint">
          Needs an{' '}
          <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noreferrer">
            app password
          </a>{' '}
          — ne'er yer main password, savvy? It sails straight to bsky.social an' nowhere else.
        </p>
        <form className="login-form" onSubmit={passwordSubmit}>
          <label>
            Handle
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="blackbeard.bsky.social"
              autoComplete="username"
              required
            />
          </label>
          <label>
            App Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="xxxx-xxxx-xxxx-xxxx"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="btn" type="submit" disabled={pwBusy}>
            {pwBusy ? 'Hoistin\' the colors…' : 'Set Sail'}
          </button>
        </form>
      </details>
    </div>
  )
}
