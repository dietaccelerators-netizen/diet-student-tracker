import { BrandHeader } from "@/components/BrandHeader";
import { PaperDetailClient } from "@/components/PaperDetailClient";
import { requireStudent } from "@/lib/auth";

export default async function PaperPage({ params }: { params: Promise<{ paperId: string }> }) {
  const student = await requireStudent();
  const { paperId } = await params;
  return (
    <main className="min-h-screen">
      <BrandHeader mode="student" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <PaperDetailClient studentId={student.id} paperId={paperId} />
      </div>
    </main>
  );
}
