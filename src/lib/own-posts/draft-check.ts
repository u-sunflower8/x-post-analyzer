import type { OwnPostTheme, OwnPostWithMetrics } from "@/types/own-post";
import { median } from "./dashboard";
import { relativeScores } from "./content";
import { MIN_BUCKET_SAMPLE_SIZE } from "./constants";
import { THEME_LABELS } from "./themes";

/**
 * Checks a draft post against what has worked for this account. Every check
 * is judged by the account's own past posts (relative score = likes ÷ median
 * of the previous 30 posts), so the advice follows the data, not generic tips.
 * Rule-based only — no AI call, no cost.
 */

export type CheckStatus = "good" | "ok" | "improve";

export interface DraftCheck {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
  /** How the account's own past posts did for this feature, e.g. "自分比1.41倍・バズ率28%（65件）". */
  evidence: string | null;
}

export interface SimilarPost {
  id: string;
  text: string;
  postedAt: string | null;
  likeCount: number;
  repostCount: number;
  relativeScore: number | null;
  similarity: number;
}

export interface DraftCheckResult {
  score: number;
  /** Theme the check used: the one the user picked, else the keyword guess. */
  theme: OwnPostTheme | null;
  /** True when `theme` came from the keyword guess (right ~60% of the time on past posts). */
  themeGuessed: boolean;
  checks: DraftCheck[];
  similar: SimilarPost[];
}

// Keyword guesses for the draft's topic. Order matters on ties: earlier wins. Only ~60% accurate
// against the hand-labelled posts, so the UI lets the user correct it.
// Weight: words that settle the topic on their own (結婚, 婚活...) count double.
const THEME_KEYWORDS: [OwnPostTheme, RegExp, number][] = [
  ["inv", /NISA|ニーサ|オルカン|S&P|ＳＰ|NASDAQ|FANG|メガ10|株|投資|配当|銘柄|インデックス|積立|積み立て|証券|含み|暴落|ビットコイン|ゴールド|iDeCo|億り人/g, 1],
  ["fire", /FIRE|ファイア|サイドFIRE|資産形成|入金力|不労所得|早期リタイア/g, 1],
  ["love", /結婚|恋愛|恋人|彼氏|彼女|パートナー|夫|妻|婚活|独身|元彼|専業主婦/g, 2],
  ["society", /税金|社会保険|年金|手取り|給料|年収|物価|政府|日本|会社員|残業|副業|最低賃金|少子化|働き方|出社|退職/g, 1],
  ["save", /節約|ポイント|固定費|家計|貯金|ケチ|浪費|買い物|コンビニ/g, 1],
  ["life", /人生|習慣|幸せ|幸福|自己投資|後悔|20代|アラサー/g, 1],
  ["community", /フォロワー|自己紹介|ありがとうございます|#FIRE自己紹介/g, 1],
  ["daily", /おはよう|今日は|ランチ|旅行|休日|カフェ/g, 1],
];

export function guessTheme(text: string): OwnPostTheme | null {
  let best: OwnPostTheme | null = null;
  let bestCount = 0;
  for (const [theme, re, weight] of THEME_KEYWORDS) {
    const count = (text.match(re)?.length ?? 0) * weight;
    if (count > bestCount) {
      best = theme;
      bestCount = count;
    }
  }
  return best;
}

export function hasQuestion(text: string): boolean {
  return /[？?]/.test(text);
}

/** A question that offers choices: "どっち派？", "どれ選ぶ？", or a bullet list of options. */
export function isChoiceQuestion(text: string): boolean {
  if (!hasQuestion(text)) return false;
  const bullets = text.split("\n").filter((line) => /^\s*[・•①-⑩]/.test(line)).length;
  return /どっち|どちら|どれ|派[？?]|選ぶ|選びます/.test(text) || bullets >= 2;
}

export function mentionsKabukura(text: string): boolean {
  return /株クラ/.test(text);
}

function charCount(text: string): number {
  return Array.from(text.trim()).length;
}

type LengthBand = "short" | "medium" | "ideal" | "long";

function lengthBand(text: string): LengthBand {
  const n = charCount(text);
  if (n <= 60) return "short";
  if (n <= 120) return "medium";
  if (n <= 200) return "ideal";
  return "long";
}

const LENGTH_LABELS: Record<LengthBand, string> = {
  short: "60字以下",
  medium: "61〜120字",
  ideal: "121〜200字",
  long: "201字以上",
};

interface GroupStat {
  n: number;
  relativeMedian: number | null;
  buzzShare: number | null;
}

function groupStat(posts: OwnPostWithMetrics[], relative: Map<string, number>): GroupStat {
  const rel = posts.map((p) => relative.get(p.id)).filter((r): r is number => r !== undefined);
  return {
    n: posts.length,
    relativeMedian: rel.length > 0 ? median(rel) : null,
    buzzShare: rel.length > 0 ? rel.filter((r) => r >= 3).length / rel.length : null,
  };
}

function describe(label: string, stat: GroupStat): string {
  if (stat.relativeMedian === null || stat.buzzShare === null) return `${label}：データ不足（${stat.n}件）`;
  return `${label}：自分比${stat.relativeMedian.toFixed(2)}倍・バズ率${Math.round(stat.buzzShare * 100)}%（${stat.n}件）`;
}

function hourInJst(iso: string): number {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", hour: "numeric", hourCycle: "h23" }).format(new Date(iso)),
  );
}

// Character bigrams work for Japanese without a tokenizer.
function bigrams(text: string): Set<string> {
  const chars = Array.from(text.replace(/https?:\/\/\S+/g, "").replace(/[\s、。！!？?・…「」（）()#＃]/g, ""));
  const grams = new Set<string>();
  for (let i = 0; i < chars.length - 1; i++) grams.add(chars[i] + chars[i + 1]);
  return grams;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const g of a) if (b.has(g)) shared++;
  return shared / (a.size + b.size - shared);
}

const SIMILAR_COUNT = 5;
const MIN_SIMILARITY = 0.08;

const STATUS_POINTS: Record<CheckStatus, number> = { good: 2, ok: 1, improve: 0 };

export function checkDraft(
  text: string,
  posts: OwnPostWithMetrics[],
  options: { scheduledHour: number | null; theme: OwnPostTheme | null },
): DraftCheckResult {
  const { scheduledHour } = options;
  const relative = relativeScores(posts);
  const all = groupStat(posts, relative);
  const baseline = all.relativeMedian ?? 1;
  const checks: DraftCheck[] = [];

  // 1. Topic
  const themeGuessed = options.theme === null;
  const theme = options.theme ?? guessTheme(text);
  if (theme) {
    const stat = groupStat(
      posts.filter((p) => p.theme === theme),
      relative,
    );
    const rel = stat.relativeMedian ?? baseline;
    const status: CheckStatus = rel >= baseline * 1.1 ? "good" : rel >= baseline * 0.95 ? "ok" : "improve";
    const advice: Record<CheckStatus, string> = {
      good: `「${THEME_LABELS[theme]}」はあなたの得意テーマです。`,
      ok: `「${THEME_LABELS[theme]}」は平均的な伸び方のテーマです。投資目線や株クラへの問いかけを混ぜると伸びやすくなります。`,
      improve: `「${THEME_LABELS[theme]}」はあなたの投稿では伸びにくいテーマです。投資・FIREの話題に寄せられないか検討してみてください。`,
    };
    checks.push({
      id: "theme",
      label: "テーマ",
      status,
      message:
        advice[status] +
        (theme === "love" ? "（ただし恋愛・結婚×お金はリツイートされやすく、拡散狙いには向いています）" : ""),
      evidence: describe(`あなたの「${THEME_LABELS[theme]}」投稿`, stat),
    });
  } else {
    checks.push({
      id: "theme",
      label: "テーマ",
      status: "ok",
      message: "テーマを自動判定できませんでした。投資・FIREなど得意テーマの言葉が入っているか確認してください。",
      evidence: null,
    });
  }

  // 2. Question style
  const choice = posts.filter((p) => isChoiceQuestion(p.text));
  const freeQuestion = posts.filter((p) => hasQuestion(p.text) && !isChoiceQuestion(p.text));
  const noQuestion = posts.filter((p) => !hasQuestion(p.text));
  if (isChoiceQuestion(text)) {
    checks.push({
      id: "question",
      label: "問いかけ",
      status: "good",
      message: "選択肢つきの問いかけになっています。あなたの投稿でいちばん伸びやすい形です。",
      evidence: describe("選択肢型の質問", groupStat(choice, relative)),
    });
  } else if (hasQuestion(text)) {
    checks.push({
      id: "question",
      label: "問いかけ",
      status: "ok",
      message: "問いかけはありますが、自由回答型です。「A派？B派？」や「・」で選択肢を並べると答えやすくなり、伸びやすくなります。",
      evidence: `${describe("選択肢型", groupStat(choice, relative))} ／ ${describe("自由回答型", groupStat(freeQuestion, relative))}`,
    });
  } else {
    checks.push({
      id: "question",
      label: "問いかけ",
      status: "improve",
      message: "読者への問いかけがありません。最後に選択肢つきの質問（どっち派？など）を足すと、リプが集まりやすくなります。",
      evidence: `${describe("選択肢型", groupStat(choice, relative))} ／ ${describe("問いかけなし", groupStat(noQuestion, relative))}`,
    });
  }

  // 3. Calling out 株クラ
  const kabu = posts.filter((p) => mentionsKabukura(p.text));
  const noKabu = posts.filter((p) => !mentionsKabukura(p.text));
  checks.push(
    mentionsKabukura(text)
      ? {
          id: "kabukura",
          label: "「株クラ」への呼びかけ",
          status: "good",
          message: "「株クラ」への呼びかけが入っています。",
          evidence: describe("「株クラ」入り", groupStat(kabu, relative)),
        }
      : {
          id: "kabukura",
          label: "「株クラ」への呼びかけ",
          status: "improve",
          message: "「株クラのみなさん！」のように呼びかけると、答える人がはっきりして反応が集まりやすくなります。",
          evidence: `${describe("「株クラ」入り", groupStat(kabu, relative))} ／ ${describe("なし", groupStat(noKabu, relative))}`,
        },
  );

  // 4. Length
  const band = lengthBand(text);
  const bandStat = groupStat(
    posts.filter((p) => lengthBand(p.text) === band),
    relative,
  );
  const lengthMessage: Record<LengthBand, [CheckStatus, string]> = {
    short: ["improve", "短めです。一言だけの投稿は伸びにくい傾向があります。理由や具体的な数字を1〜2行足してみてください。"],
    medium: ["ok", "ちょうどよい長さですが、121〜200字のほうが伸びやすい傾向です。"],
    ideal: ["good", "あなたの投稿でいちばん伸びやすい長さ（121〜200字）です。"],
    long: ["ok", "長めです。140字を超えると途中で「さらに表示」になるので、1行目と最初の3行で引きつけられているか確認してください。"],
  };
  checks.push({
    id: "length",
    label: `文字数（${charCount(text)}字）`,
    status: lengthMessage[band][0],
    message: lengthMessage[band][1],
    evidence: describe(`あなたの${LENGTH_LABELS[band]}の投稿`, bandStat),
  });

  // 5. Posting time (optional)
  if (scheduledHour !== null) {
    const byHour = new Map<number, OwnPostWithMetrics[]>();
    for (const p of posts) {
      if (!p.postedAt) continue;
      const h = hourInJst(p.postedAt);
      byHour.set(h, [...(byHour.get(h) ?? []), p]);
    }
    const ranked = Array.from(byHour.entries())
      .filter(([, group]) => group.length >= MIN_BUCKET_SAMPLE_SIZE)
      .map(([h, group]) => ({ h, stat: groupStat(group, relative), avgLikes: median(group.map((p) => p.likeCount)) }))
      .sort((a, b) => b.avgLikes - a.avgLikes);
    const best = ranked.slice(0, 2).map((r) => r.h);
    const mine = byHour.get(scheduledHour) ?? [];
    const bestLabel = best.map((h) => `${h}時台`).join("・");
    checks.push({
      id: "hour",
      label: `投稿時間（${scheduledHour}時台）`,
      status: best.includes(scheduledHour) ? "good" : mine.length >= MIN_BUCKET_SAMPLE_SIZE ? "ok" : "improve",
      message: best.includes(scheduledHour)
        ? "伸びやすい時間帯です。"
        : `あなたの投稿でよく伸びているのは${bestLabel}です。`,
      evidence:
        mine.length > 0
          ? `${scheduledHour}時台のいいね中央値 ${median(mine.map((p) => p.likeCount))}（${mine.length}件）`
          : `${scheduledHour}時台に投稿した実績はまだありません`,
    });
  }

  const score = Math.round(
    (checks.reduce((sum, c) => sum + STATUS_POINTS[c.status], 0) / (checks.length * STATUS_POINTS.good)) * 100,
  );

  // Similar past posts, to see how this kind of post has done before.
  const draftGrams = bigrams(text);
  const similar = posts
    .map((p) => ({ post: p, similarity: jaccard(draftGrams, bigrams(p.text)) }))
    .filter((s) => s.similarity >= MIN_SIMILARITY)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, SIMILAR_COUNT)
    .map(({ post, similarity }) => ({
      id: post.id,
      text: post.text,
      postedAt: post.postedAt,
      likeCount: post.likeCount,
      repostCount: post.repostCount,
      relativeScore: relative.get(post.id) ?? null,
      similarity,
    }));

  return { score, theme, themeGuessed, checks, similar };
}
