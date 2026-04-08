export function hasActiveTimeOverride(value: string | null | undefined) {
  if (!value) return false;

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return false;

  return timestamp > Date.now();
}

export function addHoursToIso(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}