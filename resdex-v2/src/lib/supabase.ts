// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Keep this module side-effect free (no queries at import time).
// This avoids Vercel/TS issues with PromiseLike.catch and speeds builds.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Don't throw during build; just warn in dev if missing.
if (process.env.NODE_ENV !== 'production') {
  if (!url) console.warn('[supabase] Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!anon) console.warn('[supabase] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(url!, anon!)
// Optional: pass options here if you need auth persistence etc.
// export const supabase = createClient(url!, anon!, { auth: { persistSession: true, autoRefreshToken: true } }) 