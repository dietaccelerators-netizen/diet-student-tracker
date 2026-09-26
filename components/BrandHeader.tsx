import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function BrandHeader({ mode = "student" }: { mode?: "student" | "admin" | "plain" }) {
  const home = mode === "admin" ? "/admin" : mode === "student" ? "/dashboard" : "/login";

  return (
    <header className="brand-header sticky top-0 z-30 border-b border-[#E4E8E5] bg-[#FAFBFB]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <Link href={home} className="focus-ring flex items-center gap-3 rounded-md" aria-label="DIET Accelerator home">
          <span className="h-10 w-10 shrink-0 overflow-hidden rounded-[11px] sm:h-11 sm:w-11">
            <BrandLogo variant="icon" priority />
          </span>
          <span className="leading-tight">
            <span className="block text-[11px] font-bold tracking-[0.15em] text-[#365B46] sm:text-xs">DIET ACCELERATOR</span>
            <span className="mt-0.5 block text-[10px] font-medium tracking-[0.08em] text-[#7A837D]">STUDENT TRACKER</span>
          </span>
        </Link>

        {mode !== "plain" && (
          <nav aria-label="Account" className="flex items-center gap-2 text-sm text-[#68716B] sm:gap-4">
            <span className="hidden sm:inline">{mode === "admin" ? "Admin" : "Student Portal"}</span>
            <form action="/auth/signout" method="post"><button type="submit" className="focus-ring rounded-md px-2 py-2 hover:text-[#20262B]">Sign out</button></form>
          </nav>
        )}
      </div>
    </header>
  );
}
