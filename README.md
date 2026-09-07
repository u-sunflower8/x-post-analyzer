# X Buzz Analyzer

Xの運用を「他人のバズ」と「自分の実績」の両面からAIで分析するツール。

- **バズ投稿検索**: X APIでキーワード検索し、エンゲージメントスコアでランキング。AIで各投稿の構造・心理面を分析し、その構造を抽象化してオリジナル投稿案を生成する（元投稿の文章は生成に使わない）。
- **自分の投稿分析**: 自分の過去投稿をCSV（Notion経由）・スクリーンショット・X APIから集め、ダッシュボードでKPI/傾向を可視化、AIで「勝ちパターン」を抽出、投稿ごとの改善提案、勝ちパターンに基づく次回投稿案の生成を行う。

旧プロジェクト（React+Vite / OpenAI / LocalStorage版）をこのNext.js版に統合した。旧版の要件定義は [要件定義書.md](./要件定義書.md) を参照（自分の投稿分析部分の背景・要件はここに記載されている）。

## セットアップ

```bash
npm install
cp .env.local.example .env.local
```

`.env.local` に以下を設定する。

| 変数 | 取得元 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabaseプロジェクト → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | 同上（**サーバー専用、絶対に公開しない**） |
| `X_BEARER_TOKEN` | [developer.x.com](https://developer.x.com) → App-only Bearer Token（従量課金プランで登録、月額固定費なし。投稿読み取り $0.005/件）。未設定でも「自分の投稿」機能（CSV/スクショ取込・ダッシュボード・勝ちパターン分析・改善提案・投稿生成）は利用可能。バズ検索とXからの自動取得のみこのキーが必須。 |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |

Supabaseのテーブルは `supabase/migrations/` 配下のSQLをすべてSQL Editorで実行して作成する
（`0001_init.sql` → `0002_own_posts.sql` の順。Supabase CLIを使う場合は `supabase db push`）。

```bash
npm run dev
```

## 画面構成

| パス | 内容 |
|---|---|
| `/` | バズ投稿検索・ランキング |
| `/posts/[id]` | バズ投稿の詳細・AI分析・投稿案生成 |
| `/dashboard` | 自分の投稿のKPIダッシュボード（時間帯・曜日・文字数ごとの傾向） |
| `/own-posts` | 自分の投稿一覧（CSVアップロード・スクショ取込・Xから自動取得） |
| `/own-posts/[id]` | 自分の投稿の詳細・改善提案 |
| `/analysis` | 自分の投稿の勝ちパターン分析・そこからの投稿案生成 |

## 自分の投稿データの集め方

Xには投稿ごとのCSV書き出し機能が公式には無いため、以下のいずれかで集める。

1. **X APIから自動取得**（`X_BEARER_TOKEN`必須）: `/own-posts` の「Xから自動取得」でユーザー名を指定すると、本文・いいね・リポスト・返信・投稿日時を自動取得する。表示回数（インプレッション数）は非公開指標のためAPIでは取得できない。
2. **Notion CSVアップロード**: Notionのデータベースに手入力→CSVエクスポート→`/own-posts`からアップロード。列名は `fixtures/notion-template.csv` を参照（本文・投稿日時・表示回数・いいね数・リポスト数・返信数・URL）。表示回数も含めて記録できる。
3. **スクリーンショット取込**: 投稿のスクショをアップロードすると、AI（OpenAI Vision）が本文・投稿日時・表示回数・リポスト数・いいね数を読み取る（読み取り結果は保存前に画面上で確認・修正可能）。

## 主な制約

- X API `search/recent` の仕様上、バズ検索の検索期間は直近7日以内のみ。
- X APIは2026年2月以降、従量課金（$0.005/読み取り、月額契約なし）が新規開発者のデフォルト。検索1回30件取得で約$0.15。月間2M読み取りまでこの単価で、それ以降はEnterpriseが必要。
- 取得した投稿・AI分析結果・改善提案・生成案はSupabaseにキャッシュされ、同じ対象への再実行はデフォルトでキャッシュを返す（コスト対策）。明示的に再実行したい場合はUI上の「再分析」等を使う。
- バズ投稿からのオリジナル投稿案生成は、分析結果の `structureAbstract`（抽象化構造）のみを入力に使い、元投稿の本文はモデルに渡さない設計になっている。

## スクリプト

```bash
npm run dev     # 開発サーバー
npm run build   # 本番ビルド
npm run lint    # ESLint
```
