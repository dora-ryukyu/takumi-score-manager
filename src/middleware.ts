// middleware.ts
import { NextResponse, NextRequest, NextFetchEvent } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

async function proxyMiddleware(req: NextRequest): Promise<Response | null> {
  // /__clerk 配下だけを確実に拾う
  if (req.nextUrl.pathname.startsWith("/__clerk")) {
    const proxyHeaders = new Headers();

    // リクエストヘッダーから必要なものをコピー
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

    // 必須ヘッダー（公式要件）
    proxyHeaders.set("Clerk-Proxy-Url", process.env.NEXT_PUBLIC_CLERK_PROXY_URL || "");
    proxyHeaders.set("Clerk-Secret-Key", process.env.CLERK_SECRET_KEY || "");
    proxyHeaders.set(
      "X-Forwarded-For",
      req.headers.get("CF-Connecting-IP") || req.headers.get("X-Forwarded-For") || ""
    );

    const proxyUrl = new URL(req.url);
    proxyUrl.host = "frontend-api.clerk.dev";
    proxyUrl.port = "";
    proxyUrl.protocol = "https:";
    proxyUrl.pathname = proxyUrl.pathname.replace("/__clerk", "");

    // fetch を使って外部APIに直接リクエスト（rewriteではなく）
    // redirect: 'manual' でリダイレクトを自動フォローしない（再帰ループ防止）
    let body: ArrayBuffer | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      // バイナリデータ（画像など）を正しく転送するためArrayBufferを使用
      body = await req.arrayBuffer();
    }

    const response = await fetch(proxyUrl.toString(), {
      method: req.method,
      headers: proxyHeaders,
      body: body,
      redirect: "manual",
    });

    // レスポンスヘッダーをコピー（Content-Typeなど重要なヘッダーを保持）
    const responseHeaders = new Headers();
    
    // 必要なヘッダーを明示的にコピー
    const headersToPreserve = [
      "content-type",
      "content-length",
      "cache-control",
      "etag",
      "last-modified",
      "set-cookie",
      "location",
    ];
    for (const header of headersToPreserve) {
      const value = response.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
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
