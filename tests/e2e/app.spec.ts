import { expect, test } from "@playwright/test";

const today = new Date().toISOString().slice(0, 10);

test.describe("Habit Tracker app", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test("shows the splash screen and redirects unauthenticated users to /login", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("splash-screen")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("redirects authenticated users from / to /dashboard", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "habit-tracker-session",
        JSON.stringify({ userId: "user-1", email: "person@example.com" }),
      );
    });

    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
  });

  test("prevents unauthenticated access to /dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("signs up a new user and lands on the dashboard", async ({ page }) => {
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill("new@example.com");
    await page.getByTestId("auth-signup-password").fill("password123");
    await page.getByTestId("auth-signup-submit").click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
  });

  test("logs in an existing user and loads only that user's habits", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "habit-tracker-users",
        JSON.stringify([
          {
            id: "user-1",
            email: "person@example.com",
            password: "password123",
            createdAt: "2026-04-27T10:00:00.000Z",
          },
          {
            id: "user-2",
            email: "other@example.com",
            password: "password123",
            createdAt: "2026-04-27T10:00:00.000Z",
          },
        ]),
      );
      window.localStorage.setItem(
        "habit-tracker-habits",
        JSON.stringify([
          {
            id: "habit-1",
            userId: "user-1",
            name: "Drink Water",
            description: "Hydrate",
            frequency: "daily",
            createdAt: "2026-04-27T10:00:00.000Z",
            completions: [],
          },
          {
            id: "habit-2",
            userId: "user-2",
            name: "Read Books",
            description: "Read daily",
            frequency: "daily",
            createdAt: "2026-04-27T10:00:00.000Z",
            completions: [],
          },
        ]),
      );
    });

    await page.goto("/login");
    await page.getByTestId("auth-login-email").fill("person@example.com");
    await page.getByTestId("auth-login-password").fill("password123");
    await page.getByTestId("auth-login-submit").click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("habit-card-drink-water")).toBeVisible();
    await expect(page.getByTestId("habit-card-read-books")).toHaveCount(0);
  });

  test("creates a habit from the dashboard", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "habit-tracker-session",
        JSON.stringify({ userId: "user-1", email: "person@example.com" }),
      );
    });

    await page.goto("/dashboard");
    await page.getByTestId("create-habit-button").click();
    await page.getByTestId("habit-name-input").fill("Exercise");
    await page.getByTestId("habit-description-input").fill("Move every day");
    await page.getByTestId("habit-save-button").click();

    await expect(page.getByTestId("habit-card-exercise")).toBeVisible();
  });

  test("completes a habit for today and updates the streak", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "habit-tracker-session",
        JSON.stringify({ userId: "user-1", email: "person@example.com" }),
      );
      window.localStorage.setItem(
        "habit-tracker-habits",
        JSON.stringify([
          {
            id: "habit-1",
            userId: "user-1",
            name: "Exercise",
            description: "Move every day",
            frequency: "daily",
            createdAt: "2026-04-27T10:00:00.000Z",
            completions: [],
          },
        ]),
      );
    });

    await page.goto("/dashboard");
    await page.getByTestId("habit-complete-exercise").click();

    await expect(page.getByTestId("habit-streak-exercise")).toContainText("Streak: 1");
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const habits = JSON.parse(
            window.localStorage.getItem("habit-tracker-habits") ?? "[]",
          );
          return habits[0]?.completions ?? [];
        }),
      )
      .toContain(today);
  });

  test("persists session and habits after page reload", async ({ page }) => {
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill("persist@example.com");
    await page.getByTestId("auth-signup-password").fill("password123");
    await page.getByTestId("auth-signup-submit").click();
    await page.getByTestId("create-habit-button").click();
    await page.getByTestId("habit-name-input").fill("Meditate");
    await page.getByTestId("habit-save-button").click();

    await page.reload();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("habit-card-meditate")).toBeVisible();
  });

  test("logs out and redirects to /login", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "habit-tracker-session",
        JSON.stringify({ userId: "user-1", email: "person@example.com" }),
      );
    });

    await page.goto("/dashboard");
    await page.getByTestId("auth-logout-button").click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test("loads the cached app shell when offline after the app has been loaded once", async ({
    page,
    context,
  }) => {
    await page.goto("/login");
    await expect(page.getByTestId("auth-login-submit")).toBeVisible();

    await context.setOffline(true);
    await page.reload();

    await expect(page.locator("body")).toContainText("Habit Tracker");

    await context.setOffline(false);
  });
});
