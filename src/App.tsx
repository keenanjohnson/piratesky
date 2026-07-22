import { useEffect, useState } from 'react'
import { agent, resumeSession, logout } from './agent'
import { Login } from './components/Login'
import { Timeline } from './components/Timeline'

type AuthState = 'checking' | 'anonymous' | 'aboard'

export default function App() {
  const [auth, setAuth] = useState<AuthState>('checking')

  useEffect(() => {
    resumeSession().then((ok) => setAuth(ok ? 'aboard' : 'anonymous'))
  }, [])

  const handleLogout = () => {
    logout()
    setAuth('anonymous')
  }

  return (
    <div className="app">
      <header className="masthead">
        <h1>PirateSky</h1>
        <p className="tagline">Bluesky, but pirates. Arr.</p>
        {auth === 'aboard' && (
          <button className="btn btn-small" onClick={handleLogout}>
            Abandon Ship ({agent.session?.handle})
          </button>
        )}
      </header>

      {auth === 'checking' && <p className="notice">Checkin' the ship's manifest…</p>}
      {auth === 'anonymous' && <Login onLogin={() => setAuth('aboard')} />}
      {auth === 'aboard' && <Timeline />}

      <footer className="footer">
        <p>☠️ Dead men tell no tales. Yer credentials sail straight to bsky.social and nowhere else.</p>
      </footer>
    </div>
  )
}
