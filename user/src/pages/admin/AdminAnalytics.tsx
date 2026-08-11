import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminShell from "@/components/layout/AdminShell";
import { userService } from "@/services/userService";

type AnalyticsData = {
  totalUsers: number;
  premiumUsers: number;
  activeUsersLast30Days: number;
  totalPayments: number;
  newSignupsToday: number;
  newSignupsThisWeek: number;
  newSignupsThisMonth: number;
  paidUsers: number;
  freeUsers: number;
  conversionRate: number;
  activeUsersToday: number;
  mrr: number;
};

const fmtNum = (n: number) => n.toLocaleString('en-IN');
const fmtRupees = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${fmtNum(Math.round(n))}`;
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

const CARD = "bg-[#1E293B] border border-[#334155] rounded-xl p-4";
const CHART_PLACEHOLDER = "bg-[#1E293B] border border-[#334155] rounded-xl p-6 h-64 flex items-center justify-center text-[#94A3B8]";

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={CARD}>
      <p className="text-xs text-[#94A3B8]">{label}</p>
      <p className="text-xl font-display font-bold mt-1">{value}</p>
    </div>
  );
}

function ComingSoon({ tab }: { tab: string }) {
  return (
    <div className={CHART_PLACEHOLDER}>
      Detailed {tab} analytics — coming soon
    </div>
  );
}

const TIME_RANGES = ["7D", "30D", "90D", "Custom"] as const;

const AdminAnalytics = () => {
  const { data, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ["admin", "analytics"],
    queryFn: () => userService.adminStats().then((r) => r.data),
    staleTime: 60_000,
  });

  const overview = data
    ? [
        { l: "Total Users",      v: fmtNum(data.totalUsers) },
        { l: "DAU",              v: fmtNum(data.activeUsersToday) },
        { l: "Active (30d)",     v: fmtNum(data.activeUsersLast30Days) },
        { l: "MRR",              v: fmtRupees(data.mrr) },
        { l: "Paid Users",       v: fmtNum(data.paidUsers) },
        { l: "Conversion",       v: fmtPct(data.conversionRate) },
      ]
    : null;

  const acquisition = data
    ? [
        { l: "New Today",        v: fmtNum(data.newSignupsToday) },
        { l: "New This Week",    v: fmtNum(data.newSignupsThisWeek) },
        { l: "New This Month",   v: fmtNum(data.newSignupsThisMonth) },
        { l: "Total Users",      v: fmtNum(data.totalUsers) },
        { l: "Free Users",       v: fmtNum(data.freeUsers) },
        { l: "Paid Users",       v: fmtNum(data.paidUsers) },
      ]
    : null;

  const revenue = data
    ? [
        { l: "MRR",              v: fmtRupees(data.mrr) },
        { l: "Paid Users",       v: fmtNum(data.paidUsers) },
        { l: "Premium Users",    v: fmtNum(data.premiumUsers) },
        { l: "Conversion",       v: fmtPct(data.conversionRate) },
        { l: "Total Payments",   v: fmtNum(data.totalPayments) },
        { l: "Free Users",       v: fmtNum(data.freeUsers) },
      ]
    : null;

  const renderCards = (cards: { l: string; v: string }[] | null, tab: string) => {
    if (isLoading) return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${CARD} animate-pulse`}>
            <div className="h-3 w-16 bg-[#334155] rounded mb-2" />
            <div className="h-6 w-24 bg-[#334155] rounded" />
          </div>
        ))}
      </div>
    );
    if (isError) return (
      <div className="mb-6 rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-400">
        Failed to load analytics. Check your connection or try refreshing.
      </div>
    );
    if (!cards) return <ComingSoon tab={tab} />;
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {cards.map((m) => <KpiCard key={m.l} label={m.l} value={m.v} />)}
      </div>
    );
  };

  return (
    <AdminShell>
      <h1 className="font-display text-2xl font-bold mb-6">Analytics</h1>
      <div className="flex gap-2 mb-6">
        {TIME_RANGES.map((t, i) => (
          <button
            key={t}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${i === 1 ? "bg-primary text-white" : "bg-[#1E293B] text-[#94A3B8]"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="bg-[#1E293B] border border-[#334155] mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="ai">AI Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderCards(overview, "overview")}
          <div className={CHART_PLACEHOLDER}>Chart placeholder — overview data visualization</div>
        </TabsContent>

        <TabsContent value="acquisition">
          {renderCards(acquisition, "acquisition")}
          <div className={CHART_PLACEHOLDER}>Chart placeholder — acquisition data visualization</div>
        </TabsContent>

        <TabsContent value="engagement">
          {renderCards(null, "engagement")}
        </TabsContent>

        <TabsContent value="revenue">
          {renderCards(revenue, "revenue")}
          <div className={CHART_PLACEHOLDER}>Chart placeholder — revenue data visualization</div>
        </TabsContent>

        <TabsContent value="content">
          {renderCards(null, "content")}
        </TabsContent>

        <TabsContent value="ai">
          {renderCards(null, "AI usage")}
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
};

export default AdminAnalytics;
