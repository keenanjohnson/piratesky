import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppBskyFeedDefs } from '@atproto/api'
import { agent } from '../agent'
import { Post } from './Post'

export function Timeline() {
  const [feed, setFeed] = useState<AppBskyFeedDefs.FeedViewPost[]>([])
  const [cursor, setCursor] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadedOnce = useRef(false)

  const loadMore = useCallback(async (cur?: string) => {
    setBusy(true)
    setError(null)
    try {
      const res = await agent.getTimeline({ limit: 30, cursor: cur })
      setFeed((prev) => {
        const seen = new Set(prev.map((p) => p.post.uri + (p.reason ? '-r' : '')))
        const fresh = res.data.feed.filter(
          (p) => !seen.has(p.post.uri + (p.reason ? '-r' : '')),
        )
        return [...prev, ...fresh]
      })
      setCursor(res.data.cursor)
      if (!res.data.cursor || res.data.feed.length === 0) setDone(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? `Blast! Couldn't haul in the timeline: ${err.message}`
          : "Blast! Couldn't haul in the timeline.",
      )
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (loadedOnce.current) return
    loadedOnce.current = true
    void loadMore()
  }, [loadMore])

  return (
    <main className="timeline">
      {feed.map((item) => (
        <Post
          key={item.post.uri + (item.reason ? `-repost-${item.post.indexedAt}` : '')}
          item={item}
        />
      ))}
      {busy && <p className="notice">Haulin' in missives from the briny deep…</p>}
      {error && (
        <div className="card">
          <p className="error">{error}</p>
          <button className="btn" onClick={() => void loadMore(cursor)}>
            Try Again, Ye Scurvy Server
          </button>
        </div>
      )}
      {!busy && !error && !done && feed.length > 0 && (
        <button className="btn btn-wide" onClick={() => void loadMore(cursor)}>
          Hoist More Booty 🪙
        </button>
      )}
      {done && <p className="notice">Ye've reached the edge o' the map. Here be dragons.</p>}
    </main>
  )
}
