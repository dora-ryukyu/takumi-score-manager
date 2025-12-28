import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getUserProfile } from "@/lib/auth";
import { LayoutDashboard, Settings } from "lucide-react";

export default async function Header() {
  const profile = await getUserProfile();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: App Title */}
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl tracking-tight text-blue-900 hover:text-blue-700 transition-colors flex items-center gap-2">
            <span className="bg-blue-600 text-white p-1 rounded-md text-sm font-extrabold shadow-sm">T3</span>
            <span>TAKUMI³ Manager</span>
          </Link>
        </div>

        {/* Right: User User & Action */}
        <div className="flex items-center gap-6">
          <SignedIn>
            <nav className="flex items-center gap-1 sm:gap-2">
               <Link 
                href="/dashboard" 
                className="p-2 sm:px-3 sm:py-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2 group"
                title="ダッシュボード"
               >
                 <LayoutDashboard size={22} className="group-hover:scale-105 transition-transform" />
                 <span className="hidden sm:inline font-medium text-sm">ダッシュボード</span>
               </Link>

               <Link 
                href="/settings" 
                className="p-2 sm:px-3 sm:py-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2 group"
                title="設定"
               >
                 <Settings size={22} className="group-hover:rotate-45 transition-transform duration-300" />
                 <span className="hidden sm:inline font-medium text-sm">設定</span>
               </Link>
            </nav>
            
            <div className="h-6 w-px bg-slate-200 mx-2" />
            
            <div className="flex items-center gap-3">
              {profile && (
                 // Use custom display name next to icon? 
                 // Actually UserButton handles icon. We can just show name if needed, but space is simpler.
                 // Let's hide name on mobile, show on desktop.
                 <span className="text-sm font-semibold text-slate-700 hidden lg:block">
                    {profile.displayName}
                 </span>
              )}
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-full transition-colors">
                ログイン
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
