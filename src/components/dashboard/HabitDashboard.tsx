"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { calculateCurrentStreak } from "@/lib/streaks";
import { getHabitSlug } from "@/lib/slug";
import {
  clearSession,
  createHabit,
  deleteHabit,
  getHabitsForUser,
  getSession,
  toggleHabitForDate,
  updateHabit,
} from "@/lib/storage";
import { validateHabitName } from "@/lib/validators";
import type { Habit } from "@/types/habit";

type FormState = {
  name: string;
  description: string;
};

const TODAY = () => new Date().toISOString().slice(0, 10);

function HabitFormFields({
  form,
  onChange,
  error,
}: {
  form: FormState;
  onChange: (next: FormState) => void;
  error: string | null;
}) {
  return (
    <>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-700"
          htmlFor="habit-name"
        >
          Habit name
        </label>
        <input
          id="habit-name"
          data-testid="habit-name-input"
          value={form.name}
          onChange={(event) =>
            onChange({ ...form, name: event.target.value })
          }
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-700"
          htmlFor="habit-description"
        >
          Description
        </label>
        <textarea
          id="habit-description"
          data-testid="habit-description-input"
          value={form.description}
          onChange={(event) =>
            onChange({ ...form, description: event.target.value })
          }
          className="min-h-24 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-700"
          htmlFor="habit-frequency"
        >
          Frequency
        </label>
        <select
          id="habit-frequency"
          data-testid="habit-frequency-select"
          value="daily"
          disabled
          className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-700 outline-none"
        >
          <option value="daily">Daily</option>
        </select>
      </div>
      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </>
  );
}

export default function HabitDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [deleteHabitId, setDeleteHabitId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", description: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    setUserId(session.userId);
    setEmail(session.email);
    setHabits(getHabitsForUser(session.userId));
    setReady(true);
  }, [router]);

  const editingHabit = useMemo(
    () => habits.find((habit) => habit.id === editingHabitId) ?? null,
    [editingHabitId, habits],
  );

  function refreshHabits(activeUserId: string) {
    setHabits(getHabitsForUser(activeUserId));
  }

  function resetForm() {
    setForm({ name: "", description: "" });
    setError(null);
    setIsCreating(false);
    setEditingHabitId(null);
  }

  function openCreateForm() {
    setForm({ name: "", description: "" });
    setError(null);
    setIsCreating(true);
    setEditingHabitId(null);
  }

  function openEditForm(habit: Habit) {
    setForm({ name: habit.name, description: habit.description });
    setError(null);
    setIsCreating(true);
    setEditingHabitId(habit.id);
  }

  function handleSaveHabit() {
    const validation = validateHabitName(form.name);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    if (!userId) {
      return;
    }

    if (editingHabitId) {
      const result = updateHabit(editingHabitId, form);
      if (result.error) {
        setError(result.error);
        return;
      }
    } else {
      const result = createHabit(userId, form);
      if (result.error) {
        setError(result.error);
        return;
      }
    }

    refreshHabits(userId);
    resetForm();
  }

  function handleToggleCompletion(habitId: string) {
    if (!userId) {
      return;
    }

    toggleHabitForDate(habitId, TODAY());
    refreshHabits(userId);
  }

  function handleDeleteConfirmed() {
    if (!deleteHabitId || !userId) {
      return;
    }

    deleteHabit(deleteHabitId);
    setDeleteHabitId(null);
    refreshHabits(userId);
  }

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#f8fafc_45%,#e0f2fe_100%)] px-4 py-6">
      <div
        className="mx-auto max-w-4xl rounded-[2rem] bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-6"
        data-testid="dashboard-page"
      >
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-700">
              Habit Tracker
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Your daily dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">{email}</p>
          </div>
          <div className="flex gap-3">
            <button
              data-testid="create-habit-button"
              type="button"
              onClick={openCreateForm}
              className="rounded-2xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200"
            >
              Create habit
            </button>
            <button
              data-testid="auth-logout-button"
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100 focus:ring-4 focus:ring-slate-200"
            >
              Log out
            </button>
          </div>
        </header>

        {isCreating ? (
          <section
            data-testid="habit-form"
            className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingHabit ? "Edit habit" : "New habit"}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline"
              >
                Cancel
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <HabitFormFields form={form} onChange={setForm} error={error} />
              <button
                data-testid="habit-save-button"
                type="button"
                onClick={handleSaveHabit}
                className="w-full rounded-2xl bg-sky-600 px-4 py-3 font-medium text-white transition hover:bg-sky-700 focus:ring-4 focus:ring-sky-200 sm:w-auto"
              >
                Save habit
              </button>
            </div>
          </section>
        ) : null}

        {habits.length === 0 ? (
          <section
            data-testid="empty-state"
            className="mt-6 rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              No habits yet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Create your first daily habit to begin building a streak.
            </p>
          </section>
        ) : (
          <section className="mt-6 grid gap-4">
            {habits.map((habit) => {
              const slug = getHabitSlug(habit.name);
              const isCompletedToday = habit.completions.includes(TODAY());
              const streak = calculateCurrentStreak(habit.completions, TODAY());

              return (
                <article
                  key={habit.id}
                  data-testid={`habit-card-${slug}`}
                  className={`rounded-[1.75rem] border p-5 transition ${
                    isCompletedToday
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {habit.name}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">
                        {habit.description || "No description provided."}
                      </p>
                      <p
                        data-testid={`habit-streak-${slug}`}
                        className="mt-4 inline-flex rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white"
                      >
                        Streak: {streak}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        data-testid={`habit-complete-${slug}`}
                        type="button"
                        onClick={() => handleToggleCompletion(habit.id)}
                        className={`rounded-2xl px-4 py-3 font-medium transition focus:ring-4 ${
                          isCompletedToday
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-200"
                            : "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-200"
                        }`}
                      >
                        {isCompletedToday ? "Completed today" : "Mark today"}
                      </button>
                      <button
                        data-testid={`habit-edit-${slug}`}
                        type="button"
                        onClick={() => openEditForm(habit)}
                        className="rounded-2xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100 focus:ring-4 focus:ring-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        data-testid={`habit-delete-${slug}`}
                        type="button"
                        onClick={() => setDeleteHabitId(habit.id)}
                        className="rounded-2xl border border-rose-300 px-4 py-3 font-medium text-rose-700 transition hover:bg-rose-50 focus:ring-4 focus:ring-rose-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {deleteHabitId === habit.id ? (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                      <p className="text-sm text-rose-800">
                        Confirm deletion of this habit?
                      </p>
                      <div className="mt-3 flex gap-3">
                        <button
                          data-testid="confirm-delete-button"
                          type="button"
                          onClick={handleDeleteConfirmed}
                          className="rounded-2xl bg-rose-600 px-4 py-3 font-medium text-white transition hover:bg-rose-700 focus:ring-4 focus:ring-rose-200"
                        >
                          Confirm delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteHabitId(null)}
                          className="rounded-2xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-white focus:ring-4 focus:ring-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
