# TAKUMI³ Score Manager

音楽ゲーム「TAKUMI³」のスコア管理・レート計算支援ツールです。  
非公式ツールであり、公式とは一切関係ありません。

## 🚀 機能概要

- **スコア管理**: 登録された全スコアを一覧表示、フィルタリング、ソートが可能。
- **CSVインポート**: TAKUMI³からエクスポートしたCSVファイルを読み込み、スコアを一括登録・更新。
- **レート計算**: 譜面定数とスコアに基づき、単曲レートおよび総合レート（ベスト40枠）を自動計算。
- **画像生成**: レート対象曲（ベスト枠）の一覧画像を生成し、SNS共有用に保存可能。
- **計算機**:
  - スコア → 単曲レート計算
  - 目標レート → 必要スコア逆算
- **スコア推移**: 各楽曲のスコア更新履歴をグラフで可視化。
- **その他**:
  - ダークモード/ライトモード切替
  - Clerkによるユーザー認証
  - レスポンシブデザイン（PC/スマホ対応）

## 🛠️ 技術スタック

このプロジェクトは、最新のWeb標準技術とCloudflareのエッジコンピューティングを活用して構築されています。

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Deployment**: [OpenNext](https://opennext.js.org/) on Cloudflare Workers
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **Authentication**: [Clerk](https://clerk.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
