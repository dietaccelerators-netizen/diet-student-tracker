"use client";

import { useEffect, useMemo, useState } from "react";
import { useTracker } from "@/components/TrackerProvider";
import { getStudent } from "@/lib/selectors";

export function ManagePapers({ studentId, adminMode = false }: { studentId: string; adminMode?: boolean }) {
  const { state, updateStudentPapers, syncing } = useTracker();
  const student = getStudent(state, studentId);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(student?.paperIds ?? []);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelected(student?.paperIds ?? []);
    if (!adminMode && student && student.paperIds.length === 0) setOpen(true);
  }, [student?.paperIds, student, adminMode]);

  const ordered = useMemo(
    () => [...state.papers].sort((a, b) => a.displayOrder - b.displayOrder),
    [state.papers],
  );

  if (!student) return null;
  const studentPaperIds = student.paperIds;

  function toggle(paperId: string, checked: boolean) {
    setSaved(false);
    setError(null);
    setSelected((current) => checked ? [...new Set([...current, paperId])] : current.filter((id) => id !== paperId));
  }

  async function save() {
    if (selected.length === 0) {
      setError("Choose at least one paper before saving.");
      return;
    }
    const result = await updateStudentPapers(studentId, selected);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setError(null);
    setOpen(false);
  }

  function cancel() {
    setSelected(studentPaperIds);
    setOpen(false);
    setSaved(false);
    setError(null);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => { setSelected(studentPaperIds); setOpen((value) => !value); setSaved(false); setError(null); }}
        className="secondary-action focus-ring min-h-11 rounded-md border border-[#C9D2CC] bg-white px-4 text-sm font-semibold text-[#365B46] hover:border-[#365B46]"
        aria-expanded={open}
      >
        {adminMode ? "Edit papers" : studentPaperIds.length === 0 ? "Choose my papers" : "Manage papers"}
      </button>

      {saved && !open && (
        <p className="mt-2 text-xs font-medium text-[#365B46]" role="status">Your tracker now reflects the papers you selected.</p>
      )}

      {open && (
        <section className="manage-papers-panel mt-4" aria-labelledby={`manage-papers-${studentId}`}>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#365B46]">Personalise tracker</p>
              <h3 id={`manage-papers-${studentId}`} className="editorial mt-1 text-2xl font-medium">
                {adminMode ? `Papers for ${student.fullName}` : "Which papers are you preparing for?"}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68716B]">
                Your dashboard, priorities and topic list will only show the papers selected here. Removing a paper does not erase its previous progress; adding it again restores that work.
              </p>
            </div>
            <span className="selected-count">{selected.length} selected</span>
          </div>

          <fieldset className="mt-5">
            <legend className="sr-only">Choose papers</legend>
            <div className="paper-choice-grid">
              {ordered.map((paper) => {
                const checked = selected.includes(paper.id);
                return (
                  <label key={paper.id} className={`paper-choice ${checked ? "paper-choice-selected" : ""}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => toggle(paper.id, event.target.checked)}
                      className="h-5 w-5 shrink-0 accent-[#365B46]"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold tracking-[0.06em] text-[#365B46]">{paper.code}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#68716B]">{paper.name}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {error && <p className="mt-4 text-sm font-medium text-[#8C4E3E]" role="alert">{error}</p>}

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => void save()} disabled={selected.length === 0 || syncing} className="focus-ring min-h-11 rounded-md bg-[#365B46] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">
              {syncing ? "Saving…" : "Save papers"}
            </button>
            {studentPaperIds.length > 0 && (
              <button type="button" onClick={cancel} disabled={syncing} className="focus-ring min-h-11 rounded-md border border-[#D5DBD7] bg-white px-4 text-sm font-semibold text-[#4F5953]">Cancel</button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
