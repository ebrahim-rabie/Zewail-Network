import { useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import AuthButtons from '../components/AuthButtons'
import GraduateCard from '../components/GraduateCard'
import { Search } from '../components/Icons'
import { useGraduates } from '../hooks/useGraduates'
import { isSupabaseConfigured } from '../lib/supabase'
import { CAREER_PATHS } from '../lib/profile'
import { SCHOOLS, majorsForSchool } from '../lib/zc'

const selectStyle = {
  borderRadius: 10,
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  padding: '9px 32px 9px 14px',
  font: '500 14px var(--body)',
  color: 'var(--ink)',
  cursor: 'pointer',
  // Fixed width + truncation so long school/major names don't make the control
  // huge or resize it when the selection changes.
  width: 172,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

export default function Browse() {
  const { graduates, loading, error } = useGraduates()
  const [q, setQ] = useState('')
  const [fSchool, setFSchool] = useState('All')
  const [fMajor, setFMajor] = useState('All')
  const [fYear, setFYear] = useState('All')
  const [fLoc, setFLoc] = useState('All')
  const [fPath, setFPath] = useState('All')
  const resultsRef = useRef(null)

  // Major depends on the chosen school (mirrors the profile editor): no school
  // selected → no majors to choose from yet.
  const majors = useMemo(
    () => (fSchool === 'All' ? [] : majorsForSchool(fSchool)),
    [fSchool]
  )
  const years = useMemo(
    () => [...new Set(graduates.map((g) => g.grad_year).filter(Boolean))].sort((a, b) => b - a),
    [graduates]
  )
  const locs = useMemo(
    () => [...new Set(graduates.map((g) => g.location).filter(Boolean))].sort(),
    [graduates]
  )

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return graduates.filter((g) => {
      if (fSchool !== 'All' && g.school !== fSchool) return false
      if (fMajor !== 'All' && g.major !== fMajor) return false
      if (fYear !== 'All' && String(g.grad_year) !== String(fYear)) return false
      if (fLoc !== 'All' && g.location !== fLoc) return false
      if (fPath !== 'All' && g.career_path !== fPath) return false
      if (needle) {
        const hay = `${g.full_name} ${g.role} ${g.company} ${g.major}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
  }, [graduates, q, fSchool, fMajor, fYear, fLoc, fPath])

  const clearF = () => {
    setQ('')
    setFSchool('All')
    setFMajor('All')
    setFYear('All')
    setFLoc('All')
    setFPath('All')
  }

  // Changing school invalidates a major that doesn't belong to it.
  const onSchool = (value) => {
    setFSchool(value)
    if (value !== 'All' && !majorsForSchool(value).includes(fMajor)) setFMajor('All')
  }

  const scrollResults = () => {
    const el = resultsRef.current
    if (el) window.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' })
  }

  return (
    <div>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '20px 28px',
        }}
      >
        <Logo />
        <AuthButtons />
      </header>

      {/* hero */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '72px 24px 40px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 99,
            background: 'var(--accent-soft)',
            color: 'var(--accent-ink)',
            font: '600 13px var(--body)',
            marginBottom: 24,
            animation: 'riseIn .6s ease both',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent)', animation: 'pulseDot 2.4s ease-in-out infinite' }} />
          Zewail City alumni &amp; graduates
        </div>
        <h1
          style={{
            font: '700 clamp(40px,6vw,68px)/1.02 var(--display)',
            letterSpacing: '-.03em',
            margin: '0 0 18px',
            animation: 'riseIn .6s ease both',
            animationDelay: '.06s',
          }}
        >
          Find the people
          <br />
          <span
            className="gradient-text"
            style={{
              backgroundImage:
                'linear-gradient(90deg,var(--accent),oklch(0.7 0.16 285),var(--accent))',
            }}
          >
            behind the science.
          </span>
        </h1>
        <p
          style={{
            fontSize: 19,
            lineHeight: 1.55,
            color: 'var(--muted)',
            maxWidth: 560,
            margin: '0 auto 36px',
            animation: 'riseIn .6s ease both',
            animationDelay: '.12s',
          }}
        >
          A directory of ZC graduates — where they studied, what they're building, and how to reach
          them. Browse freely, no account needed.
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 16,
            padding: '8px 8px 8px 18px',
            maxWidth: 560,
            margin: '0 auto',
            boxShadow: '0 8px 30px -16px rgba(40,30,80,.25)',
            animation: 'riseIn .6s ease both',
            animationDelay: '.18s',
          }}
        >
          <Search size={20} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, role, company, or major"
            style={{ flex: 1, border: 'none', background: 'none', fontSize: 16, color: 'var(--ink)', padding: '8px 0' }}
          />
          <button onClick={scrollResults} className="btn btn-primary" style={{ padding: '11px 22px', fontSize: 15, borderRadius: 11 }}>
            Search
          </button>
        </div>
      </section>

      {/* filter bar */}
      <div ref={resultsRef} style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 24px 0' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
            paddingBottom: 22,
            borderBottom: '1px solid var(--line)',
          }}
        >
          <span style={{ font: '600 13px var(--body)', color: 'var(--faint)', marginRight: 2 }}>Filter</span>
          <select className="select-caret" value={fSchool} onChange={(e) => onSchool(e.target.value)} style={selectStyle}>
            <option value="All">All schools</option>
            {SCHOOLS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="select-caret"
            value={fMajor}
            onChange={(e) => setFMajor(e.target.value)}
            disabled={fSchool === 'All'}
            title={fSchool === 'All' ? 'Pick a school first' : undefined}
            style={{ ...selectStyle, opacity: fSchool === 'All' ? 0.5 : 1, cursor: fSchool === 'All' ? 'not-allowed' : 'pointer' }}
          >
            <option value="All">All majors</option>
            {majors.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select className="select-caret" value={fYear} onChange={(e) => setFYear(e.target.value)} style={selectStyle}>
            <option value="All">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>Class of {y}</option>
            ))}
          </select>
          <select className="select-caret" value={fLoc} onChange={(e) => setFLoc(e.target.value)} style={selectStyle}>
            <option value="All">All locations</option>
            {locs.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select className="select-caret" value={fPath} onChange={(e) => setFPath(e.target.value)} style={selectStyle}>
            <option value="All">All career paths</option>
            {CAREER_PATHS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <button onClick={clearF} style={{ marginLeft: 'auto', background: 'none', border: 'none', font: '600 13px var(--body)', color: 'var(--accent-ink)', cursor: 'pointer' }}>
            Clear all
          </button>
        </div>
        <div style={{ padding: '20px 0 4px', font: '500 14px var(--body)', color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--ink)' }}>{filtered.length}</strong> graduates
        </div>
      </div>

      {/* grid */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '8px 24px 64px' }}>
        {!isSupabaseConfigured ? (
          <SetupNotice />
        ) : loading ? (
          <EmptyMessage title="Loading graduates…" subtitle="" />
        ) : error ? (
          <EmptyMessage
            title="Couldn't load the directory"
            subtitle="Check your Supabase connection and the directory_profiles view."
          />
        ) : filtered.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(264px,1fr))',
              gap: 18,
              animation: 'fadeUp .6s ease both',
            }}
          >
            {filtered.map((g) => (
              <GraduateCard key={g.id} g={g} />
            ))}
          </div>
        ) : graduates.length === 0 ? (
          <EmptyMessage
            title="No graduates yet"
            subtitle="Approved members will appear here once the admin reviews applications."
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '72px 24px', color: 'var(--muted)' }}>
            <div style={{ font: '600 19px var(--display)', color: 'var(--ink)', marginBottom: 8 }}>
              No graduates match those filters
            </div>
            <div style={{ fontSize: 15, marginBottom: 20 }}>Try widening your search.</div>
            <button onClick={clearF} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14, borderRadius: 11 }}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            padding: '40px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/assets/zc-mark.png" alt="ZC Network" style={{ height: 27, width: 'auto', display: 'block' }} />
            <span style={{ font: '600 15px var(--body)', color: 'var(--muted)' }}>
              ZC Network · A graduate directory for Zewail City
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>Are you a ZC graduate?</span>
            <Link to="/signup" style={{ background: 'var(--accent-soft)', border: 'none', borderRadius: 10, padding: '9px 16px', font: '600 14px var(--body)', color: 'var(--accent-ink)', cursor: 'pointer', textDecoration: 'none' }}>
              Apply to join →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function EmptyMessage({ title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '72px 24px', color: 'var(--muted)' }}>
      <div style={{ font: '600 19px var(--display)', color: 'var(--ink)', marginBottom: 8 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 15 }}>{subtitle}</div>}
    </div>
  )
}

function SetupNotice() {
  return (
    <div className="card" style={{ padding: 28, maxWidth: 620, margin: '40px auto', textAlign: 'center' }}>
      <div style={{ font: '700 19px var(--display)', marginBottom: 10 }}>Connect Supabase to load the directory</div>
      <div style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.6 }}>
        Copy <code>.env.example</code> to <code>.env</code>, set your{' '}
        <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, run the SQL in{' '}
        <code>supabase/schema.sql</code>, then restart the dev server.
      </div>
    </div>
  )
}
