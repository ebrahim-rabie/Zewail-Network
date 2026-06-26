// Decorative floating graduate cards behind the hero. Positions, tints and
// timings are ported from the mockup.
const CARDS = [
  { initials: 'YH', name: 'Youssef Hassan', sub: 'SWE · Instabug', hue: 280, left: '5%', top: '15%', r: '-6deg', opacity: 0.62, anim: 'floatA 11s ease-in-out infinite', delay: '-1s', w: 208 },
  { initials: 'AS', name: 'Ahmed Saeed', sub: 'ML Engineer · Google', hue: 200, left: '71%', top: '11%', r: '5deg', opacity: 0.56, anim: 'floatB 13s ease-in-out infinite', delay: '-3s', w: 200 },
  { initials: 'OT', name: 'Omar Tarek', sub: 'Co-founder · Veridian', hue: 250, left: '9%', top: '59%', r: '4deg', opacity: 0.52, anim: 'floatB 12s ease-in-out infinite', delay: '-5s', w: 206 },
  { initials: 'MK', name: 'Mariam Khaled', sub: 'PhD · TU Munich', hue: 330, left: '73%', top: '57%', r: '-5deg', opacity: 0.55, anim: 'floatA 10s ease-in-out infinite', delay: '-2s', w: 202 },
  { initials: 'SM', name: 'Salma Mostafa', sub: 'Analyst · Siemens', hue: 160, left: '2%', top: '38%', r: '3deg', opacity: 0.4, blur: true, anim: 'floatA 14s ease-in-out infinite', delay: '-6s', w: 196 },
  { initials: 'KF', name: 'Karim Fouad', sub: 'Systems · Airbus', hue: 262, left: '80%', top: '33%', r: '-4deg', opacity: 0.4, blur: true, anim: 'floatB 11s ease-in-out infinite', delay: '-4s', w: 196 },
  { initials: 'HA', name: 'Habiba Adel', sub: 'Researcher · KAUST', hue: 300, left: '16%', top: '83%', r: '2deg', opacity: 0.36, blur: true, anim: 'floatA 12s ease-in-out infinite', delay: '-2.5s', w: 196 },
  { initials: 'LA', name: 'Lina Ashraf', sub: 'Designer · Swvl', hue: 340, left: '63%', top: '84%', r: '-3deg', opacity: 0.36, blur: true, anim: 'floatB 13s ease-in-out infinite', delay: '-1.5s', w: 196 },
]

export default function FloatingCards() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {CARDS.map((c) => (
        <div
          key={c.initials}
          style={{
            position: 'absolute',
            left: c.left,
            top: c.top,
            '--r': c.r,
            opacity: c.opacity,
            filter: c.blur ? 'blur(1px)' : undefined,
            animation: c.anim,
            animationDelay: c.delay,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              width: c.w,
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              padding: '12px 16px 12px 12px',
              boxShadow: '0 24px 55px -26px rgba(0,0,0,.8)',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                font: '700 15px var(--display)',
                background: `oklch(0.32 0.075 ${c.hue})`,
                color: `oklch(0.85 0.13 ${c.hue})`,
              }}
            >
              {c.initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: '700 14px var(--display)', whiteSpace: 'nowrap' }}>{c.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{c.sub}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
