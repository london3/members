import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { deletePostAction } from "@/lib/actions/post-actions";

export default async function BoardPage() {
  const session = await getSession();
  const db = getDb();

  const posts = db
    .prepare(
      `SELECT p.id, p.title, p.content, p.createdAt, p.authorId, u.name as authorName,
        (SELECT COUNT(*) FROM Comment WHERE postId = p.id) as commentCount
       FROM Post p JOIN User u ON p.authorId = u.id
       ORDER BY p.createdAt DESC`
    )
    .all() as {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    authorId: string;
    authorName: string;
    commentCount: number;
  }[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">掲示板</h1>
        <Link
          href="/dashboard/board/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          + 新規投稿
        </Link>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-400">
            まだ投稿がありません
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <Link
                  href={`/dashboard/board/${post.id}`}
                  className="flex-1"
                >
                  <h2 className="text-lg font-semibold hover:text-blue-600 transition">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>{post.authorName}</span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                    <span>コメント {post.commentCount}件</span>
                  </div>
                </Link>
                {(session?.role === "admin" ||
                  session?.id === post.authorId) && (
                  <form action={deletePostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-400 hover:text-red-600 ml-4"
                    >
                      削除
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
