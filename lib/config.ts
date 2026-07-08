/**
 * True once the user has created a Supabase project and populated
 * .env.local (see .env.local.example). Until then, /admin renders a setup
 * screen instead of attempting (and crashing on) Supabase calls with empty
 * credentials.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
