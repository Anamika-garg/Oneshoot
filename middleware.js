import { NextResponse } from 'next/server'

import { updateSession } from "./utils/supabase/middleware"

export async function middleware(request) {
  // Skip middleware for admin and vendor routes
  if (request.nextUrl.pathname.startsWith('/admin') ||
      request.nextUrl.pathname.startsWith('/vendor')) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|admin|vendor|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}