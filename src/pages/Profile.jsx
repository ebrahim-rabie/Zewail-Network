import { useParams, useNavigate, Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import AuthButtons from '../components/AuthButtons'
import { ChevronLeft, Pin, Cap } from '../components/Icons'
import { useGraduate } from '../hooks/useGraduates'

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { graduate: sel, loading, error } = useGraduate(id)

  return (
    <div>
      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'transparent' }}>
        <div
          style={{
            maxWidth: 1040,
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <button
            onClick={() => navigate('/browse')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', font: '600 14px var(--body)', color: 'var(--muted)', padding: 0 }}
          >
            <ChevronLeft size={16} />
            Back to directory
          </button>
          <AuthButtons />
        </div>
      </header>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '36px 24px 72px' }}>
        {loading ? (
          <Centered text="Loading profile…" />
        ) : error || !sel ? (
          <Centered text="That profile isn't available." link />
        ) : (
          <>
            {/* header card */}
            <div
              className="card anim-rise-in"
              style={{
                borderRadius: 22,
                padding: 34,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 28,
                alignItems: 'flex-start',
                boxShadow: '0 12px 40px -28px rgba(40,30,80,.4)',
              }}
            >
              <Avatar profile={sel} size={108} radius={24} fontSize={40} />
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h1 style={{ font: '700 32px var(--display)', letterSpacing: '-.02em', margin: 0 }}>{sel.full_name}</h1>
                  <span style={{ font: '600 12.5px var(--body)', color: 'var(--accent-ink)', background: 'var(--accent-soft)', padding: '4px 11px', borderRadius: 99 }}>
                    {sel.pathName}
                  </span>
                </div>
                {(sel.role || sel.company) && (
                  <div style={{ fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>
                    <strong style={{ fontWeight: 600 }}>{sel.role}</strong>
                    {sel.company ? ` · ${sel.company}` : ''}
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 14, color: 'var(--muted)', marginTop: 10 }}>
                  {sel.location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Pin size={14} />
                      {sel.location}
                    </span>
                  )}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Cap size={14} />
                    {sel.short}, Class of {sel.grad_year}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
                gap: 18,
                marginTop: 18,
                alignItems: 'start',
                animation: 'fadeUp .6s ease both',
                animationDelay: '.1s',
              }}
            >
              {/* left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {sel.about && (
                  <Panel title="About">
                    <p style={{ fontSize: 15.5, lineHeight: 1.65, color: 'var(--ink)', margin: 0 }}>{sel.about}</p>
                  </Panel>
                )}
                {sel.experiences?.length > 0 && (
                  <Panel title="Work experience">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                      {sel.experiences.map((x, i) => (
                        <div key={i} style={{ display: 'flex', gap: 14 }}>
                          <div style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
                          <div>
                            <div style={{ font: '600 15.5px var(--body)', color: 'var(--ink)' }}>{x.title}</div>
                            <div style={{ fontSize: 14, color: 'var(--muted)', margin: '2px 0 6px' }}>
                              {x.company}
                              {x.dates ? ` · ${x.dates}` : ''}
                            </div>
                            {x.desc && <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--muted)' }}>{x.desc}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}
              </div>

              {/* right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Panel title="Education at ZC">
                  <div style={{ font: '700 16px var(--display)', color: 'var(--ink)', marginBottom: 4 }}>{sel.school}</div>
                  <div style={{ fontSize: 14.5, color: 'var(--muted)', marginBottom: 2 }}>{sel.major}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--faint)' }}>{sel.studied}</div>
                </Panel>

                <ContactPanel sel={sel} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="card" style={{ padding: 26 }}>
      <h2 className="section-eyebrow" style={{ marginBottom: 16 }}>{title}</h2>
      {children}
    </div>
  )
}

function ContactRow({ badge, badgeFontSize = 12, children, href }) {
  return (
    <a
      href={href || '#'}
      target={href ? '_blank' : undefined}
      rel={href ? 'noreferrer' : undefined}
      onClick={(e) => !href && e.preventDefault()}
      style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: 'var(--ink)', fontSize: 14.5 }}
    >
      <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-ink)', font: `700 ${badgeFontSize}px var(--display)` }}>
        {badge}
      </span>
      {children}
    </a>
  )
}

function ContactPanel({ sel }) {
  const hasContact = sel.email || sel.phone || sel.linkedin || sel.github || sel.twitter
  if (!hasContact) return null
  return (
    <Panel title="Contact & socials">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sel.email && (
          <ContactRow badge="@" href={`mailto:${sel.email}`}>{sel.email}</ContactRow>
        )}
        {sel.phone && (
          <ContactRow badge="☏" badgeFontSize={13} href={`tel:${sel.phone}`}>{sel.phone}</ContactRow>
        )}
        {sel.linkedin && (
          <ContactRow badge="in" badgeFontSize={11} href={`https://linkedin.com/in/${sel.linkedin}`}>
            LinkedIn · {sel.linkedin}
          </ContactRow>
        )}
        {sel.github && (
          <ContactRow badge="gh" badgeFontSize={11} href={`https://github.com/${sel.github}`}>
            GitHub · {sel.github}
          </ContactRow>
        )}
        {sel.twitter && (
          <ContactRow badge="X" href={`https://x.com/${sel.twitter.replace(/^@/, '')}`}>
            {sel.twitter}
          </ContactRow>
        )}
      </div>
    </Panel>
  )
}

function Centered({ text, link }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--muted)' }}>
      <div style={{ font: '600 18px var(--display)', color: 'var(--ink)', marginBottom: 12 }}>{text}</div>
      {link && (
        <Link to="/browse" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14, borderRadius: 11 }}>
          Back to directory
        </Link>
      )}
    </div>
  )
}
