import { agent } from '../agent'

const focusComposer = () => {
  const box = document.getElementById('composer-input')
  box?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  box?.focus({ preventScroll: true })
}

export function Nav({
  aboard,
  handle,
  onLogout,
  onComeAboard,
}: {
  aboard: boolean
  handle?: string
  onLogout: () => void
  onComeAboard: () => void
}) {
  const profileActor = handle ?? agent.did
  const items: Array<{ icon: string; label: string; href: string }> = [
    { icon: '🧭', label: 'Chart the Seas', href: 'https://bsky.app/search' },
    { icon: '🔔', label: "Crow's Nest", href: 'https://bsky.app/notifications' },
    { icon: '💬', label: 'Parley', href: 'https://bsky.app/messages' },
    { icon: '🗺️', label: 'Trade Routes', href: 'https://bsky.app/feeds' },
    { icon: '📜', label: 'Crew Rosters', href: 'https://bsky.app/lists' },
    ...(aboard && profileActor
      ? [{ icon: '🏴‍☠️', label: 'Yer Colors', href: `https://bsky.app/profile/${profileActor}` }]
      : []),
    { icon: '⚙️', label: "The Riggin'", href: 'https://bsky.app/settings' },
  ]

  return (
    <nav className="nav">
      <div className="nav-brand">🏴‍☠️ PirateSky</div>
      <button
        className="nav-link nav-current"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <span className="nav-icon">⚓</span> The Deck
      </button>
      {items.map((item) => (
        <a
          key={item.label}
          className="nav-link"
          href={item.href}
          target="_blank"
          rel="noreferrer"
          title="Rows ye over to bsky.app"
        >
          <span className="nav-icon">{item.icon}</span> {item.label}
        </a>
      ))}
      {aboard ? (
        <>
          <button className="btn nav-post-btn" onClick={focusComposer}>
            Send a Missive 📜
          </button>
          <button className="nav-link nav-logout" onClick={onLogout}>
            <span className="nav-icon">🏃</span> Abandon Ship
          </button>
          {handle && <div className="nav-handle">☠ @{handle}</div>}
        </>
      ) : (
        <button className="btn nav-post-btn" onClick={onComeAboard}>
          Come Aboard ⛵
        </button>
      )}
    </nav>
  )
}
