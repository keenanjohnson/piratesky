import { useEffect, useState } from 'react'
import { resumeSession, logout } from './agent'
import { Composer } from './components/Composer'
import { Login } from './components/Login'
import { Nav } from './components/Nav'
import { RightRail } from './components/RightRail'
import { Timeline, type FeedSource } from './components/Timeline'

type AuthState = 'checking' | 'anonymous' | 'aboard'

export default function App() {
  const [auth, setAuth] = useState<AuthState>('checking')
  const [tab, setTab] = useState<FeedSource>('following')

  useEffect(() => {
    resumeSession().then((ok) => setAuth(ok ? 'aboard' : 'anonymous'))
  }, [])

  const handleLogout = () => {
    logout()
    setAuth('anonymous')
  }

  if (auth !== 'aboard') {
    return (
      <div className="app">
        <header className="masthead">
          <h1>PirateSky</h1>
          <p className="tagline">Bluesky, but pirates. Arr.</p>
        </header>
        {auth === 'checking' && <p className="notice">Checkin' the ship's manifest…</p>}
        {auth === 'anonymous' && <Login onLogin={() => setAuth('aboard')} />}
        <footer className="footer">
          <p>☠️ Dead men tell no tales. Yer credentials sail straight to bsky.social and nowhere else.</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="shell">
      <Nav onLogout={handleLogout} />
      <div className="center">
        <div className="tabs">
          <button
            className={`tab ${tab === 'following' ? 'tab-active' : ''}`}
            onClick={() => setTab('following')}
          >
            ⛵ Yer Fleet
          </button>
          <button
            className={`tab ${tab === 'discover' ? 'tab-active' : ''}`}
            onClick={() => setTab('discover')}
          >
            🌊 Uncharted Waters
          </button>
        </div>
        <Composer />
        <Timeline key={tab} source={tab} />
      </div>
      <RightRail />
    </div>
  )
}
