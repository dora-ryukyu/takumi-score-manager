import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { BookOpen } from "lucide-react";

export default function Home() {
	return (
		<div className="font-sans min-h-[calc(100vh-64px)] grid grid-rows-[auto_1fr_auto] bg-[var(--color-background)] text-[var(--color-foreground)]">
			{/* Hero Section */}
			<main className="flex flex-col items-center justify-center text-center px-4 sm:px-8 py-20 gap-8">
				<div className="space-y-4 max-w-2xl">
					<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-foreground)] leading-tight">
						TAKUMI³のスコアを、<br />
						<span className="text-[var(--color-accent)]">もっとスマートに。</span>
					</h1>
					<p className="text-lg text-[var(--color-foreground)] opacity-70 leading-relaxed">
						スコアデータを取り込んで、ベストスコアやレートを簡単に管理・分析。<br className="hidden sm:block" />
						あなたの成長を可視化するツールです。
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
					<SignedOut>
						<SignInButton mode="modal">
							<button className="bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg w-full sm:w-auto">
								ログインして始める
							</button>
						</SignInButton>
					</SignedOut>

					<SignedIn>
						<Link
							href="/dashboard"
							className="bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg w-full sm:w-auto inline-flex items-center justify-center"
						>
							スコア一覧へ
						</Link>
					</SignedIn>

					{/* Guide link */}
					<Link
						href="/guide"
						className="border border-[var(--color-header-border)] text-[var(--color-foreground)] font-bold py-3 px-8 rounded-full transition-all hover:bg-[var(--color-menu-hover)] text-lg w-full sm:w-auto inline-flex items-center justify-center gap-2"
					>
						<BookOpen size={20} />
						使い方
					</Link>
				</div>

				{/* Feature Highlights */}
				<div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left max-w-4xl w-full">
					<div className="bg-[var(--color-card-bg)] p-6 rounded-2xl shadow-sm border border-[var(--color-header-border)]">
						<div className="w-10 h-10 bg-[var(--color-accent)]/20 rounded-lg flex items-center justify-center mb-4 text-[var(--color-accent)] font-bold">
							1
						</div>
						<h3 className="font-bold text-lg mb-2 text-[var(--color-foreground)]">スコアインポート</h3>
						<p className="text-[var(--color-foreground)] opacity-60 text-sm">
							ユーザーIDを入力するだけでスコアを自動取得。CSVからの読み込みにも対応。
						</p>
					</div>
					<div className="bg-[var(--color-card-bg)] p-6 rounded-2xl shadow-sm border border-[var(--color-header-border)]">
						<div className="w-10 h-10 bg-[var(--color-accent)]/20 rounded-lg flex items-center justify-center mb-4 text-[var(--color-accent)] font-bold">
							2
						</div>
						<h3 className="font-bold text-lg mb-2 text-[var(--color-foreground)]">レート計算 & スコア管理</h3>
						<p className="text-[var(--color-foreground)] opacity-60 text-sm">
							譜面定数に基づくレートを自動算出し、過去のスコア推移も確認可能。
						</p>
					</div>
					<div className="bg-[var(--color-card-bg)] p-6 rounded-2xl shadow-sm border border-[var(--color-header-border)]">
						<div className="w-10 h-10 bg-[var(--color-accent)]/20 rounded-lg flex items-center justify-center mb-4 text-[var(--color-accent)] font-bold">
							3
						</div>
						<h3 className="font-bold text-lg mb-2 text-[var(--color-foreground)]">レート対象曲画像生成</h3>
						<p className="text-[var(--color-foreground)] opacity-60 text-sm">
							あなたのベスト40をまとめた画像を生成してSNSでシェア。
						</p>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="py-8 text-center text-[var(--color-foreground)]">
				<div className="mb-6">
					<Link 
						href="/legal" 
						className="inline-block px-6 py-2 rounded-full border border-[var(--color-header-border)] hover:bg-[var(--color-menu-hover)] hover:text-[var(--color-accent)] transition-all font-medium"
					>
						プライバシーポリシー・利用規約
					</Link>
				</div>
				<p className="opacity-40 text-sm">&copy; {new Date().getFullYear()} TAKUMI³ Score Manager. All rights reserved.</p>
			</footer>
		</div>
	);
}
