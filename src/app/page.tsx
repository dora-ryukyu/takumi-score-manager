import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
	return (
		<div className="font-sans min-h-screen grid grid-rows-[auto_1fr_auto] bg-slate-50 text-slate-800">
			{/* Navbar */}
			<nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
				<div className="font-bold text-xl tracking-tight text-blue-900">
					TAKUMI³ Manager
				</div>
				<div>
					<SignedIn>
						<UserButton />
					</SignedIn>
					<SignedOut>
						<SignInButton mode="modal">
							<button className="text-sm font-medium hover:text-blue-600 transition-colors">
								ログイン
							</button>
						</SignInButton>
					</SignedOut>
				</div>
			</nav>

			{/* Hero Section */}
			<main className="flex flex-col items-center justify-center text-center px-4 sm:px-8 py-20 gap-8">
				<div className="space-y-4 max-w-2xl">
					<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
						TAKUMI³のスコアを、<br />
						<span className="text-blue-600">もっとスマートに。</span>
					</h1>
					<p className="text-lg text-slate-600 leading-relaxed">
						CSVをアップロードして、ベストスコアやレートを簡単に管理・分析。<br className="hidden sm:block" />
						あなたの成長を可視化するツールです。
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
					<SignedOut>
						<SignInButton mode="modal">
							<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg w-full sm:w-auto">
								ログインして始める
							</button>
						</SignInButton>
					</SignedOut>

					<SignedIn>
						<Link
							href="/dashboard"
							className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg w-full sm:w-auto inline-flex items-center justify-center"
						>
							ダッシュボードへ
						</Link>
					</SignedIn>
				</div>

				{/* Feature Highlights (Optional Visuals) */}
				<div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left max-w-4xl w-full">
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
						<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600 font-bold">
							1
						</div>
						<h3 className="font-bold text-lg mb-2">CSVインポート</h3>
						<p className="text-slate-500 text-sm">
							公式のエクスポートデータをそのまま読み込み可能。
						</p>
					</div>
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
						<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600 font-bold">
							2
						</div>
						<h3 className="font-bold text-lg mb-2">レート計算</h3>
						<p className="text-slate-500 text-sm">
							譜面定数に基づいた単曲・総合レートを自動算出。
						</p>
					</div>
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
						<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600 font-bold">
							3
						</div>
						<h3 className="font-bold text-lg mb-2">スコア管理</h3>
						<p className="text-slate-500 text-sm">
							過去と現在のスコアを比較し、上達を一目で確認。
						</p>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="py-8 text-center text-slate-400 text-sm">
				<p>&copy; {new Date().getFullYear()} TAKUMI³ Score Manager. All rights reserved.</p>
			</footer>
		</div>
	);
}
