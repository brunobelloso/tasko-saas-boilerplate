import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/verify-email", "/reset-password", "/invite"];
const authRoutes = ["/login", "/register", "/forgot-password", "/verify-email", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname) || nextUrl.pathname.startsWith("/invite/") || nextUrl.pathname.startsWith("/campaigns/");

  // Always allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);
  const isLoggedIn = !!user;

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect non-public routes
  if (!isPublicRoute && !isLoggedIn && !isApiRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
