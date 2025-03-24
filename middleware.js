import { NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request) {
  // Skip middleware for admin and vendor routes
  if (
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/vendor")
  ) {
    return NextResponse.next();
  }

  // Handle payment success and partial payment pages
  if (
    request.nextUrl.pathname.startsWith("/payment-success") ||
    request.nextUrl.pathname.startsWith("/payment-partial")
  ) {
    // Get the NP_id from the URL
    const npId = request.nextUrl.searchParams.get("NP_id");

    // If no NP_id is provided, redirect to home
    if (!npId) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if this payment ID exists in our session storage
    const paymentCookie = request.cookies.get("np_payment_id");

    // If the payment ID doesn't match what's in the cookie, redirect to home
    if (!paymentCookie || paymentCookie.value !== npId) {
      // We'll validate with Supabase in the page component as a second layer
      // But for now, we'll set a flag to indicate this might be a direct access
      const response = NextResponse.next();
      response.cookies.set("payment_direct_access", "true", {
        maxAge: 300, // 5 minutes
        path: "/",
      });
      return response;
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|admin|vendor|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
