"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import SplashScreen from "@/components/shared/SplashScreen";
import { getSession } from "@/lib/storage";

const SPLASH_DELAY_MS = 1000;

export default function SplashBoot() {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const session = getSession();
      router.replace(session ? "/dashboard" : "/login");
    }, SPLASH_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [router]);

  return <SplashScreen />;
}
