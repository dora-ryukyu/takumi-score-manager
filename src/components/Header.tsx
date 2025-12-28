import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getUserProfile } from "@/lib/auth";
import Menu from "./Menu";

export default async function Header() {
  const profile = await getUserProfile();

  return (
    <header className="bg-[var(--color-header-bg)] border-b border-[var(--color-header-border)] sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: App Title */}
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl tracking-tight text-[var(--color-foreground)] hover:opacity-80 transition-opacity flex items-center gap-2">
            {/* Logo Removed */}
            <span>TAKUMI³ Score Manager</span>
          </Link>
        </div>

        {/* Right: User & Action */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <div className="flex items-center gap-3">
              {profile && (
                 <span className="text-sm font-semibold text-[var(--color-foreground)] hidden lg:block">
                    {profile.displayName}
                 </span>
              )}
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    userButtonBox: "w-8 h-8"
                  }
                }}
              />
              <Menu />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-colors">
                ログイン
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
