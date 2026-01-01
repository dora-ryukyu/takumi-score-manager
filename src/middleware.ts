// middleware.ts
import { NextResponse, NextRequest, NextFetchEvent } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

function proxyMiddleware(req: NextRequest) {
  // /__clerk 配下だけを確実に拾う
  if (req.nextUrl.pathname.startsWith("/__clerk")) {
    const proxyHeaders = new Headers(req.headers);

    // 必須ヘッダー（公式要件）
    proxyHeaders.set("Clerk-Proxy-Url", process.env.NEXT_PUBLIC_CLERK_PROXY_URL || "");
    proxyHeaders.set("Clerk-Secret-Key", process.env.CLERK_SECRET_KEY || "");
    proxyHeaders.set(
      "X-Forwarded-For",
      req.headers.get("CF-Connecting-IP") || req.headers.get("X-Forwarded-For") || ""
    );

    const proxyUrl = new URL(req.url);
    proxyUrl.host = "frontend-api.clerk.dev";
    proxyUrl.port = "443";
    proxyUrl.protocol = "https:"; // URL的には https: が安全
    proxyUrl.pathname = proxyUrl.pathname.replace("/__clerk", "");

    return NextResponse.rewrite(proxyUrl, {
      request: { headers: proxyHeaders },
    });
  }

  return null;
}

const clerkHandler = clerkMiddleware();

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const proxyResponse = proxyMiddleware(req);
  if (proxyResponse) return proxyResponse;

  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc|__clerk)(.*)",
  ],
};
