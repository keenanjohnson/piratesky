import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyFeedDefs,
  AppBskyFeedPost,
} from '@atproto/api'
import { hashStr, pirateTime, toPirateSpeak } from '../pirate'
import { PirateAvatar } from './PirateAvatar'

type Author = {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

function AuthorLine({ author, createdAt }: { author: Author; createdAt?: string }) {
  return (
    <div className="author-line">
      <span className="author-name">{author.displayName || author.handle}</span>
      <span className="author-handle">☠ @{author.handle}</span>
      {createdAt && <span className="post-time">· {pirateTime(createdAt)}</span>}
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
        <AuthorLine author={rec.author} createdAt={value.createdAt} />
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
        <PirateAvatar
          src={post.author.avatar}
          did={post.author.did}
          alt={post.author.handle}
        />
        <div className="post-content">
          <AuthorLine author={post.author} createdAt={record.createdAt} />
          {record.text && <p className="post-text">{toPirateSpeak(record.text, seed)}</p>}
          {post.embed && <EmbedView embed={post.embed} />}
          <div className="post-stats">
            <span title="Replies">🗨️ {post.replyCount ?? 0} parleys</span>
            <span title="Reposts">🏴‍☠️ {post.repostCount ?? 0} plunders</span>
            <span title="Likes">🪙 {post.likeCount ?? 0} doubloons</span>
          </div>
        </div>
      </div>
    </article>
  )
}
