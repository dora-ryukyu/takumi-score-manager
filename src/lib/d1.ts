import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDb(): D1Database {
  // Access the Cloudflare environment
  // We cast to any to support both 'DB' (from wrangler.jsonc) and 'score_db' (from cloudflare-env.d.ts)
  // just in case of mismatch, though 'DB' is the runtime binding name.
  const env = getCloudflareContext().env as any;
  
  if (env.DB) {
    return env.DB as D1Database;
  }
  
  if (env.score_db) {
    return env.score_db as D1Database;
  }

  throw new Error("D1 Database binding 'DB' or 'score_db' not found in Cloudflare context.");
}
