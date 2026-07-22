import { Agent, AtpAgent, type AtpSessionData } from '@atproto/api'
import { BrowserOAuthClient, type OAuthSession } from '@atproto/oauth-client-browser'

const PDS_SESSION_KEY = 'piratesky-session'
// "transition:generic" grants app-password-equivalent access; the bare
// "atproto" default can't read timelines or post.
const OAUTH_SCOPE = 'atproto transition:generic'

// Unauthenticated reads (guest mode, trending) hit the public appview.
export const publicAgent = new AtpAgent({ service: 'https://public.api.bsky.app' })

// The active agent. Guests get the public appview; logging in swaps this out.
// ES module live bindings mean importers always see the current value.
export let agent: Agent = publicAgent

// Legacy app-password path, kept as a fallback.
const pdsAgent = new AtpAgent({
  service: 'https://bsky.social',
  persistSession: (_evt, session) => {
    if (session) {
      localStorage.setItem(PDS_SESSION_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(PDS_SESSION_KEY)
    }
  },
})

let oauthClient: BrowserOAuthClient | null = null
let oauthSession: OAuthSession | null = null

function isLoopbackHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
}

async function getOAuthClient(): Promise<BrowserOAuthClient> {
  if (oauthClient) return oauthClient
  const clientId = isLoopbackHost(location.hostname)
    ? // Dev: the atproto spec's loopback client. The library redirects
      // localhost to 127.0.0.1 itself so IndexedDB state stays on one origin.
      `http://localhost?redirect_uri=${encodeURIComponent(
        `http://127.0.0.1${location.port ? `:${location.port}` : ''}/`,
      )}&scope=${encodeURIComponent(OAUTH_SCOPE)}`
    : // Production: the hosted metadata file IS the client id.
      new URL(`${import.meta.env.BASE_URL}client-metadata.json`, location.origin).href
  oauthClient = await BrowserOAuthClient.load({
    clientId,
    handleResolver: 'https://bsky.social',
  })
  return oauthClient
}

/** Restore any existing session (OAuth callback, OAuth restore, or legacy app password). */
export async function initAuth(): Promise<boolean> {
  try {
    const client = await getOAuthClient()
    const result = await client.init()
    if (result) {
      oauthSession = result.session
      agent = new Agent(result.session)
      return true
    }
  } catch {
    // OAuth unavailable on this origin (or mid-redirect to 127.0.0.1);
    // fall through to the app-password session.
  }
  const saved = localStorage.getItem(PDS_SESSION_KEY)
  if (saved) {
    try {
      await pdsAgent.resumeSession(JSON.parse(saved) as AtpSessionData)
      agent = pdsAgent
      return true
    } catch {
      localStorage.removeItem(PDS_SESSION_KEY)
    }
  }
  return false
}

/** Start the OAuth flow. Navigates away from the page on success. */
export async function signInWithBluesky(handle: string): Promise<never> {
  const client = await getOAuthClient()
  return client.signInRedirect(handle)
}

/** Legacy fallback: app-password login straight to the PDS. */
export async function signInWithPassword(
  identifier: string,
  password: string,
): Promise<void> {
  await pdsAgent.login({ identifier, password })
  agent = pdsAgent
}

export async function signOut(): Promise<void> {
  if (oauthSession) {
    await oauthSession.signOut().catch(() => {})
    oauthSession = null
  }
  localStorage.removeItem(PDS_SESSION_KEY)
  agent = publicAgent
}
