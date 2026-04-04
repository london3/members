"use client";

import { useActionState } from "react";
import { sendEventInviteAction } from "@/lib/actions/invite-actions";

export function InviteButton({ eventId }: { eventId: string }) {
  const [state, formAction, isPending] = useActionState(
    sendEventInviteAction,
    { error: "", success: "" }
  );

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="eventId" value={eventId} />
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {isPending ? "送信中..." : "出欠確認メールを一斉送信"}
        </button>
      </form>
      {state.success && (
        <p className="text-sm text-green-600 mt-2">{state.success}</p>
      )}
      {state.error && (
        <p className="text-sm text-red-600 mt-2">{state.error}</p>
      )}
    </div>
  );
}
