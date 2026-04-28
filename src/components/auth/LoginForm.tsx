"use client";

import { useState } from "react";

type LoginFormProps = {
  onSubmit: (values: { email: string; password: string }) => void;
  error: string | null;
  pending: boolean;
};

export default function LoginForm({
  onSubmit,
  error,
  pending,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ email, password });
      }}
    >
      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-700"
          htmlFor="login-email"
        >
          Email
        </label>
        <input
          id="login-email"
          data-testid="auth-login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-700"
          htmlFor="login-password"
        >
          Password
        </label>
        <input
          id="login-password"
          data-testid="auth-login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
      </div>
      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      <button
        data-testid="auth-login-submit"
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-sky-600 px-4 py-3 font-medium text-white transition hover:bg-sky-700 focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-sky-400"
      >
        {pending ? "Signing in..." : "Log in"}
      </button>
    </form>
  );
}
