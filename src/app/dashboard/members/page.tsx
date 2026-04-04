import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { dbAll } from "@/lib/db";
import { DeleteMemberButton } from "./delete-button";

export default async function MembersPage() {
  await requireAdmin();

  const members = await dbAll<{
    id: string;
    email: string;
    name: string;
    role: string;
    active: number;
    createdAt: string;
  }>(
    "SELECT id, email, name, role, active, createdAt FROM User ORDER BY createdAt DESC"
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">会員管理</h1>
        <Link
          href="/dashboard/members/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          + 会員を登録
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">
                名前
              </th>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">
                メールアドレス
              </th>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">
                権限
              </th>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">
                ステータス
              </th>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">
                登録日
              </th>
              <th className="text-right px-5 py-3 text-sm font-medium text-gray-500">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm font-medium">
                  {member.name}
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">
                  {member.email}
                </td>
                <td className="px-5 py-3 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      member.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {member.role === "admin" ? "管理者" : "会員"}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      member.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {member.active ? "有効" : "無効"}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">
                  {new Date(member.createdAt).toLocaleDateString("ja-JP")}
                </td>
                <td className="px-5 py-3 text-sm text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/members/${member.id}/edit`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      編集
                    </Link>
                    {member.role !== "admin" && (
                      <DeleteMemberButton memberId={member.id} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
