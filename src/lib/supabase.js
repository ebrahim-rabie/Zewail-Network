import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Surface a clear console warning instead of a cryptic runtime crash when the
// project hasn't been configured yet. `isSupabaseConfigured` lets the UI degrade
// gracefully (empty directory + a setup hint) rather than throwing.
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[ZC Network] Supabase is not configured. Copy .env.example to .env and set ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(
  url || 'http://localhost:54321',
  anonKey || 'public-anon-key'
)
