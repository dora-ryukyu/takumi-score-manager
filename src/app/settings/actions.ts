'use server'

import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/d1";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const displayName = formData.get("display_name") as string;
  
  // Basic validation (length, etc.)
  if (displayName && displayName.length > 50) {
    throw new Error("Display Name too long");
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
