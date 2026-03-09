import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { locales, defaultLocale } from "@/i18n/config";

const publicPaths = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameLocale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
  }

  const pathnameWithoutLocale = pathname.replace(`/${pathnameLocale}`, "") || "/";
  const isPublic = publicPaths.some((p) => pathnameWithoutLocale.startsWith(p));

  if (!isPublic) {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.redirect(
        new URL(`/${pathnameLocale}/login`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
