import { BrandHeader } from "@/components/BrandHeader";
import { StudentOverview } from "@/components/StudentOverview";
import { requireStudent } from "@/lib/auth";

export default async function DashboardPage() {
  const student = await requireStudent();
  return (
    <main className="min-h-screen">
      <BrandHeader mode="student" />
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <StudentOverview studentId={student.id} />
      </div>
    </main>
  );
}
