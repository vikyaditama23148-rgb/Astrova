import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="space-bg grid place-items-center px-6 text-center">
      <div>
        <p className="text-7xl" aria-hidden>🛸</p>
        <h1 className="mt-4 text-4xl font-semibold">Halaman ini tersesat di antariksa</h1>
        <p className="mt-2 text-lg text-indigo-100">Kita kembali ke markas yuk.</p>
        <Link href="/" className="btn btn-primary mt-6">Kembali ke awal</Link>
      </div>
    </div>
  );
}
