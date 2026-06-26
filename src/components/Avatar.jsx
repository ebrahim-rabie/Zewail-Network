import { initials, avatarTint } from '../lib/profile'

// Monogram avatar with a deterministic per-person tint. Falls back to the
// photo when one is set. `size` is the square px size; `radius` the corner.
export default function Avatar({ profile, size = 58, radius = 16, fontSize }) {
  const tint = avatarTint(profile)
  const fs = fontSize ?? Math.round(size * 0.36)

  if (profile?.photo_url) {
    return (
      <img
        src={profile.photo_url}
        alt={profile.full_name || ''}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        font: `700 ${fs}px var(--display)`,
        background: tint.bg,
        color: tint.ink,
      }}
    >
      {initials(profile?.full_name)}
    </div>
  )
}
