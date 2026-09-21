'use client';

import { recalculateAll } from '@/app/admin/actions';
import { btnCls, Confirm, Msg, useRun } from '@/components/admin/ui';

export default function RecalcButton() {
  const { run, pending, msg } = useRun();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Confirm className={btnCls()} text="Nilai ulang SEMUA jawaban dengan kunci terbaru (kecuali yang di-override) dan hitung ulang nilai semua siswa?" onYes={() => run(() => recalculateAll())}>{pending ? 'Menghitung...' : '↻ Hitung ulang skor semua siswa'}</Confirm>
      <Msg msg={msg} />
    </div>
  );
}
