import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { CommentForm } from "./comment-form";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const post = db
    .prepare(
      "SELECT p.*, u.name as authorName FROM Post p JOIN User u ON p.authorId = u.id WHERE p.id = ?"
    )
    .get(id) as {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    authorName: string;
  } | undefined;

  if (!post) notFound();

  const comments = db
    .prepare(
      "SELECT c.*, u.name as authorName FROM Comment c JOIN User u ON c.authorId = u.id WHERE c.postId = ? ORDER BY c.createdAt ASC"
    )
    .all(id) as {
    id: string;
    content: string;
    createdAt: string;
    authorName: string;
  }[];

  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard/board"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; 掲示板に戻る
      </Link>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <div className="text-xs text-gray-400 mb-4">
          {post.authorName} ・{" "}
          {new Date(post.createdAt).toLocaleString("ja-JP")}
        </div>
        <div className="text-gray-700 whitespace-pre-wrap">{post.content}</div>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-5 border-b">
          <h2 className="font-semibold">コメント ({comments.length})</h2>
        </div>

        {comments.length > 0 && (
          <div className="divide-y">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleString("ja-JP")}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 border-t bg-gray-50 rounded-b-xl">
          <CommentForm postId={post.id} />
        </div>
      </div>
    </div>
  );
}
