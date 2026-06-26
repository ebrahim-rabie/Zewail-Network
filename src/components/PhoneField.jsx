import { useEffect, useMemo, useState } from 'react'
import { COUNTRIES, countryByCode, validateNational, composePhone, parsePhone } from '../lib/phone'

// Phone input: a country-code dropdown + national-number field. Strips the
// leading zero (Egypt edge case), validates length per country, and reports the
// composed E.164 string plus validity to the parent.
export default function PhoneField({ value, onChange, onValidityChange }) {
  const initial = useMemo(() => parsePhone(value), [])
  const [countryCode, setCountryCode] = useState(initial.countryCode)
  const [national, setNational] = useState(initial.national)

  const country = countryByCode(countryCode)
  const { valid, message } = validateNational(countryCode, national)

  // Push composed value + validity up whenever inputs change.
  useEffect(() => {
    onChange(composePhone(countryCode, national))
    onValidityChange?.(valid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, national])

  return (
    <div>
      <label className="field-label">Phone number</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <select
          className="field-input compact select-caret"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          style={{ width: 130, paddingRight: 30, flexShrink: 0 }}
          aria-label="Country code"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} +{c.dial}
            </option>
          ))}
        </select>
        <input
          value={national}
          onChange={(e) => setNational(e.target.value)}
          inputMode="tel"
          placeholder={country.code === 'EG' ? '10X XXX XXXX' : 'National number'}
          className="field-input compact"
          style={{ flex: 1, borderColor: valid ? undefined : 'oklch(0.55 0.18 25)' }}
        />
      </div>
      {!valid && <div style={{ fontSize: 12.5, color: 'oklch(0.72 0.17 25)', marginTop: 6 }}>{message}</div>}
      {valid && national && (
        <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 6 }}>
          Stored as {composePhone(countryCode, national)}
        </div>
      )}
    </div>
  )
}
