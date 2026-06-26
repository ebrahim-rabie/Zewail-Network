import { useNavigate } from 'react-router-dom'
import Avatar from './Avatar'
import { Pin } from './Icons'

// A directory grid card. `g` is a decorated profile (see lib/profile.decorate).
export default function GraduateCard({ g }) {
  const navigate = useNavigate()

  return (
    <div
      className="card"
      style={{
        padding: 22,
        borderRadius: 18,
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow .2s, transform .2s, border-color .2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 18px 40px -22px rgba(40,30,80,.35)'
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.borderColor = 'var(--accent-soft)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.borderColor = 'var(--line)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <Avatar profile={g} size={58} radius={16} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              font: '700 17px var(--display)',
              letterSpacing: '-.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {g.full_name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            {g.short} · Class of {g.grad_year}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 14.5, lineHeight: 1.45, color: 'var(--ink)', marginBottom: 4 }}>
        <strong style={{ fontWeight: 600 }}>{g.role}</strong>
      </div>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 14 }}>{g.company}</div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 'auto',
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        {g.location && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12.5,
              color: 'var(--muted)',
            }}
          >
            <Pin size={13} />
            {g.location}
          </span>
        )}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--accent-ink)',
            background: 'var(--accent-soft)',
            padding: '3px 9px',
            borderRadius: 99,
          }}
        >
          {g.pathName}
        </span>
      </div>

      <button
        onClick={() => navigate(`/profile/${g.id}`)}
        style={{
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 11,
          padding: 10,
          font: '600 14px var(--body)',
          color: 'var(--ink)',
          cursor: 'pointer',
          transition: 'background .2s, color .2s, border-color .2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--ink)'
          e.currentTarget.style.color = '#fff'
          e.currentTarget.style.borderColor = 'var(--ink)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--surface)'
          e.currentTarget.style.color = 'var(--ink)'
          e.currentTarget.style.borderColor = 'var(--line)'
        }}
      >
        View profile
      </button>
    </div>
  )
}
