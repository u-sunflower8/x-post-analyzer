# X Buzz Analyzer

Xのバズ投稿を検索・ランキングし、AIで「なぜ伸びたか」を構造・心理面から分析、
その構造を抽象化してオリジナル投稿案を生成するツール。

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
| `X_BEARER_TOKEN` | [developer.x.com](https://developer.x.com) → App-only Bearer Token（従量課金プランで登録、月額固定費なし。投稿読み取り $0.005/件） |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |

Supabaseのテーブルは `supabase/migrations/0001_init.sql` をSQL Editorで実行して作成する
（Supabase CLIを使う場合は `supabase db push`）。

```bash
npm run dev
```

## 主な制約

- X API `search/recent` の仕様上、検索期間は直近7日以内のみ。
- X APIは2026年2月以降、従量課金（$0.005/読み取り、月額契約なし）が新規開発者のデフォルト。検索1回30件取得で約$0.15。月間2M読み取りまでこの単価で、それ以降はEnterpriseが必要。
- 取得した投稿とAI分析結果はSupabaseにキャッシュされ、同じ投稿への再分析はデフォルトでキャッシュを返す（コスト対策）。
- オリジナル投稿案の生成は、分析結果の `structureAbstract`（抽象化構造）のみを入力に使い、元投稿の本文はモデルに渡さない設計になっている。

## スクリプト

```bash
npm run dev     # 開発サーバー
npm run build   # 本番ビルド
npm run lint    # ESLint
```
