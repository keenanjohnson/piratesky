# PirateSky ☠️

Bluesky, but pirates.

An [atproto](https://atproto.com) app view that logs into yer Bluesky account and renders yer timeline entirely in pirate: every post translated to pirate speak, every avatar fitted with a tricorn hat, or bandana all wrapped in a parchment-and-wood theme.

## Runnin' the ship

```sh
npm install
npm run dev
```

Then open the printed localhost URL. Ye can browse the Uncharted Waters (Discover) feed as a stowaway with no login at all. To come aboard proper, enter yer handle an' sign in with **Bluesky OAuth** — ye get rowed over to yer own PDS's login page, so yer password ne'er touches this app. (Durin' local dev the OAuth flow hops from `localhost` to `127.0.0.1` — that be the atproto loopback client spec, not a bug.)

An [app password](https://bsky.app/settings/app-passwords) fallback hides behind a "sign in the old way" link fer when OAuth be actin' up.

### Deployin'

Every push to `main` deploys to [piratesky.app](https://piratesky.app) via GitHub Pages ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)). OAuth in production be configured by [public/client-metadata.json](public/client-metadata.json) — its deployed URL be the OAuth client id, so it must match the domain exactly.
