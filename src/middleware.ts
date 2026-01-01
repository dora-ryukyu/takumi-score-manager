// middleware.ts（src ディレクトリ構成なら src/middleware.ts）
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Next.js 内部や静的ファイルを避けつつ、通常ページはカバー
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API は常にカバー
    '/(api|trpc)(.*)',
  ],
}
