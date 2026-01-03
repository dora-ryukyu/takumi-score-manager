'use server'

import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/d1";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const rawDisplayName = formData.get("display_name");
  
  // サーバーサイドの入力検証（フロントエンドを信用しない）
  // null/undefined チェック
  if (rawDisplayName === null || rawDisplayName === undefined) {
    throw new Error("Display name is required");
  }

  // 文字列型の確認
  if (typeof rawDisplayName !== 'string') {
    throw new Error("Invalid input type");
  }

  // 制御文字を除去し、前後の空白をトリム
  const displayName = rawDisplayName
    .replace(/[\x00-\x1F\x7F]/g, '') // 制御文字除去
    .trim();
  
  // 空チェック（空白のみの場合を含む）
  if (displayName.length === 0) {
    throw new Error("Display name cannot be empty");
  }

  // 長さ制限
  if (displayName.length > 50) {
    throw new Error("Display name too long");
  }

  const db = getDb();
  // Using UPSERT (INSERT OR REPLACE) to ensure user exists even if they were deleted before
  await db.prepare(`
    INSERT INTO users (user_id, display_name, created_at) 
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET display_name = excluded.display_name
  `)
    .bind(userId, displayName)
    .run();

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
}

export async function deleteUserData() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const db = getDb();
  
  // Transaction-like execution (D1 doesn't support full transactions in HTTP API easily, but we run sequentially)
  // We deletes dependent data first, then the user.
  const statements = [
    db.prepare("DELETE FROM best_current WHERE user_id = ?").bind(userId),
    db.prepare("DELETE FROM best_history WHERE user_id = ?").bind(userId),
    db.prepare("DELETE FROM import_log WHERE user_id = ?").bind(userId),
    db.prepare("DELETE FROM users WHERE user_id = ?").bind(userId)
  ];

  await db.batch(statements);

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
}
