import { useEffect, useState } from 'react'
import { agent, initAuth, signOut } from './agent'
import { Composer } from './components/Composer'
import { Login } from './components/Login'
import { Nav } from './components/Nav'
import { RightRail } from './components/RightRail'
import { Timeline, type FeedSource } from './components/Timeline'

type AuthState = 'checking' | 'guest' | 'aboard'

export default function App() {
  const [auth, setAuth] = useState<AuthState>('checking')
  const [tab, setTab] = useState<FeedSource>('discover')
  const [handle, setHandle] = useState<string | undefined>()

  const loadHandle = () => {
    const did = agent.did
    if (!did) return
    agent
      .getProfile({ actor: did })
      .then((res) => setHandle(res.data.handle))
      .catch(() => {})
  }

  useEffect(() => {
    initAuth().then((ok) => {
      setAuth(ok ? 'aboard' : 'guest')
      if (ok) {
        setTab('following')
        loadHandle()
      }
    })
  }, [])

  const handleLogin = () => {
    setAuth('aboard')
    setTab('following')
    loadHandle()
  }

  const handleLogout = () => {
    void signOut()
    setAuth('guest')
    setTab('discover')
    setHandle(undefined)
  }

  if (auth === 'checking') {
    return (
      <div className="app">
        <header className="masthead">
          <h1>PirateSky</h1>
          <p className="tagline">Bluesky, but pirates. Arr.</p>
        </header>
        <p className="notice">Checkin' the ship's manifest…</p>
      </div>
    )
  }

  const aboard = auth === 'aboard'

  return (
    <div className="shell">
      <Nav
        aboard={aboard}
        handle={handle}
        onLogout={handleLogout}
        onComeAboard={() => {
          setTab('following')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
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
        {aboard && <Composer />}
        {!aboard && tab === 'discover' && (
          <div className="card guest-banner">
            Ye be browsin' as a stowaway — spy the seas freely, but{' '}
            <button className="guest-banner-link" onClick={() => setTab('following')}>
              come aboard
            </button>{' '}
            to see yer own fleet, send missives, an' toss doubloons.
          </div>
        )}
        {!aboard && tab === 'following' ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Timeline key={`${tab}-${aboard}`} source={tab} />
        )}
      </div>
      <RightRail />
    </div>
  )
}
