# X Buzz Analyzer

Xの運用を「他人のバズ」と「自分の実績」の両面からAIで分析するツール。

- **バズ投稿検索**: X APIでキーワード検索し、エンゲージメントスコアでランキング。AIで各投稿の構造・心理面を分析し、その構造を抽象化してオリジナル投稿案を生成する（元投稿の文章は生成に使わない）。
- **自分の投稿分析**: 自分の過去投稿をCSV（Notion経由）・スクリーンショット・X APIから集め、ダッシュボードでKPI/傾向を可視化、AIで「勝ちパターン」を抽出、投稿ごとの改善提案、勝ちパターンに基づく次回投稿案の生成を行う。

旧プロジェクト（React+Vite / OpenAI / LocalStorage版）をこのNext.js版に統合した。旧版の要件定義は [要件定義書.md](./要件定義書.md) を参照（自分の投稿分析部分の背景・要件はここに記載されている）。

## 現状（2026-09-27時点）

- **本番URL**: https://x-post-analyzer-gamma.vercel.app （Vercelプロジェクト `x-post-analyzer`, scope `ai-project8`）
- **アプリ全体にBasic認証がかかっている**（自分以外に見せないため）。ユーザー名は空欄でOK、パスワードは`ADMIN_PASSWORD`環境変数の値（Vercelダッシュボード → Settings → Environment Variablesで確認できる）。
- **データベースはNeon Postgres**（後述、2026-09-16にSupabaseから移行済み。Supabaseはもう使っていない）。
- **X API(Bearer Token)は設定済み・PPU(従量課金)で稼働中**。ただしテストで使いすぎてクレジットが枯渇気味なので、`developer.x.com`の「Credits」ページで残高を確認してから使うこと。
- 自分の投稿データは2026-09-27にXのデータアーカイブから取り込み済み（返信・リツイートを除く通常投稿427件。うち6件は以前のCSV取り込み分を表示回数付きで残している）。

## セットアップ

```bash
npm install
cp .env.local.example .env.local
```

`.env.local` に以下を設定する。

| 変数 | 取得元 |
|---|---|
| `DATABASE_URL` ほかNeon関連の変数群 | Vercel Marketplace経由でNeonを導入すると自動生成される（`vercel integration add neon`、または既存プロジェクトなら`vercel env pull`で取得）。DB本体はNeon Postgres。 |
| `X_BEARER_TOKEN` | [developer.x.com](https://developer.x.com) → App-only Bearer Token（従量課金プランで登録、月額固定費なし。投稿読み取り $0.005/件、ユーザー情報読み取り $0.010/件）。未設定でも「自分の投稿」機能（CSV/スクショ取込・ダッシュボード・勝ちパターン分析・改善提案・投稿生成）は利用可能。バズ検索とXからの自動取得のみこのキーが必須。**課金が発生するので、テストで使う際は必ず件数を絞るか事前に確認すること**（実在アカウントの全投稿取得のような操作は数ドル単位で一瞬で消費する）。 |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| `ADMIN_PASSWORD` | 任意の文字列。アプリ全体のBasic認証のパスワードになる（`src/proxy.ts`参照）。 |

Neonのテーブルは `supabase/migrations/` 配下のSQL（ディレクトリ名は移行前の名残だが中身は標準Postgres SQLでNeonでもそのまま使える）を順に適用して作成する。

```bash
node --env-file=.env.local scripts/run-migrations.mjs
```

```bash
npm run dev
```

### Next.js 16の注意点

このリポジトリのNext.jsは`middleware.ts`が非推奨になったバージョンを使っている。ルートは`src/proxy.ts`で、`export function proxy()`という名前でエクスポートする（`middleware`という名前だと動かない）。詳細は`node_modules/next/dist/docs/`配下のドキュメントを参照（`AGENTS.md`にも記載あり）。

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

1. **X APIから自動取得**（`X_BEARER_TOKEN`必須、**課金あり**）: `/own-posts` の「Xから自動取得」でユーザー名を指定すると、本文・いいね・リポスト・返信・投稿日時を自動取得する。表示回数（インプレッション数）は非公開指標のためAPIでは取得できない。投稿1件読み取り$0.005なので、投稿数が多いアカウントの初回一括取得には向かない（数千件あると数ドル〜数十ドルかかる）。新着の数件だけ追加する用途向け。
2. **Xの分析画面からのCSVエクスポート**（X Premium契約が必要、無料枠では出てこない）: 「Export Data」で期間ごと（最大90日分）にCSVをダウンロードして`/own-posts`からアップロード。`src/lib/own-posts/csv.ts`の`COLUMN_ALIASES`がX公式エクスポートの列名（Tweet text / Tweet permalink / time / impressions / likes / retweets / replies等）に対応済み。表示回数も含めて記録できる。
3. **Xのデータアーカイブ**（無料、全アカウント対象）: 設定→アカウント→「データのアーカイブをダウンロード」。リクエストから24〜48時間後にメールでZIPが届く。中の`tweets.js`に全投稿の本文・日時・いいね数・リツイート数・返信数が入っている（表示回数は含まれない）。取り込みは`node --env-file=.env.local scripts/import-x-archive.mjs <展開したフォルダ>/data`（お試し実行）→ 問題なければ末尾に`--apply`を付けて本番書き込み。通常投稿のみ対象（返信・RTは除外）、長文は`note-tweet.js`から全文を復元、返信数・引用数はアーカイブに無いため0のまま。**投稿数が多いアカウントの初回一括インポートはこれが一番安全（無料・Premium不要）**。
4. **Notion CSVアップロード**: Notionのデータベースに手入力→CSVエクスポート→`/own-posts`からアップロード。列名は `fixtures/notion-template.csv` を参照。
5. **スクリーンショット取込**: 投稿のスクショをアップロードすると、AI（OpenAI Vision）が本文・投稿日時・表示回数・リポスト数・いいね数を読み取る（読み取り結果は保存前に画面上で確認・修正可能）。

## 自分の投稿の「ベスト」判定ルール（2026-09-27〜）

- **表示回数（インプレッション）は判定に使わない**（ユーザーの方針）。アーカイブ由来の投稿には表示回数が無く、率で判定すると表示回数付きの数件だけで結果が決まってしまうため。表示回数は画面に表示するだけ。
- **いいねとリツイートは別々に判定する**。合計すると96%がいいねになり、リツイートの傾向が埋もれるため。ベスト時間帯・ベスト曜日は「いいね基準」「リツイート基準」の2つを出す（`bestBucket(buckets, "avgLikes" | "avgReposts")`）。
- 比べる値は1投稿あたりの平均。**投稿が20件未満の時間帯や曜日はベスト判定の対象外**にしている（`MIN_BUCKET_SAMPLE_SIZE`）。数件の偶然の当たりで決まらないようにするため。
- 時間帯・曜日は**日本時間（Asia/Tokyo）**で集計する。サーバー（Vercel）はUTCで動くので、`getHours()`をそのまま使わないこと。
- 勝ちパターン分析（AI）には、いいね上位（`topPosts`）とリツイート上位（`topRepostedPosts`）を分けて渡す。

## 主な制約

- X API `search/recent` の仕様上、バズ検索の検索期間は直近7日以内のみ。
- X APIは2026年2月以降、従量課金（$0.005/読み取り、月額契約なし）が新規開発者のデフォルト。検索1回30件取得で約$0.15。月間2M読み取りまでこの単価で、それ以降はEnterpriseが必要。
- 取得した投稿・AI分析結果・改善提案・生成案はNeonにキャッシュされ、同じ対象への再実行はデフォルトでキャッシュを返す（コスト対策）。明示的に再実行したい場合はUI上の「再分析」等を使う。
- バズ投稿からのオリジナル投稿案生成は、分析結果の `structureAbstract`（抽象化構造）のみを入力に使い、元投稿の本文はモデルに渡さない設計になっている。

## スクリプト

```bash
npm run dev     # 開発サーバー
npm run build   # 本番ビルド
npm run lint    # ESLint
```
