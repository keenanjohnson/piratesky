import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppBskyFeedDefs } from '@atproto/api'
import { agent } from '../agent'
import { Post } from './Post'

const POLL_INTERVAL_MS = 60_000

// Bluesky's official "What's Hot" (Discover) feed generator.
const DISCOVER_FEED =
  'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot'

export type FeedSource = 'following' | 'discover'

async function fetchPage(source: FeedSource, cursor?: string) {
  if (source === 'following') {
    const res = await agent.getTimeline({ limit: 30, cursor })
    return res.data
  }
  const res = await agent.app.bsky.feed.getFeed({ feed: DISCOVER_FEED, limit: 30, cursor })
  return res.data
}

function feedKey(item: AppBskyFeedDefs.FeedViewPost): string {
  return item.post.uri + (item.reason ? '-r' : '')
}

// Accounts labeled !no-unauthenticated asked not to be shown to logged-out
// viewers; official clients hide them from guests, so we do too.
function hiddenFromGuests(item: AppBskyFeedDefs.FeedViewPost): boolean {
  if (agent.did) return false
  return !!item.post.author.labels?.some((l) => l.val === '!no-unauthenticated')
}

export function Timeline({ source }: { source: FeedSource }) {
  const [feed, setFeed] = useState<AppBskyFeedDefs.FeedViewPost[]>([])
  const [pending, setPending] = useState<AppBskyFeedDefs.FeedViewPost[]>([])
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs mirror state so the IntersectionObserver and poll callbacks
  // never act on stale closures.
  const cursorRef = useRef<string | undefined>(undefined)
  const busyRef = useRef(false)
  const doneRef = useRef(false)
  const seenRef = useRef(new Set<string>())
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (busyRef.current || doneRef.current) return
    busyRef.current = true
    setBusy(true)
    setError(null)
    try {
      const data = await fetchPage(source, cursorRef.current)
      const fresh = data.feed.filter(
        (p) => !seenRef.current.has(feedKey(p)) && !hiddenFromGuests(p),
      )
      fresh.forEach((p) => seenRef.current.add(feedKey(p)))
      setFeed((prev) => [...prev, ...fresh])
      cursorRef.current = data.cursor
      if (!data.cursor || data.feed.length === 0) {
        doneRef.current = true
        setDone(true)
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `Blast! Couldn't haul in the timeline: ${err.message}`
          : "Blast! Couldn't haul in the timeline.",
      )
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }, [source])

  // Initial load.
  useEffect(() => {
    void loadMore()
  }, [loadMore])

  // Infinite scroll: fetch the next page when the sentinel nears the viewport.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void loadMore()
      },
      { rootMargin: '800px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  // Background poll for new posts. They wait behind a pill rather than
  // auto-inserting, so the user's scroll position never jumps.
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const data = await fetchPage(source)
        const fresh = data.feed.filter(
          (p) => !seenRef.current.has(feedKey(p)) && !hiddenFromGuests(p),
        )
        if (fresh.length === 0) return
        fresh.forEach((p) => seenRef.current.add(feedKey(p)))
        setPending((prev) => [...fresh, ...prev])
      } catch {
        // A missed poll is no emergency; the next tide will bring it.
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [source])

  const showPending = () => {
    setFeed((prev) => [...pending, ...prev])
    setPending([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="timeline">
      {pending.length > 0 && (
        <button className="btn new-posts-pill" onClick={showPending}>
          ⚓ {pending.length} new missive{pending.length === 1 ? '' : 's'} off the bow
        </button>
      )}
      {feed.map((item) => (
        <Post key={feedKey(item)} item={item} />
      ))}
      {busy && <p className="notice">Haulin' in missives from the briny deep…</p>}
      {error && (
        <div className="card">
          <p className="error">{error}</p>
          <button className="btn" onClick={() => void loadMore()}>
            Try Again, Ye Scurvy Server
          </button>
        </div>
      )}
      {done && <p className="notice">Ye've reached the edge o' the map. Here be dragons.</p>}
      <div ref={sentinelRef} aria-hidden="true" />
    </main>
  )
}
