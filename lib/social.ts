export function buildInstagramCaption({
  title,
  excerpt,
  id,
}: {
  title: string;
  excerpt?: string | null;
  id?: string | null;
}) {
  return [
    title,
    excerpt ?? "",
    id ? `Läs mer: addesvmtips.se/news/${id}` : "Läs mer på addesvmtips.se",
    "#addesvmtips #fotboll #vm",
  ]
    .filter(Boolean)
    .join("\n\n");
}