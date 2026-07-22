import { useEffect, useState, type FormEvent } from 'react'
import { AtpAgent } from '@atproto/api'

// Trending comes from the public appview; no auth needed.
const publicAgent = new AtpAgent({ service: 'https://api.bsky.app' })

type Topic = { topic: string; link: string }

export function RightRail() {
  const [query, setQuery] = useState('')
  const [topics, setTopics] = useState<Topic[]>([])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    publicAgent.app.bsky.unspecced
      .getTrendingTopics({ limit: 8 })
      .then((res) => {
        if (!cancelled) setTopics(res.data.topics)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const search = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    window.open(`https://bsky.app/search?q=${encodeURIComponent(q)}`, '_blank')
  }

  return (
    <aside className="rail">
      <form className="rail-search" onSubmit={search}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔭 Scour the seas…"
          aria-label="Search Bluesky"
        />
      </form>
      <div className="card rail-trending">
        <h3>🌬️ Winds Be Blowin'</h3>
        {failed && <p className="rail-muted">The winds be calm — no word from the crow's nest.</p>}
        {!failed && topics.length === 0 && <p className="rail-muted">Sniffin' the air…</p>}
        <ol>
          {topics.map((t) => (
            <li key={t.link}>
              <a href={`https://bsky.app${t.link}`} target="_blank" rel="noreferrer">
                {t.topic}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  )
}
