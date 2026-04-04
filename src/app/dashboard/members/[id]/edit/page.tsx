import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { dbGet } from "@/lib/db";
import { MemberForm } from "../../member-form";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const member = await dbGet<{
    id: string; email: string; name: string; active: number;
  }>("SELECT id, email, name, active FROM User WHERE id = ?", [id]);

  if (!member) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">会員を編集</h1>
      <MemberForm member={member} />
    </div>
  );
}
