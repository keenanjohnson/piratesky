import { hashStr } from '../pirate'

// Deterministic accessory per account: 0 = tricorn hat, 1 = bandana.
function accessoryFor(did: string): number {
  return hashStr(did) % 2
}

function Tricorn() {
  return (
    <svg className="avatar-hat" viewBox="0 0 100 60" aria-hidden="true">
      <path
        d="M10 45 Q15 15 50 10 Q85 15 90 45 Q70 30 50 32 Q30 30 10 45 Z"
        fill="#1a1208"
        stroke="#c9a227"
        strokeWidth="3"
      />
      <circle cx="50" cy="22" r="6" fill="#f4e4c1" />
      <path d="M47 20 l6 0 M50 17 l0 6" stroke="#1a1208" strokeWidth="1.5" />
    </svg>
  )
}

function Bandana() {
  return (
    <svg className="avatar-hat" viewBox="0 0 100 60" aria-hidden="true">
      <path d="M12 42 Q20 12 50 12 Q80 12 88 42 Q50 28 12 42 Z" fill="#8b1a1a" />
      <path d="M84 38 q12 4 8 16 q-2 -8 -12 -10 Z" fill="#8b1a1a" />
      <circle cx="35" cy="24" r="2.5" fill="#f4e4c1" />
      <circle cx="52" cy="20" r="2.5" fill="#f4e4c1" />
      <circle cx="68" cy="26" r="2.5" fill="#f4e4c1" />
    </svg>
  )
}

export function PirateAvatar({
  src,
  did,
  alt,
}: {
  src?: string
  did: string
  alt: string
}) {
  const accessory = accessoryFor(did)
  return (
    <div className="avatar">
      {src ? (
        <img className="avatar-img" src={src} alt={alt} loading="lazy" />
      ) : (
        <div className="avatar-img avatar-fallback">☠️</div>
      )}
      {accessory === 1 ? <Bandana /> : <Tricorn />}
    </div>
  )
}
