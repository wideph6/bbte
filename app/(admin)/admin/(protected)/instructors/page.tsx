import { prisma } from "@/lib/prisma";
import { InstructorsManager } from "@/components/admin/instructors-manager";

export const dynamic = "force-dynamic";

export default async function InstructorsPage() {
  const instructors = await prisma.instructor.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Instructors</h1>
      <InstructorsManager initial={instructors as any} />
    </div>
  );
}
