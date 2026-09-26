import { BrandHeader } from "@/components/BrandHeader";
import { AdminStudentsClient } from "@/components/AdminStudentsClient";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdmin();
  return (
    <main className="min-h-screen">
      <BrandHeader mode="admin" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <AdminStudentsClient />
      </div>
    </main>
  );
}
