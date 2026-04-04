"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createEventAction,
  updateEventAction,
} from "@/lib/actions/event-actions";

interface EventFormProps {
  event?: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    capacity: number | null;
  };
}

export function EventForm({ event }: EventFormProps) {
  const action = event ? updateEventAction : createEventAction;
  const [state, formAction, pending] = useActionState(action, {
    error: "",
  });

  const defaultDate = event
    ? new Date(event.date).toISOString().slice(0, 16)
    : "";

  return (
    <form action={formAction} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      {event && <input type="hidden" name="id" value={event.id} />}

      <div>
        <label className="block text-sm font-medium mb-1">
          イベント名
        </label>
        <input
          type="text"
          name="title"
          required
          defaultValue={event?.title}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">説明</label>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={event?.description}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">日時</label>
          <input
            type="datetime-local"
            name="date"
            required
            defaultValue={defaultDate}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">場所</label>
          <input
            type="text"
            name="location"
            required
            defaultValue={event?.location}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          定員（任意）
        </label>
        <input
          type="number"
          name="capacity"
          min={1}
          defaultValue={event?.capacity ?? ""}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="未設定の場合は制限なし"
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
          {pending ? "保存中..." : event ? "更新" : "作成"}
        </button>
        <Link
          href="/dashboard/events"
          className="px-6 py-2 rounded-lg text-sm border hover:bg-gray-50 transition"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
