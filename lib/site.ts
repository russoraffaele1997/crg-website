/**
 * Canonical public address of the site. Every other host serving the same
 * deployment (www., the *.vercel.app URL) is permanently redirected here in
 * middleware.ts, and sitemap/robots/metadata all point here, so search
 * engines see one site instead of three duplicates.
 */
export const SITE_URL = "https://crgcostruzioni.it";
export const SITE_HOST = new URL(SITE_URL).host;
