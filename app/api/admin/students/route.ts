import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const fullName = text(body.fullName);
    const email = text(body.email).toLowerCase();
    const examDiet = text(body.examDiet);
    const level = text(body.level);
    const paperIds = Array.isArray(body.paperIds)
      ? [...new Set(body.paperIds.filter((value: unknown) => typeof value === "string"))]
      : [];

    if (!fullName || !email || !examDiet || !level || !email.includes("@")) {
      return NextResponse.json(
        { error: "Complete the student's name, email, exam diet and level." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.rpc("admin_register_student", {
      p_full_name: fullName,
      p_email: email,
      p_exam_diet: examDiet,
      p_level: level,
      p_paper_ids: paperIds,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Could not add the student." },
        { status: 400 },
      );
    }

    return NextResponse.json({ student: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not add the student." },
      { status: 500 },
    );
  }
}
