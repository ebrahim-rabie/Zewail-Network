import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import FloatingCards from '../components/FloatingCards'
import AuthButtons from '../components/AuthButtons'
import { ArrowRight } from '../components/Icons'
import { useGraduates } from '../hooks/useGraduates'

export default function Welcome() {
  const navigate = useNavigate()
  const { graduates } = useGraduates()

  // Live stats when the directory has data; otherwise the mockup's headline numbers.
  const gradCount = graduates.length || 128
  const majorCount = new Set(graduates.map((g) => g.major)).size || 8
  const companyCount = new Set(graduates.map((g) => g.company).filter(Boolean)).size

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background:
          'radial-gradient(120% 90% at 50% -10%,oklch(0.23 0.04 260) 0%,var(--bg) 55%)',
      }}
    >
      {/* dynamic glow blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-12%', left: '-6%', width: '46vw', height: '46vw', borderRadius: '50%', background: 'radial-gradient(circle,oklch(0.6 0.16 218/.5),transparent 68%)', filter: 'blur(40px)', animation: 'glowDrift 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-18%', right: '-8%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle,oklch(0.55 0.18 285/.42),transparent 68%)', filter: 'blur(46px)', animation: 'glowDrift2 22s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '30%', right: '24%', width: '28vw', height: '28vw', borderRadius: '50%', background: 'radial-gradient(circle,oklch(0.6 0.16 150/.28),transparent 70%)', filter: 'blur(50px)', animation: 'glowDrift 26s ease-in-out infinite', animationDelay: '-8s' }} />
      </div>

      <FloatingCards />

      {/* top bar */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '20px 28px',
          animation: 'fadeUp .7s ease both',
        }}
      >
        <Logo to="/" />
        <AuthButtons />
      </header>

      {/* hero content */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '24px 24px 72px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            padding: '7px 16px',
            borderRadius: 99,
            background: 'var(--accent-soft)',
            color: 'var(--accent-ink)',
            font: '600 13px var(--body)',
            marginBottom: 28,
            animation: 'riseIn .7s ease both',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent)', animation: 'pulseDot 2.4s ease-in-out infinite' }} />
          The Zewail City alumni network
        </div>

        <h1
          style={{
            font: '700 clamp(46px,8vw,88px)/1.0 var(--display)',
            letterSpacing: '-.035em',
            margin: 0,
            animation: 'riseIn .8s ease both',
            animationDelay: '.08s',
          }}
        >
          Welcome to
          <br />
          <span
            className="gradient-text"
            style={{
              backgroundImage:
                'linear-gradient(90deg,var(--ink),var(--accent),oklch(0.7 0.16 285),var(--ink))',
            }}
          >
            ZC Network
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px,2.1vw,20px)',
            lineHeight: 1.6,
            color: 'var(--muted)',
            maxWidth: 560,
            margin: '24px 0 0',
            animation: 'riseIn .8s ease both',
            animationDelay: '.18s',
          }}
        >
          Where Zewail City graduates stay connected — discover where they studied, what they're
          building, and how to reach them.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 13,
            marginTop: 38,
            animation: 'riseIn .8s ease both',
            animationDelay: '.28s',
          }}
        >
          <button
            onClick={() => navigate('/browse')}
            className="btn btn-primary"
            style={{ padding: '15px 28px', fontSize: 16, borderRadius: 13, boxShadow: '0 16px 40px -16px var(--accent)' }}
          >
            Browse the directory
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="btn btn-ghost"
            style={{ padding: '15px 26px', fontSize: 16, borderRadius: 13 }}
          >
            Join the network
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px 28px',
            marginTop: 48,
            animation: 'fadeUp 1s ease both',
            animationDelay: '.4s',
          }}
        >
          <Stat value={gradCount} label="graduates" />
          <Divider />
          <Stat value={majorCount} label="majors" />
          <Divider />
          <Stat value={companyCount ? `${companyCount}+` : '30+'} label="companies & labs" />
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ font: '700 26px var(--display)', color: 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 12.5, color: 'var(--faint)', letterSpacing: '.03em' }}>{label}</div>
    </div>
  )
}

function Divider() {
  return <div style={{ width: 1, height: 30, background: 'var(--line)' }} />
}
