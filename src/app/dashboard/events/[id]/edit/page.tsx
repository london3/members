import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { dbGet } from "@/lib/db";
import { EventForm } from "../../event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const event = await dbGet<{
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    capacity: number | null;
  }>(
    "SELECT id, title, description, date, location, capacity FROM Event WHERE id = ?",
    [id]
  );

  if (!event) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">イベントを編集</h1>
      <EventForm event={event} />
    </div>
  );
}
