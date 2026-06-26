// Public/Private visibility pill used beside each editable profile field.
export default function PrivacyToggle({ isPublic, onToggle, padding = '4px 10px' }) {
  const col = isPublic ? 'var(--pub)' : 'var(--priv)'
  const bg = isPublic ? 'var(--pub-soft)' : 'var(--priv-soft)'
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        border: '1px solid var(--line)',
        borderRadius: 99,
        padding,
        font: '600 11.5px var(--body)',
        cursor: 'pointer',
        color: col,
        background: bg,
      }}
    >
      <span
        style={{ width: 7, height: 7, borderRadius: 99, background: col, display: 'inline-block' }}
      />
      {isPublic ? 'Public' : 'Private'}
    </button>
  )
}
