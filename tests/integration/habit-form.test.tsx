import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HabitDashboard from "@/components/dashboard/HabitDashboard";
import { STORAGE_KEYS } from "@/lib/storage";

const replaceMock = vi.fn();
const pushMock = vi.fn();
const routerMock = {
  replace: replaceMock,
  push: pushMock,
};

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

const session = {
  userId: "user-1",
  email: "person@example.com",
};

const seedHabit = {
  id: "habit-1",
  userId: "user-1",
  name: "Drink Water",
  description: "Hydrate through the day",
  frequency: "daily" as const,
  createdAt: "2026-04-27T10:00:00.000Z",
  completions: [],
};

function renderDashboard() {
  window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  return render(<HabitDashboard />);
}

describe("habit form", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    pushMock.mockReset();
    window.localStorage.clear();
  });

  it("shows a validation error when habit name is empty", async () => {
    renderDashboard();

    fireEvent.click(await screen.findByTestId("create-habit-button"));
    fireEvent.click(screen.getByTestId("habit-save-button"));

    expect(await screen.findByText("Habit name is required")).toBeInTheDocument();
  });

  it("creates a new habit and renders it in the list", async () => {
    renderDashboard();

    fireEvent.click(await screen.findByTestId("create-habit-button"));
    fireEvent.change(screen.getByTestId("habit-name-input"), {
      target: { value: "Drink Water" },
    });
    fireEvent.change(screen.getByTestId("habit-description-input"), {
      target: { value: "Hydrate through the day" },
    });
    fireEvent.click(screen.getByTestId("habit-save-button"));

    expect(await screen.findByTestId("habit-card-drink-water")).toBeInTheDocument();
    expect(
      JSON.parse(window.localStorage.getItem(STORAGE_KEYS.habits) ?? "[]"),
    ).toHaveLength(1);
  });

  it("edits an existing habit and preserves immutable fields", async () => {
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    window.localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify([seedHabit]));

    render(<HabitDashboard />);

    fireEvent.click(await screen.findByTestId("habit-edit-drink-water"));
    fireEvent.change(screen.getByTestId("habit-name-input"), {
      target: { value: "Drink More Water" },
    });
    fireEvent.click(screen.getByTestId("habit-save-button"));

    expect(await screen.findByTestId("habit-card-drink-more-water")).toBeInTheDocument();
    const storedHabit = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.habits) ?? "[]")[0];
    expect(storedHabit.id).toBe(seedHabit.id);
    expect(storedHabit.userId).toBe(seedHabit.userId);
    expect(storedHabit.createdAt).toBe(seedHabit.createdAt);
    expect(storedHabit.completions).toEqual(seedHabit.completions);
  });

  it("deletes a habit only after explicit confirmation", async () => {
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    window.localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify([seedHabit]));

    render(<HabitDashboard />);

    expect(await screen.findByTestId("habit-card-drink-water")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("habit-delete-drink-water"));
    expect(screen.getByTestId("habit-card-drink-water")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("confirm-delete-button"));

    await waitFor(() => {
      expect(screen.queryByTestId("habit-card-drink-water")).not.toBeInTheDocument();
    });
  });

  it("toggles completion and updates the streak display", async () => {
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    window.localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify([seedHabit]));

    render(<HabitDashboard />);

    const completeButton = await screen.findByTestId("habit-complete-drink-water");
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByTestId("habit-streak-drink-water")).toHaveTextContent(
        "Streak: 1",
      );
    });
  });
});
