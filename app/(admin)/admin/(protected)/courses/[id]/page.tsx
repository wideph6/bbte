import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseEditor } from "@/components/admin/course-editor";

export const dynamic = "force-dynamic";

export default async function CourseEditPage({ params }: { params: { id: string } }) {
  const [course, instructors] = await Promise.all([
    prisma.course.findUnique({
      where: { id: params.id },
      include: {
        forYouPoints: { orderBy: { order: "asc" } },
        notForYouPoints: { orderBy: { order: "asc" } },
        learningPoints: { orderBy: { order: "asc" } },
        detailFields: { orderBy: { order: "asc" } },
        testimonials: { orderBy: { order: "asc" } },
        faqs: { orderBy: { order: "asc" } },
        instructor: true,
      },
    }),
    prisma.instructor.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  if (!course) notFound();

  return <CourseEditor course={course} instructors={instructors} />;
}
