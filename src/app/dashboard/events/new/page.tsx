import { requireAdmin } from "@/lib/auth";
import { EventForm } from "../event-form";

export default async function NewEventPage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">イベントを作成</h1>
      <EventForm />
    </div>
  );
}
