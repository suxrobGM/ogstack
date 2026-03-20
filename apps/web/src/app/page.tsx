import Link from 'next/link';
import type { Route } from 'next';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">OGStack</span>
          <span className="text-xs font-medium bg-brand-500 text-white px-2 py-0.5 rounded-full">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href={"/docs" as Route} className="text-sm text-gray-400 hover:text-white transition-colors">
            Docs
          </Link>
          <Link
            href="/dashboard"
            className="text-sm bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-8 py-32 max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold tracking-tight leading-tight mb-6">
          Beautiful social previews.
          <br />
          <span className="text-brand-500">Zero effort.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-10">
          OGStack auto-generates branded 1200×630 Open Graph images for any URL.
          Add one <code className="text-brand-500">&lt;meta&gt;</code> tag and every
          shared link instantly gets a professional social preview.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-brand-500 text-white rounded-xl font-semibold text-lg hover:bg-brand-600 transition-colors"
          >
            Get started free
          </Link>
          <Link
            href={"/docs" as Route}
            className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors"
          >
            View docs
          </Link>
        </div>
      </section>

      {/* Code snippet */}
      <section className="px-8 py-16 max-w-3xl mx-auto">
        <div className="bg-gray-950 rounded-2xl border border-white/10 p-8">
          <p className="text-sm text-gray-400 mb-4 font-mono">
            Add to your &lt;head&gt;:
          </p>
          <pre className="text-sm text-green-400 font-mono overflow-x-auto">
{`<meta property="og:image" content="https://api.ogstack.dev/p/YOUR_PROJECT_ID/generate?url=PAGE_URL" />`}
          </pre>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-16 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          {
            title: 'AI-powered',
            desc: 'Claude + Flux Schnell generate images that match your brand and content.',
          },
          {
            title: 'Brand-consistent',
            desc: 'Set your colors, font, and style once. Every image stays on-brand.',
          },
          {
            title: 'Cached at the edge',
            desc: 'Redis + Cloudflare R2 ensure sub-100ms responses after the first hit.',
          },
        ].map((f) => (
          <div key={f.title} className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
