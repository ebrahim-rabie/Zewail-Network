import { useState } from 'react'
import { supabase } from '../lib/supabase'

// "Useful links" panel on a graduate's profile.
//  - Everyone sees it ONLY when it has links (otherwise it renders nothing).
//  - Admins see it always, with inline editing, and can add/remove links
//    (e.g. a YouTube link for the student's ZC podcast episode).
export default function UsefulLinks({ profileId, initialLinks = [], isAdmin }) {
  const [links, setLinks] = useState(initialLinks)
  const [draft, setDraft] = useState(initialLinks)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Non-admins with no links: render nothing at all.
  if (!isAdmin && links.length === 0) return null

  const startEdit = () => { setDraft(links.length ? links : [{ label: '', url: '' }]); setEditing(true); setError('') }
  const setRow = (i, k, v) => setDraft((d) => d.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  const addRow = () => setDraft((d) => [...d, { label: '', url: '' }])
  const removeRow = (i) => setDraft((d) => d.filter((_, j) => j !== i))

  const save = async () => {
    setSaving(true)
    setError('')
    // Drop empty rows and normalize URLs (add https:// if the admin omitted it).
    const cleaned = draft
      .map((r) => ({ label: r.label.trim(), url: r.url.trim() }))
      .filter((r) => r.url)
      .map((r) => ({ ...r, url: /^https?:\/\//i.test(r.url) ? r.url : `https://${r.url}` }))
    const { error } = await supabase.from('profiles').update({ links: cleaned }).eq('id', profileId)
    setSaving(false)
    if (error) { setError(error.message); return }
    setLinks(cleaned)
    setEditing(false)
  }

  return (
    <div className="card" style={{ padding: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 className="section-eyebrow" style={{ margin: 0 }}>Useful links</h2>
        {isAdmin && !editing && (
          <button onClick={startEdit} style={adminBtn}>{links.length ? 'Edit' : '+ Add links'}</button>
        )}
      </div>

      {!editing ? (
        links.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {links.map((l, i) => (
              <LinkRow key={i} link={l} />
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--faint)', margin: 0 }}>
            No links yet. As an admin you can add resources like a ZC Podcast episode.
          </p>
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {draft.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={r.label} onChange={(e) => setRow(i, 'label', e.target.value)} placeholder="Label (e.g. ZC Podcast)" className="field-input compact" style={{ width: 160 }} />
              <input value={r.url} onChange={(e) => setRow(i, 'url', e.target.value)} placeholder="https://youtube.com/…" className="field-input compact" style={{ flex: 1, minWidth: 140 }} />
              <button onClick={() => removeRow(i)} title="Remove" style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--line2)', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>×</button>
            </div>
          ))}
          <button onClick={addRow} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', font: '600 13px var(--body)', color: 'var(--accent-ink)', cursor: 'pointer', padding: 0 }}>
            + Add another
          </button>
          {error && <div style={{ fontSize: 12.5, color: 'oklch(0.72 0.17 25)' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={save} disabled={saving} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 9 }}>
              {saving ? 'Saving…' : 'Save links'}
            </button>
            <button onClick={() => setEditing(false)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 9 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function LinkRow({ link }) {
  let host = ''
  try { host = new URL(link.url).hostname.replace(/^www\./, '') } catch { host = link.url }
  const isYouTube = /youtube\.com|youtu\.be/i.test(link.url)
  return (
    <a href={link.url} target="_blank" rel="noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: 'var(--ink)', fontSize: 14.5 }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-ink)', font: '700 11px var(--display)', flexShrink: 0 }}>
        {isYouTube ? '▶' : '↗'}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ fontWeight: 600 }}>{link.label || host}</span>
        {link.label && <span style={{ color: 'var(--faint)', fontSize: 13 }}> · {host}</span>}
      </span>
    </a>
  )
}

const adminBtn = {
  background: 'var(--accent-soft)',
  border: 'none',
  borderRadius: 8,
  padding: '5px 11px',
  font: '600 12px var(--body)',
  color: 'var(--accent-ink)',
  cursor: 'pointer',
}
