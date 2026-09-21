import ExcelJS from 'exceljs';
import { NextResponse } from 'next/server';
import { getAdminOrNull } from '@/lib/admin-auth';
import { buildSheets, loadResearchData, toCsv } from '@/lib/research';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SLUG = ['nilai', 'aktivitas', 'jawaban', 'usability'];

/** /api/admin/export?type=xlsx | csv&sheet=nilai|aktivitas|jawaban|usability */
export async function GET(req: Request) {
  if (!(await getAdminOrNull())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const url = new URL(req.url);
  const type = url.searchParams.get('type') ?? 'xlsx';
  const sheets = buildSheets(await loadResearchData());
  const stamp = new Date().toISOString().slice(0, 10);

  if (type === 'csv') {
    const i = Math.max(0, SLUG.indexOf(url.searchParams.get('sheet') ?? 'nilai'));
    return new NextResponse(toCsv(sheets[i]), {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="tatasurya-${SLUG[i]}-${stamp}.csv"` },
    });
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Astrova';
  for (const s of sheets) {
    const ws = wb.addWorksheet(s.name.slice(0, 31));
    ws.addRow(s.header).font = { bold: true };
    s.rows.forEach((r) => ws.addRow(r));
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    ws.columns.forEach((c, idx) => { c.width = Math.min(48, Math.max(12, ...[s.header[idx], ...s.rows.slice(0, 50).map((r) => r[idx])].map((v) => String(v ?? '').length + 2))); });
  }
  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(buf as ArrayBuffer, {
    headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="tatasurya-data-${stamp}.xlsx"` },
  });
}
