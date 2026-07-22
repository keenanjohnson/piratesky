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

OAuth in production needs [public/client-metadata.json](public/client-metadata.json) served from yer deployed origin: replace every `YOUR-DOMAIN.example` in that file with yer real domain afore ye deploy. The file's own URL becomes yer OAuth client id.
