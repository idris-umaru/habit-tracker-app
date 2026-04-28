export default function SplashScreen() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#fde68a,transparent_35%),linear-gradient(180deg,#0f172a_0%,#111827_55%,#172554_100%)] px-6 text-white"
      data-testid="splash-screen"
    >
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-amber-200">
          Daily momentum
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Habit Tracker
        </h1>
      </div>
    </main>
  );
}
