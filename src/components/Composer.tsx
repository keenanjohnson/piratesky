import { useState } from 'react'
import { agent } from '../agent'
import { hashStr, toPirateSpeak } from '../pirate'

const MAX_LENGTH = 300

export function Composer() {
  const [text, setText] = useState('')
  const [translate, setTranslate] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const outgoing = translate ? toPirateSpeak(text, hashStr(text)) : text

  const send = async () => {
    const body = outgoing.trim()
    if (!body || busy) return
    setBusy(true)
    setStatus(null)
    try {
      await agent.post({ text: body.slice(0, MAX_LENGTH) })
      setText('')
      setStatus('Missive away! ⛵ It\'ll wash ashore in yer feed shortly.')
    } catch (err) {
      setStatus(
        err instanceof Error
          ? `Blast! The missive sank: ${err.message}`
          : 'Blast! The missive sank. Try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="composer card">
      <textarea
        id="composer-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What be on yer mind, matey?"
        maxLength={MAX_LENGTH}
        rows={3}
      />
      {translate && text.trim() && (
        <p className="composer-preview">☠ {outgoing}</p>
      )}
      <div className="composer-footer">
        <label className="composer-toggle">
          <input
            type="checkbox"
            checked={translate}
            onChange={(e) => setTranslate(e.target.checked)}
          />
          Translate to pirate afore it sails
        </label>
        <span className="composer-count">{MAX_LENGTH - text.length}</span>
        <button className="btn btn-small" onClick={() => void send()} disabled={busy || !text.trim()}>
          {busy ? 'Sailin\'…' : 'Send Missive'}
        </button>
      </div>
      {status && <p className="composer-status">{status}</p>}
    </div>
  )
}
