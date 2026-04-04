"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createPostAction } from "@/lib/actions/post-actions";

export function PostForm() {
  const [state, formAction, pending] = useActionState(createPostAction, {
    error: "",
  });

  return (
    <form action={formAction} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">タイトル</label>
        <input
          type="text"
          name="title"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">内容</label>
        <textarea
          name="content"
          required
          rows={8}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {state?.error && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {pending ? "投稿中..." : "投稿する"}
        </button>
        <Link
          href="/dashboard/board"
          className="px-6 py-2 rounded-lg text-sm border hover:bg-gray-50 transition"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
