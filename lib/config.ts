export const DEADLINE = new Date('2020-06-10T23:00:00');
export function isDeadlinePassed() {
  return new Date() > DEADLINE;
}