# PirateSky ☠️

Bluesky, but pirates.

An [atproto](https://atproto.com) app view that logs into yer Bluesky account and renders yer timeline entirely in pirate: every post translated to pirate speak, every scallywag given a pirate rank, every avatar fitted with a tricorn hat, bandana, or eyepatch, all wrapped in a parchment-and-wood theme.

## Runnin' the ship

```sh
npm install
npm run dev
```

Then open the printed localhost URL and sign in with yer Bluesky handle and an [app password](https://bsky.app/settings/app-passwords) — ne'er yer main password. Credentials go straight to `bsky.social` and nowhere else; the session be stored in yer browser's localStorage.

## What be aboard

- **Login** via `com.atproto.server.createSession` (app password) with session resume
- **Bluesky-style three-column layout** — left nav (linkin' out to bsky.app fer pages not yet built), center feed with "Yer Fleet" (Following) an' "Uncharted Waters" (Discover) tabs, right rail with search an' "Winds Be Blowin'" trending topics
- **Composer** — send missives straight from the deck, with an optional "translate to pirate afore it sails" toggle an' live preview
- **Timeline** from `app.bsky.feed.getTimeline` with infinite scroll, plus a background poll that surfaces a "new missives off the bow" pill (Bluesky-style — yer scroll position ne'er jumps)
- **Likes an' reposts** — toss a doubloon (like) or plunder (repost) straight from the feed; names, avatars, and timestamps link out to bsky.app
- **Pirate speak translator** ([src/pirate.ts](src/pirate.ts)) — deterministic per post, so missives don't re-translate on every render; URLs, @mentions, and #hashtags be left untouched
- **Pirate avatars** — SVG hat/bandana overlays plus a sepia filter
- **Nautical timestamps** — "3 bells past", "2 sunrises past"
- Images, external link cards, and quote posts (translated, naturally) be supported

Ye can post, like, an' repost from the deck; replies, notifications, an' the rest o' the fleet still mean rowin' over to bsky.app.
