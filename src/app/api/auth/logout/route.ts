import { NextResponse } from 'next/server';
import { clearStudentSession } from '@/lib/session';

async function handle(req: Request) {
  await clearStudentSession();
  const next = new URL(req.url).searchParams.get('next');
  const target = next && next.startsWith('/') ? next : '/';
  return NextResponse.redirect(new URL(target, req.url), { status: 303 });
}
export const GET = handle;
export const POST = handle;
