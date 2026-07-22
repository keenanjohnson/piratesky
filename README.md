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
- **Timeline** from `app.bsky.feed.getTimeline` with a "Hoist More Booty" pagination button
- **Pirate speak translator** ([src/pirate.ts](src/pirate.ts)) — deterministic per post, so missives don't re-translate on every render; URLs, @mentions, and #hashtags be left untouched
- **Pirate avatars** — SVG hat/bandana overlays plus a sepia filter
- **Nautical timestamps** — "3 bells past", "2 sunrises past"
- Images, external link cards, and quote posts (translated, naturally) be supported

Read-only fer now — ye can spy the seven seas but not yet send missives.
