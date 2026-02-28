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
  const rawExternalUserId = formData.get("external_user_id");
  
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

  // external_user_id のバリデーション（任意フィールド）
  let externalUserId: string | null = null;
  if (rawExternalUserId && typeof rawExternalUserId === 'string') {
    const trimmed = rawExternalUserId.replace(/[\x00-\x1F\x7F]/g, '').trim();
    if (trimmed.length > 100) {
      throw new Error("External user ID too long");
    }
    externalUserId = trimmed.length > 0 ? trimmed : null;
  }

  const db = getDb();
  // Using UPSERT (INSERT OR REPLACE) to ensure user exists even if they were deleted before
  await db.prepare(`
    INSERT INTO users (user_id, display_name, external_user_id, created_at) 
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET 
      display_name = excluded.display_name,
      external_user_id = excluded.external_user_id
  `)
    .bind(userId, displayName, externalUserId)
    .run();

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/import");
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

/**
 * 保存済みの外部ユーザーIDを取得する
 */
export async function getExternalUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const db = getDb();
  const result = await db
    .prepare("SELECT external_user_id FROM users WHERE user_id = ?")
    .bind(userId)
    .first<{ external_user_id: string | null }>();

  return result?.external_user_id ?? null;
}
