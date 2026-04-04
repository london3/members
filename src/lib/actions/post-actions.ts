"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, generateId } from "@/lib/db";
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

  const db = getDb();
  const id = generateId();

  db.prepare(
    "INSERT INTO Post (id, title, content, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))"
  ).run(id, title, content, session.id);

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

  const db = getDb();

  db.prepare(
    "INSERT INTO Comment (id, content, postId, authorId, createdAt) VALUES (?, ?, ?, ?, datetime('now'))"
  ).run(generateId(), content, postId, session.id);

  revalidatePath(`/dashboard/board/${postId}`);
  return { error: "" };
}

export async function deletePostAction(formData: FormData) {
  const session = await requireSession();

  const id = formData.get("id") as string;
  if (!id) return;

  const db = getDb();
  // Only author or admin can delete
  if (session.role === "admin") {
    db.prepare("DELETE FROM Post WHERE id = ?").run(id);
  } else {
    db.prepare("DELETE FROM Post WHERE id = ? AND authorId = ?").run(
      id,
      session.id
    );
  }

  revalidatePath("/dashboard/board");
}
