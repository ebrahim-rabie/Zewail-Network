import { CAREER_PATHS } from '../lib/profile'
import { MONTHS, YEARS, isFuture, comparePoint } from '../lib/dates'

const cellInput = { borderRadius: 10, padding: '10px 13px', fontSize: 14 }
const smallSelect = { borderRadius: 10, padding: '9px 28px 9px 12px', fontSize: 13.5 }

// One work-experience card in the editor: title, company, per-entry career path,
// month/year start & end (with a "Present" toggle), and description.
export default function ExperienceEditor({ exp, index, onChange, onRemove }) {
  const set = (k, v) => onChange(index, { ...exp, [k]: v })

  const startFuture = isFuture(exp.startMonth, exp.startYear)
  const endFuture = !exp.present && isFuture(exp.endMonth, exp.endYear)
  const endBeforeStart =
    !exp.present &&
    exp.startYear !== '' && exp.startYear != null &&
    exp.endYear !== '' && exp.endYear != null &&
    comparePoint(exp.endMonth, exp.endYear, exp.startMonth, exp.startYear) < 0

  const warning = startFuture || endFuture
    ? "Dates can't be in the future."
    : endBeforeStart
      ? 'End date is before the start date.'
      : ''

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 18, position: 'relative' }}>
      <button
        onClick={() => onRemove(index)}
        title="Remove experience"
        style={{ position: 'absolute', top: 12, right: 12, width: 26, height: 26, borderRadius: 8, border: 'none', background: 'var(--line2)', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
      >
        ×
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 12, paddingRight: 28 }}>
        <input value={exp.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="Job title" className="field-input compact" style={cellInput} />
        <input value={exp.company || ''} onChange={(e) => set('company', e.target.value)} placeholder="Company" className="field-input compact" style={cellInput} />
        <div>
          <select
            className="field-input compact select-caret"
            value={exp.path || 'job'}
            onChange={(e) => set('path', e.target.value)}
            style={{ ...cellInput, paddingRight: 30, width: '100%' }}
            aria-label="Career path for this role"
          >
            {CAREER_PATHS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* date range */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end', marginBottom: 12 }}>
        <DateGroup
          label="Start"
          month={exp.startMonth}
          year={exp.startYear}
          onMonth={(v) => set('startMonth', v)}
          onYear={(v) => set('startYear', v)}
        />
        {!exp.present && (
          <DateGroup
            label="End"
            month={exp.endMonth}
            year={exp.endYear}
            onMonth={(v) => set('endMonth', v)}
            onYear={(v) => set('endYear', v)}
          />
        )}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5, color: 'var(--muted)', cursor: 'pointer', paddingBottom: 10 }}>
          <input
            type="checkbox"
            checked={!!exp.present}
            onChange={(e) => set('present', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
          />
          I currently work here (Present)
        </label>
      </div>

      {warning && <div style={{ fontSize: 12.5, color: 'oklch(0.72 0.17 25)', marginBottom: 10 }}>{warning}</div>}

      <textarea
        rows={2}
        value={exp.desc || ''}
        onChange={(e) => set('desc', e.target.value)}
        placeholder="What did you do?"
        className="field-input compact"
        style={{ borderRadius: 10, padding: '10px 13px', fontSize: 14, resize: 'vertical', lineHeight: 1.5 }}
      />
    </div>
  )
}

function DateGroup({ label, month, year, onMonth, onYear }) {
  return (
    <div>
      <label style={{ display: 'block', font: '600 12px var(--body)', color: 'var(--faint)', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', gap: 6 }}>
        <select className="field-input compact select-caret" value={month ?? ''} onChange={(e) => onMonth(e.target.value)} style={{ ...smallSelect, width: 84 }} aria-label={`${label} month`}>
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i}>{m}</option>
          ))}
        </select>
        <select className="field-input compact select-caret" value={year ?? ''} onChange={(e) => onYear(e.target.value)} style={{ ...smallSelect, width: 88 }} aria-label={`${label} year`}>
          <option value="">Year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
