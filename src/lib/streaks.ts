function getPreviousDay(date: string): string {
  const current = new Date(`${date}T00:00:00.000Z`);
  current.setUTCDate(current.getUTCDate() - 1);
  return current.toISOString().slice(0, 10);
}

export function calculateCurrentStreak(
  completions: string[],
  today = new Date().toISOString().slice(0, 10),
): number {
  const uniqueDates = [...new Set(completions)].sort();

  if (!uniqueDates.includes(today)) {
    return 0;
  }

  const completionSet = new Set(uniqueDates);
  let streak = 0;
  let cursor = today;

  while (completionSet.has(cursor)) {
    streak += 1;
    cursor = getPreviousDay(cursor);
  }

  return streak;
}
