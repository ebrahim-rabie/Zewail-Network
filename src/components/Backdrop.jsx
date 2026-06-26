// Fixed ambient backdrop that sits behind every screen: a slowly panning grid,
// drifting colored glows, and floating points of light. Ported from the mockup.
export default function Backdrop() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-80px',
          backgroundImage:
            'linear-gradient(oklch(0.6 0.03 280/.055) 1px,transparent 1px),linear-gradient(90deg,oklch(0.6 0.03 280/.055) 1px,transparent 1px)',
          backgroundSize: '58px 58px',
          animation: 'gridPan 38s linear infinite',
          WebkitMaskImage:
            'radial-gradient(125% 95% at 50% 22%,#000 32%,transparent 82%)',
          maskImage: 'radial-gradient(125% 95% at 50% 22%,#000 32%,transparent 82%)',
        }}
      />
      <Glow style={{ top: -200, left: -160, width: 600, height: 600, color: 'oklch(0.62 0.16 218/.22)', blur: 60, anim: 'glowDrift 22s ease-in-out infinite' }} />
      <Glow style={{ top: -120, right: -180, width: 560, height: 560, color: 'oklch(0.56 0.18 285/.2)', blur: 64, anim: 'glowDrift2 26s ease-in-out infinite' }} />
      <Glow style={{ bottom: -220, left: '22%', width: 560, height: 560, color: 'oklch(0.6 0.16 150/.16)', blur: 66, anim: 'glowDrift 30s ease-in-out infinite', delay: '-10s' }} />
      <Glow style={{ bottom: -160, right: '6%', width: 480, height: 480, color: 'oklch(0.58 0.17 262/.16)', blur: 62, anim: 'glowDrift2 34s ease-in-out infinite', delay: '-6s' }} />
      <Glow style={{ top: '34%', left: '40%', width: 420, height: 420, color: 'oklch(0.6 0.15 330/.1)', blur: 70, anim: 'glowDrift 28s ease-in-out infinite', delay: '-14s' }} />

      <Dot style={{ left: '13%', top: '24%', size: 7, color: 'oklch(0.72 0.14 218)', anim: 'floatA 15s ease-in-out infinite', delay: '-2s', opacity: 0.55 }} />
      <Dot style={{ left: '84%', top: '30%', size: 5, color: 'oklch(0.7 0.15 285)', anim: 'floatB 19s ease-in-out infinite', delay: '-6s', opacity: 0.5 }} />
      <Dot style={{ left: '22%', top: '70%', size: 6, color: 'oklch(0.72 0.14 150)', anim: 'floatB 17s ease-in-out infinite', delay: '-9s', opacity: 0.5 }} />
      <Dot style={{ left: '74%', top: '74%', size: 8, color: 'oklch(0.7 0.14 262)', anim: 'floatA 21s ease-in-out infinite', delay: '-4s', opacity: 0.5 }} />
      <Dot style={{ left: '48%', top: '16%', size: 4, color: 'oklch(0.74 0.13 218)', anim: 'floatA 23s ease-in-out infinite', delay: '-12s', opacity: 0.45 }} />
      <Dot style={{ left: '6%', top: '52%', size: 5, color: 'oklch(0.72 0.14 330)', anim: 'floatB 18s ease-in-out infinite', delay: '-7s', opacity: 0.45 }} />
    </div>
  )
}

function Glow({ style }) {
  const { top, left, right, bottom, width, height, color, blur, anim, delay } = style
  return (
    <div
      style={{
        position: 'absolute',
        top, left, right, bottom, width, height,
        borderRadius: '50%',
        background: `radial-gradient(circle,${color},transparent 68%)`,
        filter: `blur(${blur}px)`,
        animation: anim,
        animationDelay: delay,
      }}
    />
  )
}

function Dot({ style }) {
  const { left, top, size, color, anim, delay, opacity } = style
  return (
    <div
      style={{
        position: 'absolute',
        left, top,
        width: size, height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${size * 2.5}px ${size * 0.7}px ${color.replace(')', '/.45)')}`,
        opacity,
        animation: anim,
        animationDelay: delay,
      }}
    />
  )
}
