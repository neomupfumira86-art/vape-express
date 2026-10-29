import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY, hasBackend } from '../lib/backend.js';

// Invite and password-reset emails land on /admin#...&type=invite|recovery.
// Read it before the client consumes and clears the URL hash.
export const arrivedVia = /[#&]type=(invite|recovery)/.exec(window.location.hash)?.[1] ?? null;

// Only the public (anon / publishable) key is ever used in the browser.
// Admin rights come from the signed-in account plus the database's RLS policies.
export const supabase = hasBackend
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit', storageKey: 'vx-admin-auth' },
    })
  : null;

export const BUCKET = 'product-images';
