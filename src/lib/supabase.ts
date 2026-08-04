import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * True only when both env vars are present and the anon key isn't the
 * placeholder from `.env.example`. When false, the app runs local-only:
 * windows work in-memory but nothing persists or syncs.
 */
export const isConfigured = Boolean(
  url && anonKey && !anonKey.includes('PASTE_') && !anonKey.includes('your-anon')
);

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(url as string, anonKey as string)
  : null;

export const MEDIA_BUCKET = 'desktop-media';
