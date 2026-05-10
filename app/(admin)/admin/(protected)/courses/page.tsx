import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoursesRowActions } from "@/components/admin/courses-row-actions";

export const dynamic = "force-dynamic";

export default async function CoursesListPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { clicks: true } },
      detailFields: { where: { isPrice: true }, take: 1 },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Link href="/admin/courses/new">
          <Button>+ Add New Course</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {courses.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No courses yet. Click "Add New Course" to create one.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-3 font-medium">Title</th>
                  <th className="text-left p-3 font-medium">Slug</th>
                  <th className="text-left p-3 font-medium">Price</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Clicks</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="p-3">
                      <Link href={`/admin/courses/${c.id}`} className="font-medium hover:text-brand">
                        {c.title}
                      </Link>
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-500">/{c.slug}</td>
                    <td className="p-3">{c.detailFields[0]?.value ?? <span className="text-slate-400">—</span>}</td>
                    <td className="p-3">
                      <Badge variant={c.status === "active" ? "success" : "muted"}>{c.status}</Badge>
                    </td>
                    <td className="p-3">{c._count.clicks}</td>
                    <td className="p-3">
                      <CoursesRowActions id={c.id} status={c.status} slug={c.slug} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
