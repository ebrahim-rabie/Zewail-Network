import Avatar from './Avatar'
import { Pin, Cap } from './Icons'
import { decorate } from '../lib/profile'

// Full-profile preview for the admin queue. For an edit request it shows the
// PROPOSED version (draft merged over live) so the admin reviews what will go
// public on approval.
export default function AdminProfileModal({ row, onClose, onApprove, onReject }) {
  if (!row) return null
  const isEdit = !!row.pending_review
  const merged = isEdit && row.draft ? { ...row, ...row.draft } : row
  const p = decorate(merged)
  const hasContact = p.email || p.phone || p.linkedin || p.github || p.twitter

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(8,6,16,.66)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ width: '100%', maxWidth: 720, padding: 28, borderRadius: 20, animation: 'riseIn .35s ease both' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
          <span style={isEdit ? tagEdit : tagNew}>{isEdit ? 'Proposed edit' : 'New account'}</span>
          <button onClick={onClose} title="Close" style={{ width: 30, height: 30, borderRadius: 9, border: 'none', background: 'var(--line2)', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>

        {/* identity */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap' }}>
          <Avatar profile={p} size={84} radius={20} fontSize={30} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <h2 style={{ font: '700 24px var(--display)', letterSpacing: '-.02em', margin: '0 0 4px' }}>{p.full_name || '—'}</h2>
            {(p.role || p.company) && (
              <div style={{ fontSize: 15, color: 'var(--ink)', marginBottom: 6 }}>
                <strong style={{ fontWeight: 600 }}>{p.role}</strong>{p.company ? ` · ${p.company}` : ''}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13.5, color: 'var(--muted)' }}>
              <span>{p.email || 'no email'}</span>
              {p.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Pin size={13} />{p.location}</span>}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Cap size={13} />{p.short || '—'}{p.grad_year ? `, Class of ${p.grad_year}` : ''}</span>
            </div>
          </div>
        </div>

        <Field label="School">{p.school || '—'}</Field>
        <Field label="Major">{p.major || '—'}</Field>
        <Field label="About">{p.about || '—'}</Field>

        {/* experiences */}
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>Work experience</div>
          {p.experiences?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {p.experiences.map((x, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <div style={{ font: '600 14.5px var(--body)', color: 'var(--ink)' }}>{x.title || '—'}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>{[x.company, x.dates].filter(Boolean).join(' · ')}</div>
                    {x.desc && <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 3 }}>{x.desc}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: 'var(--faint)' }}>—</div>
          )}
        </div>

        {hasContact && (
          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>Contact &amp; socials</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {p.phone && <span>Phone: {p.phone}</span>}
              {p.linkedin && <span>LinkedIn: {p.linkedin}</span>}
              {p.github && <span>GitHub: {p.github}</span>}
              {p.twitter && <span>Twitter/X: {p.twitter}</span>}
            </div>
          </div>
        )}

        {/* actions (only for queue items; omitted for read-only previews) */}
        {(onApprove || onReject) && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22, borderTop: '1px solid var(--line)', paddingTop: 18 }}>
            <button onClick={() => { onReject?.(row); onClose() }} className="btn btn-outline" style={{ padding: '10px 18px', fontSize: 14 }}>
              {isEdit ? 'Discard edit' : 'Reject'}
            </button>
            <button onClick={() => { onApprove?.(row); onClose() }} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14, borderRadius: 11 }}>
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const labelStyle = { font: '600 12px var(--body)', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 6 }

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.5 }}>{children}</div>
    </div>
  )
}

const tagBase = { display: 'inline-block', font: '600 11.5px var(--body)', padding: '4px 12px', borderRadius: 99 }
const tagNew = { ...tagBase, background: 'var(--accent-soft)', color: 'var(--accent-ink)' }
const tagEdit = { ...tagBase, background: 'oklch(0.34 0.08 85)', color: 'oklch(0.85 0.13 85)' }
