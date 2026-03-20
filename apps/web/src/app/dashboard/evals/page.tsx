export default function EvalsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Eval Metrics</h1>
      <p className="text-gray-500 mb-8">
        LLM-as-judge scores across legibility, brand match, accuracy, and layout.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Legibility', weight: '35%' },
          { label: 'Accuracy', weight: '30%' },
          { label: 'Brand match', weight: '20%' },
          { label: 'Layout', weight: '15%' },
        ].map((dim) => (
          <div
            key={dim.label}
            className="bg-white rounded-xl border border-gray-200 p-5 text-center"
          >
            <p className="text-sm text-gray-500">{dim.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">—</p>
            <p className="text-xs text-gray-400 mt-1">weight: {dim.weight}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700">Recent eval runs</p>
        </div>
        <div className="p-6 text-center text-gray-400 text-sm">
          No eval data yet. Generate some images to see scores.
        </div>
      </div>
    </div>
  );
}
