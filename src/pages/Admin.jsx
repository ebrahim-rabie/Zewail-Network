import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Check, Search } from '../components/Icons'
import { useAuth } from '../context/AuthContext'
import AdminProfileModal from '../components/AdminProfileModal'
import { initials, avatarTint, majorShort } from '../lib/profile'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Admin() {
  const navigate = useNavigate()
  const { profile: me } = useAuth()
  const [tab, setTab] = useState('pending')
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState(null) // row shown in the full-profile modal

  const load = useCallback(async () => {
    setLoading(true)
    // Pending queue = brand-new accounts (status 'pending') + approved members
    // who have a staged edit (pending_review = true).
    const [p, a] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .or('status.eq.pending,pending_review.eq.true')
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('*')
        .in('status', ['approved', 'suspended'])
        .order('full_name', { ascending: true }),
    ])
    if (p.error || a.error) setError((p.error || a.error).message)
    else setError('')
    setPending(p.data || [])
    setApproved(a.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setStatus = async (id, status) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  // Approve a queue item: apply the staged draft for an edit, else approve the
  // new account.
  const approveItem = async (row) => {
    const { error } = row.pending_review
      ? await supabase.rpc('admin_apply_draft', { target: row.id })
      : await supabase.from('profiles').update({ status: 'approved' }).eq('id', row.id)
    if (error) setError(error.message)
    else load()
  }

  // Reject a queue item: discard the draft for an edit, else reject the account.
  const rejectItem = async (row) => {
    const { error } = row.pending_review
      ? await supabase.from('profiles').update({ pending_review: false, draft: null }).eq('id', row.id)
      : await supabase.from('profiles').update({ status: 'rejected' }).eq('id', row.id)
    if (error) setError(error.message)
    else load()
  }

  const remove = async (row) => {
    if (!window.confirm('Permanently remove this member and their account? This cannot be undone.')) return
    // Best-effort: delete their avatar files from Storage first to reclaim space.
    if (row.user_id) {
      try {
        const { data: files } = await supabase.storage.from('avatars').list(row.user_id)
        if (files?.length) {
          await supabase.storage.from('avatars').remove(files.map((f) => `${row.user_id}/${f.name}`))
        }
      } catch {
        /* non-fatal — proceed with account removal regardless */
      }
    }
    // RPC deletes the auth user too (cascades to the profile), so the person
    // can't get stuck on a half-deleted account and can re-register later.
    const { error } = await supabase.rpc('admin_remove_member', { target: row.id })
    if (error) setError(error.message)
    else load()
  }

  const match = (r) => {
    const n = query.trim().toLowerCase()
    if (!n) return true
    return `${r.full_name || ''} ${r.email || ''} ${r.major || ''}`.toLowerCase().includes(n)
  }
  const pendingShown = useMemo(() => pending.filter(match), [pending, query])
  const approvedShown = useMemo(() => approved.filter(match), [approved, query])

  return (
    <div style={{ minHeight: '100vh' }}>
      <AdminProfileModal
        row={preview}
        onClose={() => setPreview(null)}
        onApprove={preview && (preview.status === 'pending' || preview.pending_review) ? approveItem : undefined}
        onReject={preview && (preview.status === 'pending' || preview.pending_review) ? rejectItem : undefined}
      />
      <header style={{ background: 'oklch(0.255 0.02 280)', color: 'var(--ink)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/assets/zc-mark.png" alt="ZC Network" style={{ height: 27, width: 'auto', display: 'block' }} />
            <span style={{ font: '700 16px var(--display)' }}>ZC Network</span>
            <span style={{ font: '600 11px var(--body)', background: 'rgba(255,255,255,.14)', padding: '3px 9px', borderRadius: 99, letterSpacing: '.04em' }}>ADMIN</span>
          </div>
          <button onClick={() => navigate('/browse')} style={{ background: 'rgba(255,255,255,.12)', border: 'none', borderRadius: 10, padding: '8px 16px', font: '600 13px var(--body)', color: '#fff', cursor: 'pointer' }}>
            Exit
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px 72px' }}>
        <h1 style={{ font: '700 26px var(--display)', letterSpacing: '-.02em', margin: '0 0 4px', animation: 'riseIn .6s ease both' }}>Member management</h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', margin: '0 0 20px' }}>Review applications and manage approved graduates.</p>

        {/* search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '8px 14px', maxWidth: 420, marginBottom: 22 }}>
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or major"
            style={{ flex: 1, border: 'none', background: 'none', fontSize: 14.5, color: 'var(--ink)', padding: '4px 0' }}
          />
          {query && (
            <button onClick={() => setQuery('')} title="Clear" style={{ background: 'none', border: 'none', color: 'var(--faint)', cursor: 'pointer', fontSize: 16 }}>×</button>
          )}
        </div>

        {error && <div style={{ fontSize: 13.5, color: 'oklch(0.7 0.17 25)', marginBottom: 16 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--line)', marginBottom: 22 }}>
          <TabBtn active={tab === 'pending'} onClick={() => setTab('pending')}>
            Pending
            <span style={{ font: '700 11px var(--body)', background: 'var(--accent-soft)', color: 'var(--accent-ink)', padding: '2px 8px', borderRadius: 99, marginLeft: 8 }}>
              {pending.length}
            </span>
          </TabBtn>
          <TabBtn active={tab === 'approved'} onClick={() => setTab('approved')} padded>
            Approved
          </TabBtn>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', color: 'var(--muted)' }}>Loading…</div>
        ) : tab === 'pending' ? (
          pendingShown.length > 0 ? (
            <div className="card anim-fade-up" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <GridHead cols="1.7fr 1.2fr 1.7fr 1.2fr 1.7fr" items={['Name', 'Type', 'Major', 'Submitted', '']} />
              {pendingShown.map((p) => {
                const isEdit = p.pending_review
                const major = isEdit ? p.draft?.major || p.major : p.major
                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.2fr 1.7fr 1.2fr 1.7fr', gap: 12, padding: '16px 22px', borderTop: '1px solid var(--line)', alignItems: 'center' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ font: '600 14.5px var(--body)', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.full_name || '—'}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--faint)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.email}</div>
                    </div>
                    <span style={isEdit ? tagEdit : tagNew}>{isEdit ? 'Edit' : 'New account'}</span>
                    <span style={{ fontSize: 13.5, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{major || '—'}</span>
                    <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{fmtDate(isEdit ? p.updated_at : p.created_at)}</span>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => setPreview(p)} style={btnReject}>View</button>
                      <button onClick={() => rejectItem(p)} style={btnReject}>{isEdit ? 'Discard' : 'Reject'}</button>
                      <button onClick={() => approveItem(p)} style={btnApprove}>Approve</button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : pending.length > 0 ? (
            <NoMatches />
          ) : (
            <EmptyPending />
          )
        ) : (
          <div className="card anim-fade-up" style={{ borderRadius: 16, overflow: 'hidden' }}>
            <GridHead cols="2.4fr 1.8fr 1fr 1.8fr" items={['Name', 'Major', 'Class', '']} />
            {approved.length === 0 ? (
              <div style={{ padding: '40px 22px', color: 'var(--muted)', fontSize: 14.5 }}>No approved members yet.</div>
            ) : approvedShown.length === 0 ? (
              <NoMatches />
            ) : (
              approvedShown.map((a) => {
                const tint = avatarTint(a)
                return (
                  <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.8fr 1fr 1.8fr', gap: 12, padding: '14px 22px', borderTop: '1px solid var(--line)', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 13px var(--display)', background: tint.bg, color: tint.ink }}>
                        {initials(a.full_name)}
                      </div>
                      <span style={{ font: '600 14.5px var(--body)', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.full_name}
                        {a.status === 'suspended' && (
                          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--faint)' }}>(suspended)</span>
                        )}
                        {a.pending_review && (
                          <span style={{ marginLeft: 8, fontSize: 11, color: 'oklch(0.8 0.13 85)' }}>· edit pending</span>
                        )}
                      </span>
                    </div>
                    <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{a.major_short || majorShort(a.major)}</span>
                    <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{a.grad_year || '—'}</span>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => setPreview(a)} style={btnReject}>View</button>
                      {a.id === me?.id ? (
                        <span style={{ fontSize: 12.5, color: 'var(--faint)', fontWeight: 600, alignSelf: 'center' }}>You</span>
                      ) : (
                        <>
                          <button
                            onClick={() => setStatus(a.id, a.status === 'suspended' ? 'approved' : 'suspended')}
                            style={btnReject}
                          >
                            {a.status === 'suspended' ? 'Restore' : 'Suspend'}
                          </button>
                          <button onClick={() => remove(a)} style={btnRemove}>Remove</button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, children, padded }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
        padding: padded ? '11px 16px' : '11px 4px',
        marginBottom: -1,
        font: '600 14.5px var(--body)',
        color: active ? 'var(--ink)' : 'var(--muted)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {children}
    </button>
  )
}

function GridHead({ cols, items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, padding: '13px 22px', background: 'var(--line2)', font: '600 12px var(--body)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
      {items.map((it, i) => (
        <span key={i}>{it}</span>
      ))}
    </div>
  )
}

function NoMatches() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, color: 'var(--muted)', fontSize: 14.5 }}>
      No members match your search.
    </div>
  )
}

function EmptyPending() {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--pub-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--pub)' }}>
        <Check size={26} color="var(--pub)" />
      </div>
      <div style={{ font: '600 18px var(--display)', color: 'var(--ink)', marginBottom: 6 }}>All caught up</div>
      <div style={{ fontSize: 14.5, color: 'var(--muted)' }}>No pending applications right now.</div>
    </div>
  )
}

const btnReject = {
  border: '1px solid var(--line)',
  background: 'var(--surface)',
  borderRadius: 9,
  padding: '7px 13px',
  font: '600 13px var(--body)',
  color: 'var(--muted)',
  cursor: 'pointer',
}
const btnApprove = {
  border: 'none',
  background: 'var(--pub)',
  borderRadius: 9,
  padding: '7px 14px',
  font: '600 13px var(--body)',
  color: '#fff',
  cursor: 'pointer',
}
const btnRemove = {
  border: '1px solid oklch(0.5 0.12 25)',
  background: 'var(--surface)',
  borderRadius: 9,
  padding: '7px 13px',
  font: '600 13px var(--body)',
  color: 'oklch(0.72 0.17 25)',
  cursor: 'pointer',
}

const tagBase = {
  display: 'inline-block',
  font: '600 11.5px var(--body)',
  padding: '3px 10px',
  borderRadius: 99,
  justifySelf: 'start',
}
const tagNew = { ...tagBase, background: 'var(--accent-soft)', color: 'var(--accent-ink)' }
const tagEdit = { ...tagBase, background: 'oklch(0.34 0.08 85)', color: 'oklch(0.85 0.13 85)' }
