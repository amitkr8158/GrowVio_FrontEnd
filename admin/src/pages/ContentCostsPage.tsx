import { useQuery } from '@tanstack/react-query';
import { DollarSign, BookOpen, Layers, TrendingUp } from 'lucide-react';
import { getContentCosts } from '../services/contentService';

interface RecentGeneration {
  bookId: string;
  levelNumber: number;
  model: string;
  costUsd: number;
  generatedAt: string | null;
  generatedBy: string | null;
  success: boolean;
}

interface ContentCostData {
  totalCostUsd: number;
  thisMonthCostUsd: number;
  booksGenerated: number;
  levelsGenerated: number;
  avgCostPerBook: number;
  avgCostPerLevel: number;
  costByLevel: Record<string, number>;
  costByModel: Record<string, string>;
  recentGenerations: RecentGeneration[];
}

const LEVEL_NAMES: Record<number, string> = {
  1: 'Snapshot', 2: 'Flashdeck', 3: 'Infosummary',
  4: 'Deep Read', 5: 'Mastery Quiz', 6: 'Action Plan', 7: 'Quick Recall',
};

function fmt(n: number) { return `$${n.toFixed(4)}`; }

function KpiCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function BarChart({ data, label }: { data: Record<string, number>; label: string }) {
  const entries = Object.entries(data).sort((a, b) => Number(a[0]) - Number(b[0]));
  const max = Math.max(...entries.map(([, v]) => v), 0.0001);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{label}</h3>
      <div className="space-y-2">
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-28 shrink-0">
              {LEVEL_NAMES[Number(key)] ?? key}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full"
                style={{ width: `${(val / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 w-16 text-right">{fmt(val)}</span>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No data yet</p>
        )}
      </div>
    </div>
  );
}

function ModelPieTable({ data }: { data: Record<string, string> }) {
  const entries = Object.entries(data).map(([k, v]) => [k, Number(v)] as [string, number]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const COLORS = ['bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-sky-500'];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Cost by Model</h3>
      {entries.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No data yet</p>
      ) : (
        <div className="space-y-2">
          {entries.map(([model, cost], i) => (
            <div key={model} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full shrink-0 ${COLORS[i % COLORS.length]}`} />
              <span className="text-xs text-gray-600 flex-1 truncate">{model}</span>
              <span className="text-xs text-gray-500">{total > 0 ? `${((cost / total) * 100).toFixed(0)}%` : '—'}</span>
              <span className="text-xs text-gray-700 font-medium">{fmt(cost)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ContentCostsPage() {
  const { data, isLoading, isError } = useQuery<ContentCostData>({
    queryKey: ['content-costs'],
    queryFn: getContentCosts,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Failed to load cost analytics.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Content Costs</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI generation spend across all books and levels</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Spend"
          value={fmt(data.totalCostUsd)}
          icon={DollarSign}
          color="bg-indigo-500"
        />
        <KpiCard
          label="This Month"
          value={fmt(data.thisMonthCostUsd)}
          icon={TrendingUp}
          color="bg-violet-500"
        />
        <KpiCard
          label="Books Generated"
          value={String(data.booksGenerated)}
          sub={`avg ${fmt(data.avgCostPerBook)} / book`}
          icon={BookOpen}
          color="bg-blue-500"
        />
        <KpiCard
          label="Levels Generated"
          value={String(data.levelsGenerated)}
          sub={`avg ${fmt(data.avgCostPerLevel)} / level`}
          icon={Layers}
          color="bg-sky-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChart data={data.costByLevel} label="Cost by Level Type" />
        <ModelPieTable data={data.costByModel as unknown as Record<string, string>} />
      </div>

      {/* Recent generations table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Recent Generations</h3>
        </div>
        {data.recentGenerations.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No generations logged yet</p>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {['Book ID', 'Level', 'Model', 'Cost', 'Date', 'By', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentGenerations.map((g, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700 font-mono">{g.bookId.slice(0, 8)}…</td>
                  <td className="px-4 py-2 text-gray-600">{LEVEL_NAMES[g.levelNumber] ?? `L${g.levelNumber}`}</td>
                  <td className="px-4 py-2 text-gray-600">{g.model ?? '—'}</td>
                  <td className="px-4 py-2 text-gray-700 font-medium">{fmt(g.costUsd)}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {g.generatedAt ? new Date(g.generatedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-2 text-gray-500 truncate max-w-[100px]">{g.generatedBy ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${g.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {g.success ? 'OK' : 'FAILED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
