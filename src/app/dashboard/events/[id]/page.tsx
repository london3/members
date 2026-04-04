import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { RsvpButtons } from "./rsvp-buttons";
import { InviteButton } from "./invite-button";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const db = getDb();

  const event = db
    .prepare(
      "SELECT e.*, u.name as creatorName FROM Event e JOIN User u ON e.createdById = u.id WHERE e.id = ?"
    )
    .get(id) as {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    capacity: number | null;
    creatorName: string;
  } | undefined;

  if (!event) notFound();

  const rsvps = db
    .prepare(
      "SELECT er.status, u.name FROM EventRsvp er JOIN User u ON er.userId = u.id WHERE er.eventId = ? ORDER BY u.name"
    )
    .all(id) as { status: string; name: string }[];

  const myRsvp = session
    ? (db
        .prepare(
          "SELECT status FROM EventRsvp WHERE eventId = ? AND userId = ?"
        )
        .get(id, session.id) as { status: string } | undefined)
    : undefined;

  const attending = rsvps.filter((r) => r.status === "attending");
  const maybe = rsvps.filter((r) => r.status === "maybe");

  const isPast = new Date(event.date) < new Date();

  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard/events"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; イベント一覧に戻る
      </Link>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center min-w-[70px]">
            <p className="text-xs text-blue-600 font-medium">
              {new Date(event.date).toLocaleDateString("ja-JP", {
                month: "short",
              })}
            </p>
            <p className="text-2xl font-bold text-blue-700">
              {new Date(event.date).getDate()}
            </p>
            <p className="text-xs text-blue-500">
              {new Date(event.date).toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {event.location} ・ 主催: {event.creatorName}
            </p>
            {event.capacity && (
              <p className="text-sm text-gray-500">
                定員: {attending.length}/{event.capacity}名
              </p>
            )}
          </div>
        </div>

        <div className="text-gray-700 whitespace-pre-wrap mb-6">
          {event.description}
        </div>

        {!isPast && session && (
          <RsvpButtons
            eventId={event.id}
            currentStatus={myRsvp?.status}
          />
        )}
        {isPast && (
          <p className="text-sm text-gray-400 italic">
            このイベントは終了しました
          </p>
        )}

        {!isPast && session?.role === "admin" && (
          <div className="mt-4 pt-4 border-t">
            <InviteButton eventId={event.id} />
          </div>
        )}
      </div>

      {/* Invite Status */}
      {session?.role === "admin" && (() => {
        const invites = db
          .prepare(
            `SELECT ei.status, ei.sentAt, ei.respondedAt, u.name, u.email
             FROM EventInvite ei JOIN User u ON ei.userId = u.id
             WHERE ei.eventId = ? ORDER BY u.name`
          )
          .all(id) as { status: string; sentAt: string; respondedAt: string | null; name: string; email: string }[];

        if (invites.length === 0) return null;

        const statusLabel: Record<string, string> = {
          pending: "未回答",
          attending: "参加",
          maybe: "未定",
          declined: "不参加",
        };
        const statusColor: Record<string, string> = {
          pending: "bg-gray-100 text-gray-600",
          attending: "bg-green-50 text-green-700",
          maybe: "bg-yellow-50 text-yellow-700",
          declined: "bg-red-50 text-red-700",
        };

        return (
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="p-5 border-b">
              <h2 className="font-semibold">メール出欠回答状況</h2>
              <p className="text-xs text-gray-500 mt-1">
                回答: {invites.filter(i => i.status !== "pending").length}/{invites.length}名
              </p>
            </div>
            <div className="divide-y">
              {invites.map((inv, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{inv.name}</p>
                    <p className="text-xs text-gray-400">{inv.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[inv.status] || statusColor.pending}`}>
                    {statusLabel[inv.status] || inv.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Attendee List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-5 border-b">
          <h2 className="font-semibold">参加者一覧</h2>
        </div>
        <div className="p-5">
          {attending.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-green-600 mb-2">
                参加 ({attending.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {attending.map((r, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                  >
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {maybe.length > 0 && (
            <div>
              <p className="text-xs font-medium text-yellow-600 mb-2">
                未定 ({maybe.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {maybe.map((r, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm"
                  >
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {attending.length === 0 && maybe.length === 0 && (
            <p className="text-sm text-gray-400">まだ参加者がいません</p>
          )}
        </div>
      </div>
    </div>
  );
}
