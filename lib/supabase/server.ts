import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Anon-key, cookie-aware client for Server Components/Actions that need to
 * know the current signed-in user (e.g. "who is logged into /admin right
 * now"). Not used for data reads/writes — those go through
 * `lib/supabase/service.ts`, which bypasses RLS entirely.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — session refresh is
            // handled by middleware.ts instead, so this is safe to ignore.
          }
        },
      },
    }
  );
}
