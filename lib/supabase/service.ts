import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS entirely. This is the primary trusted
 * path for BOTH public storefront reads (with explicit
 * `publish_status = 'published'` filters applied in every query) and admin
 * CRUD (with role checks enforced in `lib/auth/require-role.ts` before any
 * write). `import "server-only"` makes it a build-time error to ever import
 * this from a Client Component.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
