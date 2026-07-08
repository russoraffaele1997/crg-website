import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/config";

export async function middleware(request: NextRequest) {
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
  matcher: ["/admin/:path*"],
};
