import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/brand', label: 'Brand' },
  { href: '/dashboard/audit', label: 'Audit' },
  { href: '/dashboard/evals', label: 'Evals' },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200">
          <span className="text-xl font-bold text-gray-900">OGStack</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
