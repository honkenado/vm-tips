export const DEADLINE = new Date('2026-06-10T23:59:00');
export function isDeadlinePassed() {
  return new Date() > DEADLINE;
}