import { BrandHeader } from "@/components/BrandHeader";
import { AdminStudentPageClient } from "@/components/AdminStudentPageClient";
import { requireAdmin } from "@/lib/auth";

export default async function AdminStudentPage({ params, searchParams }: { params: Promise<{ studentId: string }>; searchParams: Promise<{ paper?: string }> }) {
  await requireAdmin();
  const { studentId } = await params;
  const { paper } = await searchParams;
  return (
    <main className="min-h-screen">
      <BrandHeader mode="admin" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <AdminStudentPageClient studentId={studentId} paperId={paper} />
      </div>
    </main>
  );
}
