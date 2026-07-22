import { useState, type FormEvent } from 'react'
import { agent } from '../agent'

export function Login({ onLogin }: { onLogin: () => void }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await agent.login({ identifier: identifier.trim(), password })
      onLogin()
    } catch (err) {
      setError(
        err instanceof Error
          ? `Blast! ${err.message}`
          : 'Blast! The login be scuppered. Check yer handle and app password.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="login card" onSubmit={submit}>
      <h2>Come Aboard</h2>
      <p className="login-hint">
        Sign in with yer Bluesky handle and an{' '}
        <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noreferrer">
          app password
        </a>{' '}
        (ne'er yer main password, savvy?).
      </p>
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
      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? 'Hoistin\' the colors…' : 'Set Sail ⛵'}
      </button>
    </form>
  )
}
