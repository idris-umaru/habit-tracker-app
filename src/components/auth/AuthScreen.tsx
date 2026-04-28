"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { login, signup } from "@/lib/storage";

type AuthScreenProps = {
  mode: "login" | "signup";
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(values: { email: string; password: string }) {
    setPending(true);

    const result = isLogin
      ? login(values.email, values.password)
      : signup(values.email, values.password);

    if (result.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    setError(null);
    setPending(false);
    router.replace("/dashboard");
  }

  let title = "Welcome back";
  let subtitle: ReactNode = (
    <>
      New here?{" "}
      <Link className="font-semibold text-sky-700" href="/signup">
        Create an account
      </Link>
    </>
  );

  if (!isLogin) {
    title = "Start your streak";
    subtitle = (
      <>
        Already signed up?{" "}
        <Link className="font-semibold text-sky-700" href="/login">
          Log in
        </Link>
      </>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#e0f2fe_50%,#fef3c7_100%)] px-4 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-700">
          Habit Tracker
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        <div className="mt-8">
          {isLogin ? (
            <LoginForm onSubmit={handleSubmit} error={error} pending={pending} />
          ) : (
            <SignupForm
              onSubmit={handleSubmit}
              error={error}
              pending={pending}
            />
          )}
        </div>
      </section>
    </main>
  );
}
