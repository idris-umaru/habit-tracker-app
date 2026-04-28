import type { Metadata } from "next";
import "./globals.css";

import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "A mobile-first habit tracker progressive web app.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
