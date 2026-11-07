import { timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/supabase/admin';

/**
 * Keep-alive untuk Supabase (paket gratis menjeda project setelah 1 minggu tanpa aktivitas).
 * Dipanggil terjadwal oleh Vercel Cron (vercel.json) dan GitHub Actions (cadangan).
 *
 * - Wajib header `Authorization: Bearer <CRON_SECRET>` (Vercel mengirimnya otomatis bila env CRON_SECRET diisi).
 *   Tanpa CRON_SECRET di server, endpoint menolak semua permintaan (fail-closed).
 * - Melakukan query NYATA ke database lewat service role, bukan sekadar membuka halaman web.
 * - Gagal → status 500, sehingga log Vercel / GitHub Actions menandainya merah.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const NO_STORE = { 'Cache-Control': 'no-store' };

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return new NextResponse('Unauthorized', { status: 401, headers: NO_STORE });

  const started = Date.now();
  try {
    const { error } = await db().from('modules').select('id').limit(1);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, at: new Date().toISOString(), ms: Date.now() - started }, { headers: NO_STORE });
  } catch (e) {
    console.error('[keepalive] gagal menghubungi database:', e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: 'db_unreachable' }, { status: 500, headers: NO_STORE });
  }
}