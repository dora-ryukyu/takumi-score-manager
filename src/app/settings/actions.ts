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
  await db.prepare("UPDATE users SET display_name = ? WHERE user_id = ?")
    .bind(displayName, userId)
    .run();

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
}
