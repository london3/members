import { NextResponse } from "next/server";
import { dbAll, dbGet } from "@/lib/db";
import { sendMail, buildEventReminderHtml } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Vercel Cron認証チェック
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const APP_URL = process.env.APP_URL || "http://localhost:3001";

  // 明日の日付範囲を計算（JST基準）
  const now = new Date();
  // JSTオフセット（+9時間）
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const jstTomorrow = new Date(jstNow);
  jstTomorrow.setDate(jstTomorrow.getDate() + 1);

  // 明日の0:00〜23:59（JST）をUTCに変換
  const tomorrowStart = new Date(
    Date.UTC(
      jstTomorrow.getUTCFullYear(),
      jstTomorrow.getUTCMonth(),
      jstTomorrow.getUTCDate(),
      0, 0, 0
    )
  );
  tomorrowStart.setTime(tomorrowStart.getTime() - 9 * 60 * 60 * 1000);

  const tomorrowEnd = new Date(
    Date.UTC(
      jstTomorrow.getUTCFullYear(),
      jstTomorrow.getUTCMonth(),
      jstTomorrow.getUTCDate(),
      23, 59, 59
    )
  );
  tomorrowEnd.setTime(tomorrowEnd.getTime() - 9 * 60 * 60 * 1000);

  const startStr = tomorrowStart.toISOString();
  const endStr = tomorrowEnd.toISOString();

  // 明日開催のイベントを取得
  const events = await dbAll<{
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
  }>(
    "SELECT id, title, description, date, location FROM Event WHERE date >= ? AND date <= ?",
    [startStr, endStr]
  );

  if (events.length === 0) {
    return NextResponse.json({
      message: "No events tomorrow",
      checked: { start: startStr, end: endStr },
    });
  }

  // アクティブな全会員を取得
  const members = await dbAll<{ id: string; email: string; name: string }>(
    "SELECT id, email, name FROM User WHERE active = 1"
  );

  let totalSent = 0;
  const errors: string[] = [];

  for (const event of events) {
    for (const member of members) {
      // 会員のRSVPステータスを確認
      const rsvp = await dbGet<{ status: string }>(
        "SELECT status FROM EventRsvp WHERE eventId = ? AND userId = ?",
        [event.id, member.id]
      );

      // 不参加の人にはリマインドを送らない
      if (rsvp?.status === "declined") continue;

      try {
        await sendMail(
          member.email,
          `【明日開催】${event.title}`,
          buildEventReminderHtml({
            memberName: member.name,
            eventTitle: event.title,
            eventDate: event.date,
            eventLocation: event.location,
            eventDescription: event.description,
            rsvpStatus: rsvp?.status || null,
            eventUrl: `${APP_URL}/dashboard/events/${event.id}`,
          })
        );
        totalSent++;
      } catch (e) {
        errors.push(
          `${member.email}: ${e instanceof Error ? e.message : "送信失敗"}`
        );
      }
    }
  }

  return NextResponse.json({
    message: `Reminder sent for ${events.length} event(s)`,
    totalSent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
