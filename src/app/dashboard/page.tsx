import { getSession } from "@/lib/auth";
import { dbGet, dbAll } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();

  const memberCount = await dbGet<{ count: number }>(
    "SELECT COUNT(*) as count FROM User WHERE active = 1"
  );
  const postCount = await dbGet<{ count: number }>(
    "SELECT COUNT(*) as count FROM Post"
  );
  const eventCount = await dbGet<{ count: number }>(
    "SELECT COUNT(*) as count FROM Event WHERE date >= datetime('now')"
  );

  const recentPosts = await dbAll<{
    id: string; title: string; createdAt: string; authorName: string;
  }>(
    "SELECT p.id, p.title, p.createdAt, u.name as authorName FROM Post p JOIN User u ON p.authorId = u.id ORDER BY p.createdAt DESC LIMIT 5"
  );

  const upcomingEvents = await dbAll<{
    id: string; title: string; date: string; location: string;
  }>(
    "SELECT id, title, date, location FROM Event WHERE date >= datetime('now') ORDER BY date ASC LIMIT 5"
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        ようこそ、{session?.name}さん
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <p className="text-sm text-gray-500 mb-1">アクティブ会員</p>
          <p className="text-3xl font-bold text-blue-600">
            {memberCount?.count ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <p className="text-sm text-gray-500 mb-1">掲示板投稿数</p>
          <p className="text-3xl font-bold text-green-600">
            {postCount?.count ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <p className="text-sm text-gray-500 mb-1">今後のイベント</p>
          <p className="text-3xl font-bold text-purple-600">
            {eventCount?.count ?? 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-semibold">最新の投稿</h2>
            <Link
              href="/dashboard/board"
              className="text-sm text-blue-600 hover:underline"
            >
              全て見る
            </Link>
          </div>
          <div className="divide-y">
            {recentPosts.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">まだ投稿がありません</p>
            ) : (
              recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/dashboard/board/${post.id}`}
                  className="block p-4 hover:bg-gray-50 transition"
                >
                  <p className="font-medium text-sm">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {post.authorName} ・{" "}
                    {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-semibold">今後のイベント</h2>
            <Link
              href="/dashboard/events"
              className="text-sm text-blue-600 hover:underline"
            >
              全て見る
            </Link>
          </div>
          <div className="divide-y">
            {upcomingEvents.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">
                予定されたイベントはありません
              </p>
            ) : (
              upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="block p-4 hover:bg-gray-50 transition"
                >
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(event.date).toLocaleDateString("ja-JP")} ・{" "}
                    {event.location}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
