import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Bridge legacy /category/* links to the new app routes.
  if (pathname.startsWith('/category/')) {
    const slug = pathname.replace('/category/', '').replace(/\/+$/, '');
    if (!slug) {
      return NextResponse.redirect(new URL('/clientSide/valves', request.url));
    }

    // Everything under /category/* goes to category page which handles both listing & item detail
    const newUrl = new URL(`/clientSide/category/${slug}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/category/:path*'
  ]
};
