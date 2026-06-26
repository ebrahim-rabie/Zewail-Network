/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // The design's palette is exposed as CSS variables in index.css.
      // We surface them here so Tailwind utilities (bg-surface, text-muted, …)
      // map onto the exact same tokens used throughout the mockup.
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        line: 'var(--line)',
        line2: 'var(--line2)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'accent-ink': 'var(--accent-ink)',
        pub: 'var(--pub)',
        'pub-soft': 'var(--pub-soft)',
        priv: 'var(--priv)',
        'priv-soft': 'var(--priv-soft)',
      },
      fontFamily: {
        body: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
