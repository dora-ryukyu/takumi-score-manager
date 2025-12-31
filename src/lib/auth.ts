import { auth, currentUser } from "@clerk/nextjs/server";
import { getDb } from "@/lib/d1";

export interface UserProfile {
  userId: string;
  displayName: string;
  imageUrl: string;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const db = getDb();
  const dbUser = await db.prepare("SELECT display_name FROM users WHERE user_id = ?").bind(userId).first<{ display_name: string }>();

  // Priority: DB Display Name > Clerk First Name > Clerk Username > "Player"
  const displayName = dbUser?.display_name || user.firstName || user.username || "Player";

  return {
    userId,
    displayName,
    imageUrl: user.imageUrl,
  };
}
