export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Overview</h1>
      <p className="text-gray-500 mb-8">Welcome to your OGStack dashboard.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Images generated', value: '—' },
          { label: 'Cache hit rate', value: '—' },
          { label: 'Avg generation time', value: '—' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
