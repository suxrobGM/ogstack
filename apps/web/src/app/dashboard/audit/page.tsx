export default function AuditPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">OG Audit</h1>
      <p className="text-gray-500 mb-8">
        Crawl your site and validate every page's Open Graph tags.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl mb-8">
        <form className="flex gap-3">
          <input
            type="url"
            placeholder="https://yoursite.com"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Run audit
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700">Audit results will appear here</p>
        </div>
        <div className="p-6 text-center text-gray-400 text-sm">
          No audits run yet. Enter a URL above to get started.
        </div>
      </div>
    </div>
  );
}
