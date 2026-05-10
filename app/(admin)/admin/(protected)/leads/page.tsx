import { prisma } from "@/lib/prisma";
import { LeadsTable } from "@/components/admin/leads-table";

export const dynamic = "force-dynamic";

interface SearchParams {
  course?: string;
  status?: string;
  from?: string;
  to?: string;
}

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const where: Record<string, unknown> = {};
  if (searchParams.course) where.courseId = searchParams.course;
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.from || searchParams.to) {
    const range: Record<string, Date> = {};
    if (searchParams.from) range.gte = new Date(searchParams.from);
    if (searchParams.to) range.lte = new Date(searchParams.to);
    where.createdAt = range;
  }

  const [clicks, courses] = await Promise.all([
    prisma.click.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { course: { select: { id: true, title: true } } },
    }),
    prisma.course.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads / Clicks</h1>
      </div>
      <LeadsTable initial={clicks as any} courses={courses as any} initialFilters={searchParams as any} />
    </div>
  );
}
