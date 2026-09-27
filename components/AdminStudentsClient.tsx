"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { STAGES, stagePapers } from "@/lib/stages";
import { useTracker } from "@/components/TrackerProvider";
import { getStudentProgress } from "@/lib/selectors";
import type { NewStudentInput } from "@/lib/types";

export function AdminStudentsClient() {
  const { state, addStudent, syncing, syncError } = useTracker();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [diet, setDiet] = useState("November 2026");
  const [level, setLevel] = useState("Professional");
  const [paperIds, setPaperIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  const students = useMemo(
    () => state.profiles.filter((profile) => profile.role === "student"),
    [state.profiles],
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setCreated(null);

    const input: NewStudentInput = {
      fullName: name.trim(),
      email: email.trim().toLowerCase(),
      examDiet: diet.trim(),
      level: level.trim(),
      paperIds,
    };

    const result = await addStudent(input);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setCreated(`${input.fullName} has been added. They can request a secure access link from the login page.`);
    setOpen(false);
    setName("");
    setEmail("");
    setPaperIds([]);
  }

  return (
    <>
      <div className="admin-hero flex flex-col justify-between gap-5 border-b border-[#E4E8E5] pb-7 pt-8 sm:flex-row sm:items-end sm:pb-9 sm:pt-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#68716B]">Admin</p>
          <h1 className="editorial mt-1 text-4xl font-medium sm:text-5xl">Students</h1>
          <p className="mt-3 text-sm text-[#68716B]">A little guidance today. More confident students tomorrow.</p>
        </div>
        <button onClick={() => { setOpen((value) => !value); setFormError(null); setCreated(null); }} className="focus-ring min-h-11 rounded-md bg-[#365B46] px-4 text-sm font-semibold text-white">+ Add Student</button>
      </div>

      <section className="pulse-grid" aria-label="Student overview">
        <div className="pulse-card pulse-green"><span className="pulse-label">Your learning community</span><strong>{students.length}</strong><span>students with portal profiles</span></div>
        <div className="pulse-card pulse-blue"><span className="pulse-label">Room to grow</span><strong>{state.papers.length}</strong><span>papers in your catalogue</span></div>
        <div className="pulse-card pulse-peach"><span className="pulse-label">A helpful nudge</span><strong>{students.filter(student => getStudentProgress(state, student.id).some(item => item.status === "Needs Practice")).length}</strong><span>students with practice topics</span></div>
      </section>
      {created && <p className="mt-5 rounded-md border border-[#D7E2DA] bg-[#F4F8F4] px-4 py-3 text-sm text-[#365B46]" role="status">{created}</p>}
      {syncError && !open && <p className="mt-5 rounded-md border border-[#E7D6D0] bg-[#FCF6F4] px-4 py-3 text-sm text-[#7F4A3D]" role="alert">{syncError}</p>}

      {open && (
        <form onSubmit={(event) => void submit(event)} className="my-6 rounded-lg border border-[#DDE3DF] bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Full Name<input required value={name} onChange={(e) => setName(e.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-md border border-[#D5DBD7] px-3 font-normal" /></label>
            <label className="text-sm font-medium">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-md border border-[#D5DBD7] px-3 font-normal" /></label>
            <label className="text-sm font-medium">Exam Diet<input required value={diet} onChange={(e) => setDiet(e.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-md border border-[#D5DBD7] px-3 font-normal" /></label>
            <label className="text-sm font-medium">Exam stage<select required value={level} onChange={(e) => {setLevel(e.target.value);setPaperIds([]);}} className="focus-ring mt-2 min-h-11 w-full rounded-md border border-[#D5DBD7] px-3 font-normal">{STAGES.map(stage => <option key={stage}>{stage}</option>)}</select></label>
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Starting papers <span className="font-normal text-[#7A837D]">(optional)</span></legend>
            <p className="mt-1 text-xs leading-5 text-[#7A837D]">You can assign papers now, or leave this blank and let the student choose their papers when they first open the tracker.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {stagePapers(state.papers,level).map((paper) => (
                <label key={paper.id} className="flex min-h-11 items-center gap-2 rounded-md border border-[#DDE3DF] px-3 text-sm">
                  <input type="checkbox" checked={paperIds.includes(paper.id)} onChange={(e) => setPaperIds((current) => e.target.checked ? [...new Set([...current, paper.id])] : current.filter((id) => id !== paper.id))} className="h-4 w-4 accent-[#365B46]" />
                  {paper.code}
                </label>
              ))}
            </div>
          </fieldset>

          {formError && <p className="mt-4 text-sm font-medium text-[#8C4E3E]" role="alert">{formError}</p>}

          <div className="mt-5 flex gap-3">
            <button type="submit" disabled={syncing} className="focus-ring min-h-11 rounded-md bg-[#365B46] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55">{syncing ? "Creating…" : "Save Student"}</button>
            <button type="button" disabled={syncing} onClick={() => setOpen(false)} className="focus-ring min-h-11 rounded-md border border-[#D5DBD7] px-4 text-sm font-semibold">Cancel</button>
          </div>
          <p className="mt-4 text-xs leading-5 text-[#7A837D]">This approves the student email for the private DIET portal. The student does not need a password; they request a secure access link from the DIET login page.</p>
        </form>
      )}

      {students.length === 0 && <div className="community-empty"><span className="empty-symbol" aria-hidden="true">＋</span><h2 className="editorial text-3xl">Big journeys start with one student.</h2><p>Add a student above to get started. Their tracker appears here after their first sign-in.</p></div>}
      <div className="py-7">
        <div className="tracker-table hidden overflow-hidden rounded-lg border border-[#DDE3DF] bg-white md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F7F8F7] text-xs uppercase tracking-[0.08em] text-[#69736D]">
              <tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Diet</th><th className="px-4 py-3">Papers</th><th className="px-4 py-3">Needs Practice</th><th className="px-4 py-3">Last Updated</th><th className="px-4 py-3">Action</th></tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const progress = getStudentProgress(state, student.id);
                const needs = progress.filter((item) => item.status === "Needs Practice").length;
                const latest = [...progress].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.updatedAt;
                return (
                  <tr key={student.id} className="border-t border-[#E9ECEA]">
                    <td className="px-4 py-4"><p className="font-semibold">{student.fullName}</p><p className="mt-1 text-xs text-[#7A837D]">{student.email}</p></td>
                    <td className="px-4 py-4">{student.examDiet}</td>
                    <td className="px-4 py-4">{student.paperIds.length} {student.paperIds.length === 1 ? "paper" : "papers"}</td>
                    <td className="px-4 py-4">{needs} topics</td>
                    <td className="px-4 py-4">{latest ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(latest)) : "—"}</td>
                    <td className="px-4 py-4"><Link href={`/admin/students/${student.id}`} className="focus-ring font-semibold text-[#365B46]">View Tracker →</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {students.map((student) => {
            const progress = getStudentProgress(state, student.id);
            const needs = progress.filter((item) => item.status === "Needs Practice").length;
            return (
              <article key={student.id} className="student-card-enhanced rounded-lg border border-[#DDE3DF] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="font-semibold">{student.fullName}</h2><p className="mt-1 text-xs text-[#7A837D]">{student.examDiet} · {student.paperIds.length} {student.paperIds.length === 1 ? "paper" : "papers"}</p></div>
                  <span className="rounded-full bg-[#F7E7E2] px-2.5 py-1 text-xs font-medium text-[#8C4E3E]">{needs} need practice</span>
                </div>
                <Link href={`/admin/students/${student.id}`} className="focus-ring mt-4 inline-block text-sm font-semibold text-[#365B46]">View Tracker →</Link>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
