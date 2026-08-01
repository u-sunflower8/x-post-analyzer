# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

X（旧Twitter）投稿のCSVエクスポートをAIが分析し、伸びる投稿の「勝ちパターン」を可視化し、次回投稿案まで生成する個人向けWebアプリ。詳細な要件は `要件定義書.md`（プロジェクトルート）を参照すること。実装や設計判断で迷ったら、まずこのファイルを確認する。

## Commands

- `npm run dev` — 開発サーバー起動 (Vite)
- `npm run build` — 型チェック (`tsc -b`) + 本番ビルド
- `npm run lint` — Lint実行 (oxlint)
- `npm run preview` — ビルド成果物のプレビュー
- `npx vercel dev` — `/api`（OpenAI連携）を含めてフルに動作確認する場合。要 Vercel CLIログイン（`npx vercel whoami` で確認）

このプロジェクトに単体テストランナーは未導入。テストを追加する場合はコマンドをここに追記すること。
ロジック検証は `fixtures/sample-posts.csv`（30件）・`fixtures/sample-posts-1000.csv`（1000件、性能確認用）を
CSVアップロード画面から読み込んで行う。

## Architecture

### 現状
F-01〜F-12（要件定義書のMVPスコープ全機能）実装済み。`src/features/*` にCSVアップロード・エンゲージメント計算・
ダッシュボード・チャート・投稿一覧・投稿ランキング・投稿詳細・AI分析・投稿生成が feature-based で分かれている。
`src/shared/*` に型定義・LocalStorageアクセス（`postsRepository.ts`）・`postsStore.ts`（`useSyncExternalStore`）
などの共有ロジックがある。ページは `src/pages/*`、ルーティングは `src/app/router.tsx`（`React.lazy` でルート単位に
コード分割）。`/api`（リポジトリ直下、`src` 配下ではない）が Vercel Serverless Functions で、OpenAI呼び出しは
必ずここを経由する（`api/_lib/openaiClient.ts` がキー未設定時に `MissingApiKeyError` を投げ、各エンドポイントは
`503 MISSING_API_KEY` を返す）。

### 技術スタック（要件定義書 §5 制約条件より）
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Recharts（グラフ）
- Papa Parse（CSVパース）
- OpenAI API（AI分析・投稿生成）
- LocalStorage（データ永続化、DBなし）

### 構成方針
- Feature-based（または Atomic Design）でディレクトリを構成する。機能単位（CSVアップロード、投稿一覧、ダッシュボード、AI分析、投稿生成など）でまとめる。
- `any` 禁止。型は必ず明示する（`tsconfig.app.json`/`tsconfig.api.json` とも `strict: true`）。
- ESLint/Prettier相当のフォーマット規約に従う（現状は oxlint 設定を使用）。
- shadcn/uiはこのプロジェクトでは Radix ではなく **Base UI**（`@base-ui/react`）ベース。`asChild` パターンは無く、代わりに `render` prop で合成する（例: `<Button render={<Link to="/x" />}>`）。

### セキュリティ上の重要なルール
- **OpenAI APIキーをフロントエンドに絶対に埋め込まない。** AI分析・投稿生成の呼び出しはサーバーサイド（Vercel Serverless Functions等）経由でプロキシし、キーは `.env` で管理する。
- ユーザーがアップロードするCSVの入力バリデーションを必ず行う（不正な形式・欠損列を弾く）。

### データフロー（実装済み）
1. ユーザーがCSVをアップロード → Papa Parseでパース・バリデーション
2. パース結果をLocalStorageに保存
3. エンゲージメント指標を計算し、ダッシュボード/一覧/グラフ/ランキングに反映
4. 「AI分析」実行時のみ、投稿データをサーバーサイドAPI経由でOpenAIに送信し、勝ちパターン分析・投稿単位の改善提案・次回投稿3案を取得

### 重要: CSVデータの出所（要件定義書からの実装上の変更点）
Xは無料・有料アカウントとも「投稿本文つきの投稿別CSV」を直接エクスポートする機能を提供していない
（アナリティクスホームの日別集計CSVのみ）。そのため実際の運用は **Notionデータベースで手動収集 →
NotionのCSVエクスポート機能でCSV化 → アップロード** を前提としている（詳細は README.md「データの
集め方」節、テンプレートは `fixtures/notion-template.csv`）。これに合わせて
`src/features/csv-upload/lib/normalizeHeaders.ts` の `COLUMN_ALIASES` には日本語のNotionプロパティ名
（本文・投稿日時・表示回数・いいね数・リポスト数・返信数等）を追加しており、また `mapRowToPost` は
`engagements`（合計エンゲージメント数）列が無い場合に `likes + retweets + replies` で自動補完する
（手動収集データには合計列が存在しないため）。この列名セットを変更する場合はREADMEのテーブルも
合わせて更新すること。

### 画面遷移（要件定義書 §6）
ダッシュボード ⇄ CSV読込／AI分析 ⇄ 投稿一覧／投稿詳細 → 投稿生成

### スコープ外（Phase2、実装しないこと）
X API連携、投稿予約、自動投稿、競合分析、フォロワー分析、チーム利用、課金機能。
