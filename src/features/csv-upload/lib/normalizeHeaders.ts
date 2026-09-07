import type { Post } from '@/shared/types/post';

export function normalizeHeaderName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[:：]+$/, '');
}

type NumericField =
  | 'impressions'
  | 'engagements'
  | 'retweets'
  | 'replies'
  | 'likes'
  | 'userProfileClicks'
  | 'urlClicks'
  | 'hashtagClicks'
  | 'detailExpands'
  | 'permalinkClicks'
  | 'appOpens'
  | 'appInstalls'
  | 'follows'
  | 'mediaViews'
  | 'mediaEngagements';

/** Canonical Post field -> known CSV header variants (X Analytics export + Japanese aliases), already normalized. */
export const COLUMN_ALIASES: Record<
  'id' | 'permalink' | 'text' | 'createdAt' | 'promoted' | NumericField,
  string[]
> = {
  id: ['tweet id', 'id', '投稿id', 'ツイートid'],
  permalink: ['tweet permalink', 'permalink', 'url', '投稿url', 'ツイートurl'],
  text: ['tweet text', 'text', '本文', '投稿内容', 'ツイート本文'],
  createdAt: ['time', 'created at', 'date', '日時', '投稿日時', 'ツイート日時'],
  promoted: ['promoted', 'プロモーション'],
  impressions: [
    'impressions', 'impression count', 'views', 'view count',
    'インプレッション数', 'インプレッション', '表示回数', '閲覧数',
  ],
  engagements: ['engagements', 'engagement count', 'エンゲージメント数'],
  retweets: ['retweets', 'retweet count', 'reposts', 'repost count', 'リツイート数', 'リポスト数'],
  replies: ['replies', 'reply count', '返信数', 'リプライ数'],
  likes: ['likes', 'like count', 'いいね数'],
  userProfileClicks: ['user profile clicks', 'profile visits', 'プロフィールクリック数', 'プロフィールへのアクセス'],
  urlClicks: ['url clicks', 'urlクリック数'],
  hashtagClicks: ['hashtag clicks', 'ハッシュタグクリック数'],
  detailExpands: ['detail expands', '詳細表示数'],
  permalinkClicks: ['permalink clicks', 'パーマリンククリック数'],
  appOpens: ['app opens', 'アプリを開いた回数'],
  appInstalls: ['app installs', 'アプリインストール数'],
  follows: ['follows', 'new follows', 'フォロー数'],
  mediaViews: ['media views', 'メディア再生数'],
  mediaEngagements: ['media engagements', 'メディアエンゲージメント数'],
};

/** Finds the raw (non-empty) string value for a canonical field's first matching alias present in the row. */
export function getRawValue(
  row: Record<string, string>,
  field: keyof typeof COLUMN_ALIASES,
): string | undefined {
  for (const alias of COLUMN_ALIASES[field]) {
    const value = row[alias];
    if (value !== undefined && value.trim() !== '') return value.trim();
  }
  return undefined;
}

export function parseNumber(raw: string | undefined): number {
  if (raw === undefined) return 0;
  const cleaned = raw.replace(/[,%]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  return ['true', 'yes', '1', 'はい', '有'].includes(raw.trim().toLowerCase());
}

const TWITTER_DATE_RE = /^\w{3} (\w{3}) (\d{2}) (\d{2}):(\d{2}):(\d{2}) ([+-])(\d{2})(\d{2}) (\d{4})$/;
const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/** Parses ISO strings, "YYYY-MM-DD HH:mm[:ss]", and Twitter's native "Thu Jul 29 12:34:56 +0000 2026" format. */
export function parseTimestamp(raw: string | undefined): string | null {
  if (raw === undefined) return null;

  const twitterMatch = TWITTER_DATE_RE.exec(raw);
  if (twitterMatch) {
    const [, monthName, day, hour, minute, second, offsetSign, offsetHour, offsetMinute, year] =
      twitterMatch;
    const month = MONTH_MAP[monthName];
    if (month !== undefined) {
      const offsetMinutesTotal =
        (Number(offsetHour) * 60 + Number(offsetMinute)) * (offsetSign === '-' ? -1 : 1);
      const utcMillis =
        Date.UTC(Number(year), month, Number(day), Number(hour), Number(minute), Number(second)) -
        offsetMinutesTotal * 60_000;
      return Number.isNaN(utcMillis) ? null : new Date(utcMillis).toISOString();
    }
  }

  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(raw) ? raw.replace(' ', 'T') : raw;
  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  return Array.from(new Set(matches));
}

export function extractMentions(text: string): string[] {
  const matches = text.match(/@[A-Za-z0-9_]+/g) ?? [];
  return Array.from(new Set(matches));
}

export interface MappedRow {
  post: Post;
  hasAnyEngagementField: boolean;
}

let fallbackIdCounter = 0;

export function mapRowToPost(row: Record<string, string>): MappedRow {
  const text = getRawValue(row, 'text') ?? '';
  const createdAt = parseTimestamp(getRawValue(row, 'createdAt'));
  const id = getRawValue(row, 'id') ?? `row-${(fallbackIdCounter += 1)}`;

  const numericFields: Record<NumericField, number> = {
    impressions: parseNumber(getRawValue(row, 'impressions')),
    engagements: parseNumber(getRawValue(row, 'engagements')),
    retweets: parseNumber(getRawValue(row, 'retweets')),
    replies: parseNumber(getRawValue(row, 'replies')),
    likes: parseNumber(getRawValue(row, 'likes')),
    userProfileClicks: parseNumber(getRawValue(row, 'userProfileClicks')),
    urlClicks: parseNumber(getRawValue(row, 'urlClicks')),
    hashtagClicks: parseNumber(getRawValue(row, 'hashtagClicks')),
    detailExpands: parseNumber(getRawValue(row, 'detailExpands')),
    permalinkClicks: parseNumber(getRawValue(row, 'permalinkClicks')),
    appOpens: parseNumber(getRawValue(row, 'appOpens')),
    appInstalls: parseNumber(getRawValue(row, 'appInstalls')),
    follows: parseNumber(getRawValue(row, 'follows')),
    mediaViews: parseNumber(getRawValue(row, 'mediaViews')),
    mediaEngagements: parseNumber(getRawValue(row, 'mediaEngagements')),
  };

  const coreEngagementFields: (keyof typeof numericFields)[] = [
    'impressions',
    'engagements',
    'likes',
    'retweets',
    'replies',
  ];
  const hasAnyEngagementField = coreEngagementFields.some(
    (field) => getRawValue(row, field) !== undefined,
  );

  // 手動収集データ(公開されているいいね/リツイート/返信数のみ)には合計の「engagements」列が
  // 無いことが多いため、その場合は内訳の合計で代替する。
  if (numericFields.engagements === 0) {
    numericFields.engagements = numericFields.likes + numericFields.retweets + numericFields.replies;
  }

  const post: Post = {
    id,
    permalink: getRawValue(row, 'permalink') ?? null,
    text,
    createdAt: createdAt ?? '',
    ...numericFields,
    isPromoted: parseBoolean(getRawValue(row, 'promoted')),
    charCount: Array.from(text).length,
    hashtags: extractHashtags(text),
    mentions: extractMentions(text),
    hasMedia: numericFields.mediaViews > 0 || numericFields.mediaEngagements > 0,
  };

  return { post, hasAnyEngagementField };
}
