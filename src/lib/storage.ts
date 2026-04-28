import { toggleHabitCompletion } from "@/lib/habits";
import { validateHabitName } from "@/lib/validators";
import type { Session, User } from "@/types/auth";
import type { Habit } from "@/types/habit";

export const STORAGE_KEYS = {
  users: "habit-tracker-users",
  session: "habit-tracker-session",
  habits: "habit-tracker-habits",
} as const;

type HabitInput = {
  name: string;
  description: string;
};

type HabitUpdate = {
  name: string;
  description: string;
};

function hasWindow() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasWindow()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  if (rawValue === null) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function getUsers(): User[] {
  return readJson<User[]>(STORAGE_KEYS.users, []);
}

export function getSession(): Session | null {
  return readJson<Session | null>(STORAGE_KEYS.session, null);
}

export function getHabits(): Habit[] {
  return readJson<Habit[]>(STORAGE_KEYS.habits, []);
}

export function getHabitsForUser(userId: string): Habit[] {
  return getHabits().filter((habit) => habit.userId === userId);
}

export function clearSession() {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.session);
}

export function signup(email: string, password: string): {
  session: Session | null;
  error: string | null;
} {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    return {
      session: null,
      error: "Email and password are required",
    };
  }

  const users = getUsers();
  const duplicateUser = users.find((user) => user.email === normalizedEmail);

  if (duplicateUser) {
    return {
      session: null,
      error: "User already exists",
    };
  }

  const user: User = {
    id: createId("user"),
    email: normalizedEmail,
    password: normalizedPassword,
    createdAt: new Date().toISOString(),
  };

  const session: Session = {
    userId: user.id,
    email: user.email,
  };

  writeJson(STORAGE_KEYS.users, [...users, user]);
  writeJson(STORAGE_KEYS.session, session);

  return {
    session,
    error: null,
  };
}

export function login(email: string, password: string): {
  session: Session | null;
  error: string | null;
} {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  const user = getUsers().find(
    (existingUser) =>
      existingUser.email === normalizedEmail &&
      existingUser.password === normalizedPassword,
  );

  if (!user) {
    return {
      session: null,
      error: "Invalid email or password",
    };
  }

  const session: Session = {
    userId: user.id,
    email: user.email,
  };

  writeJson(STORAGE_KEYS.session, session);

  return {
    session,
    error: null,
  };
}

export function createHabit(
  userId: string,
  input: HabitInput,
): { habit: Habit | null; error: string | null } {
  const validation = validateHabitName(input.name);

  if (!validation.valid) {
    return {
      habit: null,
      error: validation.error,
    };
  }

  const habit: Habit = {
    id: createId("habit"),
    userId,
    name: validation.value,
    description: input.description.trim(),
    frequency: "daily",
    createdAt: new Date().toISOString(),
    completions: [],
  };

  writeJson(STORAGE_KEYS.habits, [...getHabits(), habit]);

  return {
    habit,
    error: null,
  };
}

export function updateHabit(
  habitId: string,
  input: HabitUpdate,
): { habit: Habit | null; error: string | null } {
  const validation = validateHabitName(input.name);

  if (!validation.valid) {
    return {
      habit: null,
      error: validation.error,
    };
  }

  let updatedHabit: Habit | null = null;
  const habits = getHabits().map((habit) => {
    if (habit.id !== habitId) {
      return habit;
    }

    updatedHabit = {
      ...habit,
      name: validation.value,
      description: input.description.trim(),
      frequency: "daily",
    };

    return updatedHabit;
  });

  writeJson(STORAGE_KEYS.habits, habits);

  return {
    habit: updatedHabit,
    error: updatedHabit ? null : "Habit not found",
  };
}

export function deleteHabit(habitId: string) {
  writeJson(
    STORAGE_KEYS.habits,
    getHabits().filter((habit) => habit.id !== habitId),
  );
}

export function toggleHabitForDate(habitId: string, date: string): Habit | null {
  let nextHabit: Habit | null = null;
  const habits = getHabits().map((habit) => {
    if (habit.id !== habitId) {
      return habit;
    }

    nextHabit = toggleHabitCompletion(habit, date);
    return nextHabit;
  });

  writeJson(STORAGE_KEYS.habits, habits);

  return nextHabit;
}
