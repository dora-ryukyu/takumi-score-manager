import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDb(): D1Database {
  // Access the Cloudflare environment
  const env = getCloudflareContext().env as CloudflareEnv;

  if (!env.DB) {
    throw new Error("D1 Database binding 'DB' not found in Cloudflare context.");
  }

  return env.DB;
}
