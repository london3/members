"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { dbGet, dbAll, dbRun, generateId } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendMail, buildEventInviteHtml } from "@/lib/mail";

const APP_URL = process.env.APP_URL || "http://localhost:3001";

export async function sendEventInviteAction(
  _prevState: { error: string; success: string },
  formData: FormData
): Promise<{ error: string; success: string }> {
  await requireAdmin();

  const eventId = formData.get("eventId") as string;
  if (!eventId) {
    return { error: "イベントIDが必要です", success: "" };
  }

  const event = await dbGet<{
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
  }>("SELECT * FROM Event WHERE id = ?", [eventId]);

  if (!event) {
    return { error: "イベントが見つかりません", success: "" };
  }

  const members = await dbAll<{ id: string; email: string; name: string }>(
    "SELECT id, email, name FROM User WHERE active = 1"
  );

  if (members.length === 0) {
    return { error: "アクティブな会員がいません", success: "" };
  }

  let sentCount = 0;
  const errors: string[] = [];

  for (const member of members) {
    const token = crypto.randomBytes(32).toString("hex");
    const id = generateId();

    try {
      await dbRun(
        "INSERT OR REPLACE INTO EventInvite (id, eventId, userId, token, status, sentAt) VALUES (?, ?, ?, ?, 'pending', datetime('now'))",
        [id, eventId, member.id, token]
      );

      const baseUrl = `${APP_URL}/rsvp/${token}`;

      await sendMail(
        member.email,
        `【出欠確認】${event.title}`,
        buildEventInviteHtml({
          memberName: member.name,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          eventDescription: event.description,
          attendUrl: `${baseUrl}?status=attending`,
          maybeUrl: `${baseUrl}?status=maybe`,
          declineUrl: `${baseUrl}?status=declined`,
        })
      );
      sentCount++;
    } catch (e) {
      errors.push(`${member.email}: ${e instanceof Error ? e.message : "送信失敗"}`);
    }
  }

  revalidatePath(`/dashboard/events/${eventId}`);

  if (errors.length > 0) {
    return {
      error: `${errors.length}件の送信に失敗: ${errors.join(", ")}`,
      success: sentCount > 0 ? `${sentCount}件送信しました` : "",
    };
  }

  return { error: "", success: `${sentCount}名の会員にメールを送信しました` };
}
