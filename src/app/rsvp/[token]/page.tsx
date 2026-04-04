import { getDb, generateId } from "@/lib/db";
import Link from "next/link";

const statusLabels: Record<string, string> = {
  attending: "参加",
  maybe: "未定",
  declined: "不参加",
};

const statusColors: Record<string, string> = {
  attending: "text-green-600",
  maybe: "text-yellow-600",
  declined: "text-red-600",
};

export default async function RsvpPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { token } = await params;
  const { status } = await searchParams;

  const db = getDb();

  const invite = db
    .prepare(
      `SELECT ei.*, e.title as eventTitle, e.date as eventDate, e.location as eventLocation, u.name as userName
       FROM EventInvite ei
       JOIN Event e ON ei.eventId = e.id
       JOIN User u ON ei.userId = u.id
       WHERE ei.token = ?`
    )
    .get(token) as {
    id: string;
    eventId: string;
    userId: string;
    token: string;
    status: string;
    respondedAt: string | null;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    userName: string;
  } | undefined;

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">無効なリンク</h1>
          <p className="text-gray-600">このリンクは無効か、期限切れです。</p>
        </div>
      </div>
    );
  }

  const validStatuses = ["attending", "maybe", "declined"];
  let message = "";
  let updated = false;

  if (status && validStatuses.includes(status)) {
    // Update invite status
    db.prepare(
      "UPDATE EventInvite SET status = ?, respondedAt = datetime('now') WHERE id = ?"
    ).run(status, invite.id);

    // Also update/create EventRsvp for dashboard display
    if (status === "declined") {
      db.prepare(
        "DELETE FROM EventRsvp WHERE eventId = ? AND userId = ?"
      ).run(invite.eventId, invite.userId);
    } else {
      const existingRsvp = db
        .prepare("SELECT id FROM EventRsvp WHERE eventId = ? AND userId = ?")
        .get(invite.eventId, invite.userId) as { id: string } | undefined;

      if (existingRsvp) {
        db.prepare("UPDATE EventRsvp SET status = ? WHERE id = ?").run(
          status,
          existingRsvp.id
        );
      } else {
        db.prepare(
          "INSERT INTO EventRsvp (id, eventId, userId, status) VALUES (?, ?, ?, ?)"
        ).run(generateId(), invite.eventId, invite.userId, status);
      }
    }

    message = `「${statusLabels[status]}」で回答しました`;
    updated = true;
  }

  const dateStr = new Date(invite.eventDate).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Refresh invite data after update
  const currentStatus = updated ? status! : invite.status;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border max-w-lg w-full p-8">
        <h1 className="text-xl font-bold mb-1">出欠確認</h1>
        <p className="text-sm text-gray-500 mb-6">{invite.userName} さん</p>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-800 mb-2">{invite.eventTitle}</h2>
          <p className="text-sm text-blue-700">{dateStr}</p>
          <p className="text-sm text-blue-700">{invite.eventLocation}</p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
            <p className={`font-semibold ${statusColors[status!]}`}>{message}</p>
          </div>
        )}

        {currentStatus !== "pending" && !updated && (
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-500">現在の回答:</p>
            <p className={`text-lg font-bold ${statusColors[currentStatus]}`}>
              {statusLabels[currentStatus]}
            </p>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4 text-center">
          {updated ? "回答を変更する場合：" : "出欠をお知らせください："}
        </p>

        <div className="flex flex-col gap-3">
          {currentStatus !== "attending" && (
            <Link
              href={`/rsvp/${token}?status=attending`}
              className="block text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition"
            >
              参加する
            </Link>
          )}
          {currentStatus !== "maybe" && (
            <Link
              href={`/rsvp/${token}?status=maybe`}
              className="block text-center bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-medium transition"
            >
              未定
            </Link>
          )}
          {currentStatus !== "declined" && (
            <Link
              href={`/rsvp/${token}?status=declined`}
              className="block text-center bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition"
            >
              不参加
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
