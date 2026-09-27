import { BrandHeader } from "@/components/BrandHeader";
import { StudentWorkspace } from "@/components/StudentWorkspace";
import { requireStudent } from "@/lib/auth";

export default async function DashboardPage({searchParams}: {searchParams: Promise<{view?:string}>}) {
  const {view} = await searchParams;
  const student = await requireStudent();
  return (
    <main className="min-h-screen">
      <BrandHeader mode="student" activeView={view} />
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <StudentWorkspace studentId={student.id} view={view} />
      </div>
    </main>
  );
}
