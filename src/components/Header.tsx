import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: App Title */}
        <div className="flex items-center">
          <Link href="/" className="font-bold text-xl tracking-tight text-blue-900 hover:text-blue-700 transition-colors">
            TAKUMI³ Score Manager
          </Link>
        </div>

        {/* Right: User User & Action */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 hidden sm:block">
                {/* User name will be shown by UserButton usually, or we can add logic if needed. 
                    Clerk UserButton shows the avatar. */}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                ログイン
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
