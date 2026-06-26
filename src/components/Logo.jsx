import { Link } from 'react-router-dom'

// The ZC Network wordmark + lockup. Renders as a link by default (to the
// directory) but can be a plain block via `as="div"`.
export default function Logo({ to = '/', size = 30, fontSize = 18 }) {
  const inner = (
    <>
      <img
        src="/assets/zc-mark.png"
        alt="ZC Network"
        style={{ height: size, width: 'auto', display: 'block' }}
      />
      <span
        style={{
          font: `700 ${fontSize}px var(--display)`,
          color: 'var(--ink)',
          letterSpacing: '-.02em',
        }}
      >
        ZC Network
      </span>
    </>
  )

  return (
    <Link
      to={to}
      style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
    >
      {inner}
    </Link>
  )
}
