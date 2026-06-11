export function isDeadlinePassed() {
  return new Date() > new Date("2026-06-11T18:10:00+02:00");
}