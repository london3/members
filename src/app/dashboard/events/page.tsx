import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { deleteEventAction } from "@/lib/actions/event-actions";

export default async function EventsPage() {
  const session = await getSession();
  const db = getDb();

  const events = db
    .prepare(
      `SELECT e.*, u.name as creatorName,
        (SELECT COUNT(*) FROM EventRsvp WHERE eventId = e.id AND status = 'attending') as attendeeCount
       FROM Event e JOIN User u ON e.createdById = u.id
       ORDER BY e.date ASC`
    )
    .all() as {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    capacity: number | null;
    creatorName: string;
    attendeeCount: number;
  }[];

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter((e) => new Date(e.date) < now);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">イベント</h1>
        {session?.role === "admin" && (
          <Link
            href="/dashboard/events/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            + イベントを作成
          </Link>
        )}
      </div>

      {/* Upcoming Events */}
      <h2 className="text-lg font-semibold mb-3">今後のイベント</h2>
      <div className="space-y-4 mb-8">
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-400">
            予定されたイベントはありません
          </div>
        ) : (
          upcoming.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isAdmin={session?.role === "admin"}
            />
          ))
        )}
      </div>

      {/* Past Events */}
      {past.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-3 text-gray-500">
            過去のイベント
          </h2>
          <div className="space-y-4 opacity-60">
            {past.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isAdmin={session?.role === "admin"}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EventCard({
  event,
  isAdmin,
}: {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    capacity: number | null;
    attendeeCount: number;
  };
  isAdmin?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <Link href={`/dashboard/events/${event.id}`} className="flex-1">
          <div className="flex items-start gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center min-w-[60px]">
              <p className="text-xs text-blue-600 font-medium">
                {new Date(event.date).toLocaleDateString("ja-JP", {
                  month: "short",
                })}
              </p>
              <p className="text-xl font-bold text-blue-700">
                {new Date(event.date).getDate()}
              </p>
            </div>
            <div>
              <h3 className="font-semibold hover:text-blue-600 transition">
                {event.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                {event.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>{event.location}</span>
                <span>
                  参加者 {event.attendeeCount}
                  {event.capacity ? `/${event.capacity}` : ""}名
                </span>
              </div>
            </div>
          </div>
        </Link>
        {isAdmin && (
          <div className="flex items-center gap-2 ml-4">
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="text-xs text-blue-500 hover:underline"
            >
              編集
            </Link>
            <form action={deleteEventAction}>
              <input type="hidden" name="id" value={event.id} />
              <button
                type="submit"
                className="text-xs text-red-400 hover:text-red-600"
              >
                削除
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
