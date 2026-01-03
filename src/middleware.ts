// middleware.ts
import { NextResponse, NextRequest, NextFetchEvent } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

// 本番環境ではデバッグログを抑制（セキュリティ対策）
const isDev = process.env.NODE_ENV === 'development';
const debugLog = (...args: unknown[]) => { if (isDev) console.log(...args); };
const debugError = (...args: unknown[]) => { if (isDev) console.error(...args); };

async function proxyMiddleware(req: NextRequest): Promise<Response | null> {
  // /__clerk 配下だけを確実に拾う
  if (req.nextUrl.pathname.startsWith("/__clerk")) {
    const proxyHeaders = new Headers();

    // 1. 環境変数のチェック (ログ出し)
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.error("❌ CLERK_SECRET_KEY is missing in middleware!");
    } else {
      // セキュリティのため先頭数文字だけ出すとか、あるいは"Present"とだけ出す
      // console.log("✅ CLERK_SECRET_KEY is present.");
    }

    // 2. リクエストヘッダーから必要なものをコピー
    const headersToForward = [
      "accept",
      "accept-language",
      "content-type",
      "authorization",
      "cookie",
      "user-agent",
      "origin",
      "referer",
    ];
    for (const header of headersToForward) {
      const value = req.headers.get(header);
      if (value) {
        proxyHeaders.set(header, value);
      }
    }

    // 3. 必須ヘッダー（公式要件 + 認証に必要な追加ヘッダー）
    proxyHeaders.set("Clerk-Proxy-Url", process.env.NEXT_PUBLIC_CLERK_PROXY_URL || "");
    proxyHeaders.set("Clerk-Secret-Key", secretKey || "");
    
    // IPアドレス
    proxyHeaders.set(
      "X-Forwarded-For",
      req.headers.get("CF-Connecting-IP") || req.headers.get("X-Forwarded-For") || ""
    );
    
    // ホスト名 (これがないと 401 になりやすい)
    proxyHeaders.set("X-Forwarded-Host", req.headers.get("host") || "");
    
    // プロトコル (https)
    proxyHeaders.set("X-Forwarded-Proto", req.nextUrl.protocol.replace(":", ""));
    
    // 元のURL全体
    proxyHeaders.set("X-Url", req.url);


    // 4. 転送先URLの構築
    const proxyUrl = new URL(req.url);
    proxyUrl.host = "frontend-api.clerk.dev";
    proxyUrl.port = ""; // デフォルトポート(443)を使うので空で良いが、指定してもよい
    proxyUrl.protocol = "https:";
    proxyUrl.pathname = proxyUrl.pathname.replace("/__clerk", "");

    // 5. fetch で転送 (rewriteだと再帰する場合があるため)
    let body: ArrayBuffer | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.arrayBuffer();
    }

    debugLog(`[Proxy] Forwarding ${req.method} ${req.nextUrl.pathname} to ${proxyUrl.toString()}`);

    try {
      const response = await fetch(proxyUrl.toString(), {
        method: req.method,
        headers: proxyHeaders,
        body: body,
        redirect: "manual", // 自動リダイレクトしない
      });

      debugLog(`[Proxy] Response status: ${response.status}`);
      
      // エラー時はレスポンス内容をログに出す (デバッグ用)
      if (response.status >= 400) {
        try {
          // コンテンツタイプがJSONかテキストか確認
          const text = await response.clone().text();
          debugError(`[Proxy] Clerk API returned error status: ${response.status}`);
          debugError(`[Proxy] Error body: ${text}`);
       } catch (readErr) {
          debugError(`[Proxy] Failed to read error body: ${readErr}`);
       }
      }

      // 6. レスポンスヘッダーのコピー
      const responseHeaders = new Headers();
      const headersToPreserve = [
        "content-type",
        "content-length",
        "cache-control",
        "etag",
        "last-modified",
        "location",
        "www-authenticate",
      ];
      for (const header of headersToPreserve) {
        const value = response.headers.get(header);
        if (value) {
          responseHeaders.set(header, value);
        }
      }

      // Set-Cookieは特別扱いしないと複数のCookieが壊れることがある
      // Cloudflare Workers / Node 18+ では getSetCookie() が使える
      if (typeof response.headers.getSetCookie === "function") {
        const cookies = response.headers.getSetCookie();
        for (const cookie of cookies) {
          responseHeaders.append("set-cookie", cookie);
        }
      } else {
        // フォールバック (getSetCookieがない場合)
        const cookie = response.headers.get("set-cookie");
        if (cookie) {
          responseHeaders.set("set-cookie", cookie);
        }
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (e) {
      debugError("[Proxy] Fetch error:", e);
      return new Response("Internal Server Error (Proxy)", { status: 500 });
    }
  }

  return null;
}

const clerkHandler = clerkMiddleware();

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const proxyResponse = await proxyMiddleware(req);
  if (proxyResponse) return proxyResponse;

  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc|__clerk)(.*)",
  ],
};
