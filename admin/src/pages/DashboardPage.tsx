import { useNavigate } from 'react-router-dom';
import { BookOpen, PlusCircle, CheckCircle, FileText, Clock } from 'lucide-react';
import { useBooks } from '../hooks/useBooks';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex items-center gap-4">
      <div className={`rounded-lg p-3 ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useBooks('ALL', 0);

  const books = data?.books ?? [];
  const total     = data?.total ?? books.length;
  const published = books.filter((b) => b.publishStatus === 'PUBLISHED').length;
  const draft     = books.filter((b) => b.publishStatus === 'DRAFT').length;
  const withPdf   = books.filter((b) => b.hasPdf).length;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">GrowVio Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome. Use the sidebar to manage books and content.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Total Books"
            value={total}
            icon={<BookOpen className="h-5 w-5 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            label="Published"
            value={published}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            label="Draft"
            value={draft}
            icon={<Clock className="h-5 w-5 text-yellow-600" />}
            color="bg-yellow-50"
          />
          <StatCard
            label="With PDF"
            value={withPdf}
            icon={<FileText className="h-5 w-5 text-purple-600" />}
            color="bg-purple-50"
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/books')}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <BookOpen className="h-4 w-4 text-indigo-600" />
          View All Books
        </button>
        <button
          onClick={() => navigate('/books/new')}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Book
        </button>
      </div>
    </div>
  );
}
