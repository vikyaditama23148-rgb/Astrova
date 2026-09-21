import type { Metadata } from 'next';
import HubView, { type HubModule } from '@/components/HubView';
import UsabilitySurvey from '@/components/UsabilitySurvey';
import { computeBadges } from '@/lib/badges';
import { PLANET_MAP } from '@/lib/planets';
import { requireStudent } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import type { ModuleRow, ProgressRow } from '@/lib/types';

export const metadata: Metadata = { title: 'Markas Penjelajah' };

export default async function HubPage() {
  const me = await requireStudent();
  const sb = db();
  const [{ data: mods }, { data: prog }, { data: ev }, { data: fb }] = await Promise.all([
    sb.from('modules').select('*').eq('is_published', true).order('order_index'),
    sb.from('student_module_progress').select('*').eq('user_id', me.id),
    sb.from('research_evaluations').select('pre_test_done_at, post_test_done_at').eq('user_id', me.id).maybeSingle(),
    sb.from('usability_feedback').select('id').eq('user_id', me.id).maybeSingle(),
  ]);
  const modules = (mods ?? []) as ModuleRow[];
  const progress: Record<string, ProgressRow> = Object.fromEntries((prog ?? []).map((p: any) => [p.module_id, p]));
  const preDone = !!ev?.pre_test_done_at;
  const postDone = !!ev?.post_test_done_at;
  const allModulesDone = modules.length > 0 && modules.every((m) => progress[m.id]?.test_completed);

  const items: HubModule[] = modules.map((m) => {
    const p = progress[m.id];
    const pid = m.planet_name?.toLowerCase() ?? '';
    return {
      id: m.id, title: m.title, description: m.description, planetId: PLANET_MAP[pid] ? pid : 'bumi',
      learn: !!p?.learn_completed, explore: !!p?.explore_completed, test: !!p?.test_completed, score: p?.test_score ?? 0, locked: !preDone,
    };
  });

  return (
    <>
      <HubView name={me.name} preDone={preDone} postDone={postDone} postOpen={preDone && allModulesDone} modules={items} badges={computeBadges(modules, progress, preDone, postDone)} />
      <UsabilitySurvey show={postDone && !fb} />
    </>
  );
}
