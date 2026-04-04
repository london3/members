"use client";

import { useActionState, useState } from "react";
import { loginAction, memberLoginAction } from "@/lib/actions/auth-actions";

export function LoginForm() {
  const [mode, setMode] = useState<"admin" | "member">("member");
  const [adminState, adminFormAction, adminPending] = useActionState(
    loginAction,
    { error: "" }
  );
  const [memberState, memberFormAction, memberPending] = useActionState(
    memberLoginAction,
    { error: "" }
  );

  return (
    <div>
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setMode("member")}
          className={`flex-1 pb-3 text-sm font-medium ${
            mode === "member"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          会員ログイン
        </button>
        <button
          onClick={() => setMode("admin")}
          className={`flex-1 pb-3 text-sm font-medium ${
            mode === "admin"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          管理者ログイン
        </button>
      </div>

      {mode === "member" ? (
        <form action={memberFormAction}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
          {memberState?.error && (
            <p className="text-red-500 text-sm mb-4">{memberState.error}</p>
          )}
          <button
            type="submit"
            disabled={memberPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {memberPending ? "ログイン中..." : "ログイン"}
          </button>
          <p className="text-xs text-gray-400 mt-3 text-center">
            管理者から登録されたメールアドレスでログインできます
          </p>
        </form>
      ) : (
        <form action={adminFormAction}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">パスワード</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {adminState?.error && (
            <p className="text-red-500 text-sm mb-4">{adminState.error}</p>
          )}
          <button
            type="submit"
            disabled={adminPending}
            className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50 transition"
          >
            {adminPending ? "ログイン中..." : "管理者ログイン"}
          </button>
        </form>
      )}
    </div>
  );
}
