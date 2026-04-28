import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthScreen } from "@/components/auth/AuthScreen";
import { STORAGE_KEYS } from "@/lib/storage";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    push: vi.fn(),
  }),
}));

describe("auth flow", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    window.localStorage.clear();
  });

  it("submits the signup form and creates a session", async () => {
    render(<AuthScreen mode="signup" />);

    fireEvent.change(screen.getByTestId("auth-signup-email"), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByTestId("auth-signup-password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("auth-signup-submit"));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard");
    });
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.users) ?? "[]")).toHaveLength(1);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.session) ?? "null")).toMatchObject({
      email: "new@example.com",
    });
  });

  it("shows an error for duplicate signup email", async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.users,
      JSON.stringify([
        {
          id: "user-1",
          email: "taken@example.com",
          password: "password123",
          createdAt: "2026-04-27T10:00:00.000Z",
        },
      ]),
    );

    render(<AuthScreen mode="signup" />);

    fireEvent.change(screen.getByTestId("auth-signup-email"), {
      target: { value: "taken@example.com" },
    });
    fireEvent.change(screen.getByTestId("auth-signup-password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("auth-signup-submit"));

    expect(await screen.findByText("User already exists")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("submits the login form and stores the active session", async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.users,
      JSON.stringify([
        {
          id: "user-1",
          email: "member@example.com",
          password: "password123",
          createdAt: "2026-04-27T10:00:00.000Z",
        },
      ]),
    );

    render(<AuthScreen mode="login" />);

    fireEvent.change(screen.getByTestId("auth-login-email"), {
      target: { value: "member@example.com" },
    });
    fireEvent.change(screen.getByTestId("auth-login-password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("auth-login-submit"));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard");
    });
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.session) ?? "null")).toEqual({
      userId: "user-1",
      email: "member@example.com",
    });
  });

  it("shows an error for invalid login credentials", async () => {
    render(<AuthScreen mode="login" />);

    fireEvent.change(screen.getByTestId("auth-login-email"), {
      target: { value: "missing@example.com" },
    });
    fireEvent.change(screen.getByTestId("auth-login-password"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByTestId("auth-login-submit"));

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
