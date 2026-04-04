"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dbGet, dbRun, generateId } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function createMemberAction(
  _prevState: { error: string },
  formData: FormData
) {
  await requireAdmin();

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  if (!email || !name) {
    return { error: "メールアドレスと名前は必須です" };
  }

  const existing = await dbGet<{ id: string }>(
    "SELECT id FROM User WHERE email = ?",
    [email]
  );

  if (existing) {
    return { error: "このメールアドレスは既に登録されています" };
  }

  await dbRun(
    "INSERT INTO User (id, email, name, role, active, createdAt, updatedAt) VALUES (?, ?, ?, 'member', 1, datetime('now'), datetime('now'))",
    [generateId(), email, name]
  );

  revalidatePath("/dashboard/members");
  redirect("/dashboard/members");
}

export async function updateMemberAction(
  _prevState: { error: string },
  formData: FormData
) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const active = formData.get("active") === "on" ? 1 : 0;

  if (!id || !email || !name) {
    return { error: "必須項目を入力してください" };
  }

  const existing = await dbGet<{ id: string }>(
    "SELECT id FROM User WHERE email = ? AND id != ?",
    [email, id]
  );

  if (existing) {
    return { error: "このメールアドレスは既に使用されています" };
  }

  await dbRun(
    "UPDATE User SET email = ?, name = ?, active = ?, updatedAt = datetime('now') WHERE id = ?",
    [email, name, active, id]
  );

  revalidatePath("/dashboard/members");
  redirect("/dashboard/members");
}

export async function deleteMemberAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return;

  await dbRun("DELETE FROM User WHERE id = ? AND role != 'admin'", [id]);

  revalidatePath("/dashboard/members");
}
