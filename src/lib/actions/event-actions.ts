"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dbGet, dbRun, generateId } from "@/lib/db";
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

  const id = generateId();

  await dbRun(
    "INSERT INTO Event (id, title, description, date, location, capacity, createdById, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
    [id, title, description, date, location, capacity, session.id]
  );

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

  await dbRun(
    "UPDATE Event SET title = ?, description = ?, date = ?, location = ?, capacity = ?, updatedAt = datetime('now') WHERE id = ?",
    [title, description, date, location, capacity, id]
  );

  revalidatePath("/dashboard/events");
  redirect("/dashboard/events");
}

export async function rsvpAction(formData: FormData) {
  const session = await requireSession();

  const eventId = formData.get("eventId") as string;
  const status = formData.get("status") as string;

  if (!eventId || !status) return;

  const existing = await dbGet<{ id: string }>(
    "SELECT id FROM EventRsvp WHERE eventId = ? AND userId = ?",
    [eventId, session.id]
  );

  if (existing) {
    if (status === "cancel") {
      await dbRun("DELETE FROM EventRsvp WHERE id = ?", [existing.id]);
    } else {
      await dbRun("UPDATE EventRsvp SET status = ? WHERE id = ?", [
        status,
        existing.id,
      ]);
    }
  } else if (status !== "cancel") {
    await dbRun(
      "INSERT INTO EventRsvp (id, eventId, userId, status) VALUES (?, ?, ?, ?)",
      [generateId(), eventId, session.id, status]
    );
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath("/dashboard/events");
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return;

  await dbRun("DELETE FROM Event WHERE id = ?", [id]);

  revalidatePath("/dashboard/events");
}
