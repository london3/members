import { requireAdmin } from "@/lib/auth";
import { MemberForm } from "../member-form";

export default async function NewMemberPage() {
  await requireAdmin();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">会員を登録</h1>
      <MemberForm />
    </div>
  );
}
