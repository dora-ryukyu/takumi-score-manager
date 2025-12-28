import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function GET() {
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