// Helper gaya murni (tanpa 'use client') — aman dipanggil dari Server Component maupun Client Component.
export const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200';
export const labelCls = 'mb-1 block text-sm font-medium text-slate-700';
export const btnCls = (kind: 'primary' | 'ghost' | 'danger' = 'primary') =>
  `inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:opacity-50 ${
    kind === 'primary' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : kind === 'danger' ? 'bg-rose-600 text-white hover:bg-rose-700' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
  }`;