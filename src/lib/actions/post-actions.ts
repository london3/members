"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dbRun, generateId } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function createPostAction(
  _prevState: { error: string },
  formData: FormData
) {
  const session = await requireSession();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) {
    return { error: "タイトルと内容は必須です" };
  }

  const id = generateId();

  await dbRun(
    "INSERT INTO Post (id, title, content, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))",
    [id, title, content, session.id]
  );

  revalidatePath("/dashboard/board");
  redirect("/dashboard/board");
}

export async function createCommentAction(
  _prevState: { error: string },
  formData: FormData
) {
  const session = await requireSession();

  const postId = formData.get("postId") as string;
  const content = formData.get("content") as string;

  if (!postId || !content) {
    return { error: "コメントを入力してください" };
  }

  await dbRun(
    "INSERT INTO Comment (id, content, postId, authorId, createdAt) VALUES (?, ?, ?, ?, datetime('now'))",
    [generateId(), content, postId, session.id]
  );

  revalidatePath(`/dashboard/board/${postId}`);
  return { error: "" };
}

export async function deletePostAction(formData: FormData) {
  const session = await requireSession();

  const id = formData.get("id") as string;
  if (!id) return;

  if (session.role === "admin") {
    await dbRun("DELETE FROM Post WHERE id = ?", [id]);
  } else {
    await dbRun("DELETE FROM Post WHERE id = ? AND authorId = ?", [
      id,
      session.id,
    ]);
  }

  revalidatePath("/dashboard/board");
}
