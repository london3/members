"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth-actions";
import type { SessionUser } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: "🏠" },
  { href: "/dashboard/board", label: "掲示板", icon: "📋" },
  { href: "/dashboard/events", label: "イベント", icon: "📅" },
];

const adminItems = [
  { href: "/dashboard/members", label: "会員管理", icon: "👥" },
];

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();

  const items =
    user.role === "admin" ? [...navItems, ...adminItems] : navItems;

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-lg font-bold">会員管理システム</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full text-left text-sm text-gray-400 hover:text-white transition px-3 py-1.5 rounded hover:bg-gray-800"
          >
            ログアウト
          </button>
        </form>
      </div>
    </aside>
  );
}
