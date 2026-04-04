"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function loginAction(
  _prevState: { error: string },
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  const db = getDb();
  const user = db
    .prepare("SELECT * FROM User WHERE email = ? AND role = 'admin'")
    .get(email) as { id: string; password: string | null } | undefined;

  if (!user || !user.password) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  const token = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  redirect("/dashboard");
}

export async function memberLoginAction(
  _prevState: { error: string },
  formData: FormData
) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "メールアドレスを入力してください" };
  }

  const db = getDb();
  const user = db
    .prepare("SELECT * FROM User WHERE email = ? AND active = 1")
    .get(email) as { id: string; role: string } | undefined;

  if (!user) {
    return { error: "登録されていないメールアドレスです" };
  }

  // For simplicity in dev: directly create session for members
  // In production, you'd send a magic link email
  const token = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
