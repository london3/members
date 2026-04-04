"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, generateId } from "@/lib/db";
import { requireSession, requireAdmin } from "@/lib/auth";

export async function createEventAction(
  _prevState: { error: string },
  formData: FormData
) {
  const session = await requireAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;
  const location = formData.get("location") as string;
  const capacityStr = formData.get("capacity") as string;
  const capacity = capacityStr ? parseInt(capacityStr, 10) : null;

  if (!title || !description || !date || !location) {
    return { error: "全ての必須項目を入力してください" };
  }

  const db = getDb();
  const id = generateId();

  db.prepare(
    "INSERT INTO Event (id, title, description, date, location, capacity, createdById, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))"
  ).run(id, title, description, date, location, capacity, session.id);

  revalidatePath("/dashboard/events");
  redirect("/dashboard/events");
}

export async function updateEventAction(
  _prevState: { error: string },
  formData: FormData
) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;
  const location = formData.get("location") as string;
  const capacityStr = formData.get("capacity") as string;
  const capacity = capacityStr ? parseInt(capacityStr, 10) : null;

  if (!id || !title || !description || !date || !location) {
    return { error: "全ての必須項目を入力してください" };
  }

  const db = getDb();

  db.prepare(
    "UPDATE Event SET title = ?, description = ?, date = ?, location = ?, capacity = ?, updatedAt = datetime('now') WHERE id = ?"
  ).run(title, description, date, location, capacity, id);

  revalidatePath("/dashboard/events");
  redirect("/dashboard/events");
}

export async function rsvpAction(formData: FormData) {
  const session = await requireSession();

  const eventId = formData.get("eventId") as string;
  const status = formData.get("status") as string;

  if (!eventId || !status) return;

  const db = getDb();

  const existing = db
    .prepare("SELECT id FROM EventRsvp WHERE eventId = ? AND userId = ?")
    .get(eventId, session.id) as { id: string } | undefined;

  if (existing) {
    if (status === "cancel") {
      db.prepare("DELETE FROM EventRsvp WHERE id = ?").run(existing.id);
    } else {
      db.prepare("UPDATE EventRsvp SET status = ? WHERE id = ?").run(
        status,
        existing.id
      );
    }
  } else if (status !== "cancel") {
    db.prepare(
      "INSERT INTO EventRsvp (id, eventId, userId, status) VALUES (?, ?, ?, ?)"
    ).run(generateId(), eventId, session.id, status);
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath("/dashboard/events");
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return;

  const db = getDb();
  db.prepare("DELETE FROM Event WHERE id = ?").run(id);

  revalidatePath("/dashboard/events");
}
