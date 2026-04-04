"use client";

import { useActionState, useRef } from "react";
import { createCommentAction } from "@/lib/actions/post-actions";

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(createCommentAction, {
    error: "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
    >
      <input type="hidden" name="postId" value={postId} />
      <textarea
        name="content"
        required
        rows={3}
        placeholder="コメントを入力..."
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm"
      />
      {state?.error && (
        <p className="text-red-500 text-xs mt-1">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {pending ? "送信中..." : "コメントする"}
      </button>
    </form>
  );
}
