import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/config";
import { SITE_HOST, SITE_URL } from "@/lib/site";

export async function middleware(request: NextRequest) {
  // One public address: www. and the *.vercel.app URL redirect permanently
  // to the canonical domain (production only, so local dev is unaffected).
  const host = request.headers.get("host");
  if (process.env.VERCEL_ENV === "production" && host && host !== SITE_HOST) {
    return NextResponse.redirect(new URL(request.nextUrl.pathname + request.nextUrl.search, SITE_URL), 308);
  }

  // Everything below is the admin auth gate: public pages skip it entirely.
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Bootstrap state: no Supabase project connected yet, so there is no
  // session/data to gate. app/admin/(protected)/layout.tsx renders a setup
  // screen instead of the real shell in this state. Once .env.local has
  // real credentials, the full auth gate below takes over.
  if (!isSupabaseConfigured) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  // Server Actions (e.g. recordLogin, called from LoginForm right after
  // sign-in) POST to the current page's URL. Redirecting those responses as
  // if they were page navigations would swallow the action before Next.js
  // ever executes it, so page-level redirects only apply to GET requests.
  if (request.method !== "GET") {
    return response;
  }

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";

  if (pathname.startsWith("/admin") && !isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // All pages (for the domain redirect), but not build assets and static files.
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|woff2?|txt|xml)$).*)"],
};
