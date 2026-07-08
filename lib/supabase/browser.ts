import { createBrowserClient } from "@supabase/ssr";

/**
 * Anon-key client for the browser. Used only inside the admin app (login
 * form, direct-to-Storage uploads) — the public site never calls Supabase
 * client-side.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
