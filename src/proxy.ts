import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'ts_session';

async function hasStudentSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

/**
 * Next.js 16 "proxy" (pengganti middleware):
 *  - /admin/*  → wajib sesi Supabase Auth (peran admin dicek lagi di layout + RLS)
 *  - halaman siswa → wajib cookie sesi siswa yang valid
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    let response = NextResponse.next({ request });
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    const isLogin = pathname === '/admin/login';
    if (!data.user && !isLogin) return NextResponse.redirect(new URL('/admin/login', request.url));
    if (data.user && isLogin && !request.nextUrl.searchParams.get('error')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return response;
  }

  if (!(await hasStudentSession(request))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/hub/:path*', '/module/:path*', '/observatorium/:path*', '/pretest', '/posttest'],
};