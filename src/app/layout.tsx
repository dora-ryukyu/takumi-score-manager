import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
	variable: "--font-noto-sans-jp",
	subsets: ["latin"],
	weight: ["400", "700"],
});



export const metadata: Metadata = {
	title: "TAKUMI³ Score Manager",
	description: "TAKUMI³のスコア管理ツール",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider proxyUrl={process.env.NEXT_PUBLIC_CLERK_PROXY_URL}>
			<html lang="ja">
				<head>
					<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
				</head>
				<body className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} antialiased font-sans`}>
					<ThemeProvider>
						<Header />
						{children}
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
