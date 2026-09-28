import type { OwnPostHook, OwnPostTheme } from "@/types/own-post";

export const THEME_LABELS: Record<OwnPostTheme, string> = {
  inv: "投資",
  fire: "FIRE",
  society: "社会・税金・働き方",
  love: "恋愛・結婚×お金",
  life: "人生論・自己啓発",
  save: "節約・お金の使い方",
  daily: "日常・雑談",
  community: "節目報告・自己紹介",
};

export const HOOK_LABELS: Record<OwnPostHook, string> = {
  ask: "問いかけ",
  aruaru: "あるある",
  data: "数字・データ",
  claim: "断定・問題提起",
  list: "箇条書き",
  story: "体験談",
  greet: "挨拶・報告",
};

export function isOwnPostTheme(value: unknown): value is OwnPostTheme {
  return typeof value === "string" && value in THEME_LABELS;
}

export function isOwnPostHook(value: unknown): value is OwnPostHook {
  return typeof value === "string" && value in HOOK_LABELS;
}
