"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createMemberAction,
  updateMemberAction,
} from "@/lib/actions/member-actions";

interface MemberFormProps {
  member?: {
    id: string;
    email: string;
    name: string;
    active: number;
  };
}

export function MemberForm({ member }: MemberFormProps) {
  const action = member ? updateMemberAction : createMemberAction;
  const [state, formAction, pending] = useActionState(action, {
    error: "",
  });

  return (
    <form action={formAction} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      {member && <input type="hidden" name="id" value={member.id} />}

      <div>
        <label className="block text-sm font-medium mb-1">名前</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={member?.name}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          メールアドレス
        </label>
        <input
          type="email"
          name="email"
          required
          defaultValue={member?.email}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {member && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            id="active"
            defaultChecked={!!member.active}
            className="rounded"
          />
          <label htmlFor="active" className="text-sm">
            有効
          </label>
        </div>
      )}

      {state?.error && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {pending ? "保存中..." : member ? "更新" : "登録"}
        </button>
        <Link
          href="/dashboard/members"
          className="px-6 py-2 rounded-lg text-sm border hover:bg-gray-50 transition"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
