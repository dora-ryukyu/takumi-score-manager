import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getUserProfile } from "@/lib/auth";

export default async function Header() {
  const profile = await getUserProfile();

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
            <div className="flex items-center gap-4">
              {profile && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                    {profile.displayName}
                  </span>
                  <Link href="/settings" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
                    設定
                  </Link>
                </div>
              )}
              {/* UserButton handles the image, but we want to show OUR custom image if possible? 
                  Clerk UserButton always shows Clerk image. We can't easily override the spurce inside UserButton. 
                  But we can hide UserButton and make our own menu, or just accept Clerk image there. 
                  The request said "Fix the User Icon... configure next.config".
                  The prompt says: "In the Dashboard header, use standard <img> tag or properly configured <Image>... Ensure it has alt={userName}"
                  This refers to the DASHBOARD header (the user stats card).
                  For the Global Header, using UserButton is fine, but maybe redundant if we show custom image?
                  UserButton is good for SignOut. Let's keep UserButton for account mgmt.
              */}
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
