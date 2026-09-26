"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { loadTrackerState, progressPatchToRow } from "@/lib/data/supabase-state";
import { initialTrackerState } from "@/lib/mock-data";
import type { NewStudentInput, TopicProgress, TrackerState } from "@/lib/types";

const STORAGE_KEY = "diet-tracker-v1-demo";

type ActionResult = { ok: true } | { ok: false; error: string };

type TrackerContextValue = {
  state: TrackerState;
  currentUserId: string | null;
  backend: "demo" | "supabase";
  syncing: boolean;
  syncError: string | null;
  refreshState: () => Promise<void>;
  updateProgress: (progressId: string, patch: Partial<TopicProgress>) => void;
  removePriority: (progressId: string) => void;
  addPriority: (progressId: string) => void;
  addStudent: (student: NewStudentInput) => Promise<ActionResult>;
  updateStudentPapers: (studentId: string, paperIds: string[]) => Promise<ActionResult>;
  resetDemo: () => void;
};

const TrackerContext = createContext<TrackerContextValue | null>(null);

export function TrackerProvider({
  children,
  initialState,
  currentUserId,
  backend,
}: {
  children: React.ReactNode;
  initialState: TrackerState;
  currentUserId: string | null;
  backend: "demo" | "supabase";
}) {
  const [state, setState] = useState<TrackerState>(initialState);
  const [hydrated, setHydrated] = useState(backend === "supabase");
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const pendingProgress = useRef(new Map<string, Partial<TopicProgress>>());
  const progressTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    if (backend !== "demo") return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved));
    } catch {
      // Demo still works with in-memory state if storage is unavailable.
    } finally {
      setHydrated(true);
    }
  }, [backend]);

  useEffect(() => {
    if (backend !== "demo" || !hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [backend, state, hydrated]);

  const refreshState = useCallback(async () => {
    if (backend !== "supabase") return;
    setSyncing(true);
    setSyncError(null);
    try {
      const supabase = createSupabaseClient();
      setState(await loadTrackerState(supabase));
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Could not refresh tracker data.");
    } finally {
      setSyncing(false);
    }
  }, [backend]);

  const persistProgress = useCallback(async (progressId: string) => {
    if (backend !== "supabase") return;
    const patch = pendingProgress.current.get(progressId);
    if (!patch) return;
    pendingProgress.current.delete(progressId);
    progressTimers.current.delete(progressId);

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase
        .from("topic_progress")
        .update(progressPatchToRow(patch))
        .eq("id", progressId);
      if (error) throw error;
      setSyncError(null);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "A tracker update could not be saved.");
      await refreshState();
    }
  }, [backend, refreshState]);

  const updateProgress = useCallback((progressId: string, patch: Partial<TopicProgress>) => {
    setState((current) => ({
      ...current,
      progress: current.progress.map((item) =>
        item.id === progressId
          ? { ...item, ...patch, updatedAt: new Date().toISOString() }
          : item,
      ),
    }));

    if (backend !== "supabase") return;

    pendingProgress.current.set(progressId, {
      ...(pendingProgress.current.get(progressId) ?? {}),
      ...patch,
    });

    const existingTimer = progressTimers.current.get(progressId);
    if (existingTimer) clearTimeout(existingTimer);
    progressTimers.current.set(
      progressId,
      setTimeout(() => void persistProgress(progressId), 550),
    );
  }, [backend, persistProgress]);

  useEffect(() => {
    return () => {
      for (const timer of progressTimers.current.values()) clearTimeout(timer);
    };
  }, []);

  const updateStudentPapers = useCallback(async (studentId: string, paperIds: string[]): Promise<ActionResult> => {
    if (paperIds.length === 0) return { ok: false, error: "Choose at least one paper." };

    if (backend === "demo") {
      setState((current) => {
        const student = current.profiles.find((profile) => profile.id === studentId);
        if (!student) return current;

        const existingProgressIds = new Set(
          current.progress
            .filter((item) => item.studentId === studentId)
            .map((item) => item.topicId),
        );
        const newTopicIds = current.topics
          .filter((topic) => paperIds.includes(topic.paperId) && !existingProgressIds.has(topic.id))
          .map((topic) => topic.id);
        const createdAt = new Date().toISOString();
        const createdProgress = newTopicIds.map((topicId) => ({
          id: `${studentId}-${topicId}`,
          studentId,
          topicId,
          status: "Not Started" as const,
          questionPractice: "Not Yet" as const,
          lastStudied: null,
          nextStep: "",
          thisWeek: false,
          updatedAt: createdAt,
        }));

        return {
          ...current,
          profiles: current.profiles.map((profile) =>
            profile.id === studentId ? { ...profile, paperIds } : profile,
          ),
          progress: [...current.progress, ...createdProgress],
        };
      });
      return { ok: true };
    }

    setSyncing(true);
    setSyncError(null);
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.rpc("set_student_papers", {
        target_student_id: studentId,
        selected_paper_ids: paperIds,
      });
      if (error) throw error;
      await refreshState();
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update papers.";
      setSyncError(message);
      return { ok: false, error: message };
    } finally {
      setSyncing(false);
    }
  }, [backend, refreshState]);

  const addStudent = useCallback(async (student: NewStudentInput): Promise<ActionResult> => {
    if (backend === "demo") {
      const id = `student-${Date.now()}`;
      setState((current) => {
        const selectedTopicIds = current.topics
          .filter((topic) => student.paperIds.includes(topic.paperId))
          .map((topic) => topic.id);
        const createdAt = new Date().toISOString();
        return {
          ...current,
          profiles: [
            ...current.profiles,
            { id, role: "student", ...student },
          ],
          progress: [
            ...current.progress,
            ...selectedTopicIds.map((topicId) => ({
              id: `${id}-${topicId}`,
              studentId: id,
              topicId,
              status: "Not Started" as const,
              questionPractice: "Not Yet" as const,
              lastStudied: null,
              nextStep: "",
              thisWeek: false,
              updatedAt: createdAt,
            })),
          ],
        };
      });
      return { ok: true };
    }

    setSyncing(true);
    setSyncError(null);
    try {
      const response = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create student.");
      await refreshState();
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create student.";
      setSyncError(message);
      return { ok: false, error: message };
    } finally {
      setSyncing(false);
    }
  }, [backend, refreshState]);

  const value = useMemo<TrackerContextValue>(() => ({
    state,
    currentUserId,
    backend,
    syncing,
    syncError,
    refreshState,
    updateProgress,
    removePriority: (progressId) => updateProgress(progressId, { thisWeek: false }),
    addPriority: (progressId) => updateProgress(progressId, { thisWeek: true }),
    updateStudentPapers,
    addStudent,
    resetDemo: () => setState(initialTrackerState),
  }), [
    state,
    currentUserId,
    backend,
    syncing,
    syncError,
    refreshState,
    updateProgress,
    updateStudentPapers,
    addStudent,
  ]);

  return (
    <TrackerContext.Provider value={value}>
      {children}
      {syncError && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-[#E7D6D0] bg-[#FFF9F7] px-4 py-3 text-sm text-[#7F4A3D] shadow-[0_10px_30px_rgba(32,38,43,0.12)]" role="alert">
          We could not save the latest change. Please check your connection and try again.
        </div>
      )}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) throw new Error("useTracker must be used inside TrackerProvider");
  return context;
}
