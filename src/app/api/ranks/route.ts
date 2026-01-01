import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  // 0. 認証チェック
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Cloudflareの環境変数(env)を取得
  const { env } = await getCloudflareContext();

  // 2. D1データベース("DB")に対してSQLを実行
  // prepare: SQLの準備, all: 全件取得
  const results = await env.DB.prepare(
    "SELECT * FROM rank_thresholds ORDER BY sort_order ASC"
  ).all();

  // 3. 結果をJSONとしてブラウザに返す
  return NextResponse.json(results.results);
}