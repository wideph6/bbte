import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats() {
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [today, week, month, totalLeads, purchased, recent, courses] = await Promise.all([
    prisma.click.count({ where: { createdAt: { gte: startToday } } }),
    prisma.click.count({ where: { createdAt: { gte: startWeek } } }),
    prisma.click.count({ where: { createdAt: { gte: startMonth } } }),
    prisma.click.count(),
    prisma.click.findMany({ where: { status: "purchased" }, select: { amountPaid: true, courseId: true } }),
    prisma.click.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { course: { select: { title: true } } },
    }),
    prisma.course.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        detailFields: { where: { isPrice: true }, take: 1 },
      },
    }),
  ]);

  const priceById = new Map<string, number>();
  for (const c of courses) {
    if (!c.detailFields[0]) continue;
    const v = parseFloat(c.detailFields[0].value.replace(/[^0-9.]/g, ""));
    if (!Number.isNaN(v)) priceById.set(c.id, v);
  }

  let revenue = 0;
  for (const p of purchased) {
    if (p.amountPaid) revenue += Number(p.amountPaid);
    else if (priceById.has(p.courseId)) revenue += priceById.get(p.courseId)!;
  }

  const conversionRate = totalLeads > 0 ? (purchased.length / totalLeads) * 100 : 0;

  return {
    today,
    week,
    month,
    totalLeads,
    purchasedCount: purchased.length,
    revenue,
    conversionRate,
    recent,
  };
}

export default async function DashboardPage() {
  const s = await getStats().catch(() => null);

  if (!s) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <Card>
          <CardContent>
            <p className="text-slate-600 py-6">
              Unable to load stats. Make sure the database is reachable
              (DATABASE_URL in .env) and migrations have run.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tiles = [
    { label: "Clicks Today", value: s.today },
    { label: "Clicks This Week", value: s.week },
    { label: "Clicks Last 30d", value: s.month },
    { label: "Total Leads", value: s.totalLeads },
    { label: "Purchased", value: s.purchasedCount },
    { label: "Revenue (est.)", value: `PKR ${s.revenue.toLocaleString()}` },
    { label: "Conversion Rate", value: `${s.conversionRate.toFixed(1)}%` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-slate-500">{t.label}</div>
              <div className="text-2xl font-bold mt-1">{t.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {s.recent.length === 0 ? (
            <p className="text-slate-500 text-sm">No clicks yet. Once visitors tap WhatsApp on your courses, they'll show up here.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {s.recent.map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.course.title}</div>
                    <div className="text-xs text-slate-500 font-mono">{r.trackingId.slice(0, 8)}…</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={r.status === "purchased" ? "success" : r.status === "lost" ? "danger" : "muted"}>
                      {r.status}
                    </Badge>
                    <span className="text-xs text-slate-500">{formatDateTime(r.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
