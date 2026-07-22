import { useState } from 'react'
import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyFeedDefs,
  AppBskyFeedPost,
  type ComAtprotoLabelDefs,
} from '@atproto/api'

// Moderation labels whose media gets hidden behind a click-to-reveal shield,
// matching the default behavior of official Bluesky clients.
const SENSITIVE_LABELS = new Set([
  'porn',
  'sexual',
  'nudity',
  'graphic-media',
  'gore',
  '!warn',
  '!hide',
])

function isSensitive(
  ...labelSets: Array<ComAtprotoLabelDefs.Label[] | undefined>
): boolean {
  return labelSets.some((labels) =>
    labels?.some((label) => SENSITIVE_LABELS.has(label.val)),
  )
}
import { agent } from '../agent'
import { hashStr, pirateTime, toPirateSpeak } from '../pirate'
import { PirateAvatar } from './PirateAvatar'

type Author = {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

function profileUrl(author: Author): string {
  return `https://bsky.app/profile/${author.did}`
}

function postUrl(author: Author, uri: string): string {
  const rkey = uri.split('/').pop()
  return `${profileUrl(author)}/post/${rkey}`
}

function AuthorLine({
  author,
  createdAt,
  uri,
}: {
  author: Author
  createdAt?: string
  uri?: string
}) {
  return (
    <div className="author-line">
      <a
        className="author-name"
        href={profileUrl(author)}
        target="_blank"
        rel="noreferrer"
      >
        {author.displayName || author.handle}
      </a>
      <a
        className="author-handle"
        href={profileUrl(author)}
        target="_blank"
        rel="noreferrer"
      >
        ☠ @{author.handle}
      </a>
      {createdAt &&
        (uri ? (
          <a
            className="post-time"
            href={postUrl(author, uri)}
            target="_blank"
            rel="noreferrer"
            title="Spy the full yarn on Bluesky"
          >
            · {pirateTime(createdAt)}
          </a>
        ) : (
          <span className="post-time">· {pirateTime(createdAt)}</span>
        ))}
    </div>
  )
}

function EmbedView({ embed }: { embed: unknown }) {
  if (AppBskyEmbedImages.isView(embed)) {
    return (
      <div className={`embed-images count-${Math.min(embed.images.length, 4)}`}>
        {embed.images.map((img) => (
          <img
            key={img.thumb}
            src={img.thumb}
            alt={img.alt ? toPirateSpeak(img.alt) : 'A treasure from the deep'}
            className="embed-image"
            loading="lazy"
          />
        ))}
      </div>
    )
  }
  if (AppBskyEmbedExternal.isView(embed)) {
    const ext = embed.external
    return (
      <a className="embed-external" href={ext.uri} target="_blank" rel="noreferrer">
        {ext.thumb && <img src={ext.thumb} alt="" loading="lazy" />}
        <div>
          <strong>{toPirateSpeak(ext.title, hashStr(ext.uri))}</strong>
          {ext.description && <p>{toPirateSpeak(ext.description)}</p>}
          <span className="embed-domain">🗺️ {new URL(ext.uri).hostname}</span>
        </div>
      </a>
    )
  }
  if (AppBskyEmbedRecord.isView(embed) && AppBskyEmbedRecord.isViewRecord(embed.record)) {
    const rec = embed.record
    const value = rec.value as Partial<AppBskyFeedPost.Record>
    return (
      <div className="embed-quote">
        <AuthorLine author={rec.author} createdAt={value.createdAt} uri={rec.uri} />
        {typeof value.text === 'string' && (
          <p className="post-text">{toPirateSpeak(value.text, hashStr(rec.uri))}</p>
        )}
      </div>
    )
  }
  return null
}

export function Post({ item }: { item: AppBskyFeedDefs.FeedViewPost }) {
  const post = item.post
  const record = post.record as AppBskyFeedPost.Record
  const seed = hashStr(post.uri)

  const quoted =
    AppBskyEmbedRecord.isView(post.embed) && AppBskyEmbedRecord.isViewRecord(post.embed.record)
      ? post.embed.record
      : undefined
  const sensitive = isSensitive(
    post.labels,
    post.author.labels,
    quoted?.labels,
    quoted?.author.labels,
  )
  const [revealed, setRevealed] = useState(false)

  const [likeUri, setLikeUri] = useState(post.viewer?.like)
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0)
  const [repostUri, setRepostUri] = useState(post.viewer?.repost)
  const [repostCount, setRepostCount] = useState(post.repostCount ?? 0)

  const toggleLike = async () => {
    if (likeUri) {
      setLikeUri(undefined)
      setLikeCount((c) => c - 1)
      try {
        await agent.deleteLike(likeUri)
      } catch {
        setLikeUri(likeUri)
        setLikeCount((c) => c + 1)
      }
    } else {
      setLikeCount((c) => c + 1)
      try {
        const res = await agent.like(post.uri, post.cid)
        setLikeUri(res.uri)
      } catch {
        setLikeCount((c) => c - 1)
      }
    }
  }

  const toggleRepost = async () => {
    if (repostUri) {
      setRepostUri(undefined)
      setRepostCount((c) => c - 1)
      try {
        await agent.deleteRepost(repostUri)
      } catch {
        setRepostUri(repostUri)
        setRepostCount((c) => c + 1)
      }
    } else {
      setRepostCount((c) => c + 1)
      try {
        const res = await agent.repost(post.uri, post.cid)
        setRepostUri(res.uri)
      } catch {
        setRepostCount((c) => c - 1)
      }
    }
  }

  return (
    <article className="post card">
      {AppBskyFeedDefs.isReasonRepost(item.reason) && (
        <div className="repost-banner">
          🏴‍☠️ Plundered an' reflown by{' '}
          {item.reason.by.displayName || item.reason.by.handle}
        </div>
      )}
      {item.reply && AppBskyFeedDefs.isPostView(item.reply.parent) && (
        <div className="reply-banner">
          ⚓ Parleyin' with{' '}
          {item.reply.parent.author.displayName || item.reply.parent.author.handle}
        </div>
      )}
      <div className="post-body">
        <a href={profileUrl(post.author)} target="_blank" rel="noreferrer">
          <PirateAvatar
            src={post.author.avatar}
            did={post.author.did}
            alt={post.author.handle}
          />
        </a>
        <div className="post-content">
          <AuthorLine author={post.author} createdAt={record.createdAt} uri={post.uri} />
          {record.text && <p className="post-text">{toPirateSpeak(record.text, seed)}</p>}
          {post.embed &&
            (sensitive && !revealed ? (
              <button className="cursed-cargo" onClick={() => setRevealed(true)}>
                ⚠️ Cursed cargo — click to peek
              </button>
            ) : (
              <EmbedView embed={post.embed} />
            ))}
          <div className="post-stats">
            <a
              className="stat-btn"
              href={postUrl(post.author, post.uri)}
              target="_blank"
              rel="noreferrer"
              title="Parley (reply on Bluesky)"
            >
              🗨️ {post.replyCount ?? 0} parleys
            </a>
            {agent.did ? (
              <>
                <button
                  className={`stat-btn ${repostUri ? 'stat-lit' : ''}`}
                  onClick={() => void toggleRepost()}
                  title={repostUri ? 'Strike yer colors (undo repost)' : 'Plunder (repost)'}
                >
                  🏴‍☠️ {repostCount} plunders
                </button>
                <button
                  className={`stat-btn ${likeUri ? 'stat-lit' : ''}`}
                  onClick={() => void toggleLike()}
                  title={likeUri ? 'Take back yer doubloon (unlike)' : 'Toss a doubloon (like)'}
                >
                  🪙 {likeCount} doubloons
                </button>
              </>
            ) : (
              <>
                <span className="stat-btn" title="Come aboard to plunder">
                  🏴‍☠️ {repostCount} plunders
                </span>
                <span className="stat-btn" title="Come aboard to toss doubloons">
                  🪙 {likeCount} doubloons
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
