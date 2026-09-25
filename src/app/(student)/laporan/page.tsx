import { redirect } from 'next/navigation';
import EvaluationView from '@/components/report/EvaluationView';
import { getOrCreateLearningReport } from '@/lib/report-narrative';
import { requireStudent } from '@/lib/session';

export const metadata = { title: 'Laporan Belajarmu' };

export default async function LaporanPage() {
  const me = await requireStudent();
  const data = await getOrCreateLearningReport(me.id);
  if (!data) redirect('/hub'); // laporan hanya tersedia setelah Post-Test selesai
  return <EvaluationView report={data.report} narrative={data.narrative} source={data.source} />;
}